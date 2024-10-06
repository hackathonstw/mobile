import React, { useState, useEffect } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MapScreen from './MapScreen';
import CalendarScreen from './CalendarScreen';
import { StyleSheet, View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

const Tab = createMaterialTopTabNavigator();

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator>
        <Tab.Screen name="MapScreen" component={MapScreen} options={{ title: 'Notherns Map' }} />
        <Tab.Screen name="CalendarScreen" component={CalendarScreen} options={{ title: 'Asteroids Calendar' }} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1
  }
})