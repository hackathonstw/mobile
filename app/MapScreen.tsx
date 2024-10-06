import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import React from 'react'
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';

const MapScreen = () => {
    const [auroraData, setAuroraData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [asteroidData, setAsteroidData] = useState<any>(null);

    const fetchAuroraData = async () => {
        try {
            const response = await axios.get('https://aurora.hendrikpeter.net/api/aurora_data.json');
            setAuroraData(response.data.locations);
            setLoading(false);
        } catch (error) {
            alert('Error fetching Aurora data: ' + error);
        }
    };

    // const fetchAsteroidData = async () => {
    //     const today = new Date();
    //     const nextFewDays = new Date(today);
    //     nextFewDays.setDate(today.getDate() + 7); // Fetch for the next 7 days

    //     const startDate = today.toISOString().split('T')[0]; // Get YYYY-MM-DD
    //     const endDate = nextFewDays.toISOString().split('T')[0]; // Get YYYY-MM-DD

    //     try {
    //         const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=8707pwmVK1CpaBlGBwI8kAl0ggd5gsvKqaLKDcFy`;
    //         const response = await axios.get(url);
    //         setAsteroidData(response.data.near_earth_objects); // Contains asteroids for today
    //     } catch (error) {
    //         alert('Error fetching Asteroid data: ' + error);
    //     }
    // };

    useEffect(() => {
        fetchAuroraData();
        //fetchAsteroidData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 52.0693,
                    longitude: 19.4803,
                    latitudeDelta: 50,
                    longitudeDelta: 50,
                }}
            >
                {auroraData &&
                    Object.keys(auroraData).map((key) => {
                        const location = auroraData[key];
                        return (
                            <Marker
                                key={key}
                                coordinate={{
                                    latitude: location.lat,
                                    longitude: location.long,
                                }}
                                title={`Aurora: ${location.human_readable_name}`}
                                description={`KP Index: ${location.kp}, Avg Deviation: ${location.average_deviation}`}
                            />
                        );
                    })}

                {/* {asteroidData && Object.keys(asteroidData).map((date) => {
                    const asteroids = asteroidData[date];
                    return asteroids.map((asteroid: any) => (
                        <Marker
                            pinColor={'green'}
                            key={asteroid.id}
                            coordinate={{
                                latitude: asteroid.close_approach_data[0].miss_distance.kilometers * 1e-5, // Roughly simulate latitude
                                longitude: asteroid.close_approach_data[0].miss_distance.kilometers * 1e-5, // Roughly simulate longitude
                            }}
                            title={`Asteroid: ${asteroid.name}`}
                            description={`Close Approach Date: ${asteroid.close_approach_data[0].close_approach_date}`}
                        />
                    ));
                })} */}
            </MapView>
        </View>
    )
}

export default MapScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});