import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import { format, addDays } from 'date-fns';

const API_KEY = '8707pwmVK1CpaBlGBwI8kAl0ggd5gsvKqaLKDcFy';

type Asteroid = {
  name: string;
  close_approach_data: {
    close_approach_date: string;
    close_approach_date_full?: string;
    epoch_date_close_approach: number;
    relative_velocity: { kilometers_per_hour: string };
    miss_distance: { kilometers: string };
  }[];
};

type NEOResponse = {
  near_earth_objects: {
    [date: string]: Asteroid[];
  };
};

type DayAsteroids = {
  date: string;
  asteroids: Asteroid[];
};

export default function App() {
  const [asteroidsData, setAsteroidsData] = useState<DayAsteroids[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');

    fetchAsteroids(today, nextWeek);
    registerForPushNotificationsAsync();
  }, []);

  const fetchAsteroids = async (startDate: string, endDate: string) => {
    try {
      const response = await axios.get<NEOResponse>(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`
      );

      const data = response.data.near_earth_objects;
      const formattedData: DayAsteroids[] = Object.keys(data).map((date) => ({
        date,
        asteroids: data[date],
      }));

      formattedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setAsteroidsData(formattedData);
      setLoading(false);
    } catch (error) {
      alert('Error fetching asteroids: ' + error);
    }
  };


  const registerForPushNotificationsAsync = async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission to access notifications was denied');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId: '8568f356-1188-4416-bd31-1f1af3d487c0' })).data;
    console.log('Notification Token:', token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  const parseCustomDate = (dateString: string) => {
    const months: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };

    const [datePart, timePart] = dateString.split(' ');
    const [year, monthAbbr, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');

    const month = months[monthAbbr];

    return new Date(
      parseInt(year),
      month,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
  };

  const scheduleNotification = (asteroid: Asteroid) => {
    const closestApproach = parseCustomDate(asteroid.close_approach_data[0].close_approach_date_full || asteroid.close_approach_data[0].close_approach_date);
    const notificationTime = new Date(closestApproach.getTime() - 30 * 60 * 1000);

    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Asteroid Alert!',
        body: `Asteroid ${asteroid.name} is approaching Earth soon!`,
      },
      trigger: { date: notificationTime },
    });

    Alert.alert('Notification set 30 minutes before closest approach!');
  };

  const handleAsteroidPress = (asteroid: Asteroid) => {
    Alert.alert(
      `Asteroid: ${asteroid.name}`,
      `Miss Distance: ${asteroid.close_approach_data[0].miss_distance.kilometers} km\nSpeed: ${asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour} km/h`,
      [
        {
          text: 'Set Notification',
          onPress: () => scheduleNotification(asteroid),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const parseApproachTime = (asteroid: Asteroid) => {
    const closeApproach = asteroid.close_approach_data[0];
    const dateString = closeApproach.close_approach_date_full || closeApproach.close_approach_date;

    if (!dateString) return 'Invalid Date';

    try {
      const parsedDate = parseCustomDate(dateString);
      return format(parsedDate, 'HH:mm');
    } catch (error) {
      console.error('Date parsing error:', error, 'Date String:', dateString);
      return 'Invalid Time';
    }
  };

  const renderDayAsteroids = (dayAsteroids: DayAsteroids) => {
    const date = format(new Date(dayAsteroids.date), 'eeee, MMMM do');

    return (
      <View key={dayAsteroids.date} style={{ marginVertical: 10, padding: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{date}</Text>
        {dayAsteroids.asteroids.map((asteroid) => {
          const approachTime = parseApproachTime(asteroid);
          return (
            <TouchableOpacity
              key={asteroid.name}
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                marginBottom: 5,
              }}
              onPress={() => handleAsteroidPress(asteroid)}
            >
              <Text>🪐 {asteroid.name}</Text>
              <Text>Closest at: {approachTime}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderWeekView = () => {
    return (
      <ScrollView>
        <ScrollView horizontal contentContainerStyle={{ padding: 10 }}>
          {asteroidsData.map((dayAsteroids) => (
            <View
              key={dayAsteroids.date}
              style={{
                width: 250,
                padding: 10,
                backgroundColor: '#f5f5f5',
                marginHorizontal: 5,
                borderRadius: 10,
              }}
            >
              {renderDayAsteroids(dayAsteroids)}
            </View>
          ))}
        </ScrollView>
      </ScrollView>

    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        Near Earth Asteroids - 7 Day Calendar
      </Text>

      {renderWeekView()}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})