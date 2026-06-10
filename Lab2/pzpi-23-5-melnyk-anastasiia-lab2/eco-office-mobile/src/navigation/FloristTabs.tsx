import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MonitoringScreen } from '../screens/florist/MonitoringScreen';
import { SpeciesScreen } from '../screens/florist/SpeciesScreen';
import { TeamTasksScreen } from '../screens/manager/TeamTasksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const FloristTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >

      <Tab.Screen
        name="Monitoring"
        component={MonitoringScreen}
        options={{
          tabBarLabel: 'Моніторинг',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="leaf"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Species"
        component={SpeciesScreen}
        options={{
          tabBarLabel: 'Довідник',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="book-open-page-variant"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Tasks"
        component={TeamTasksScreen}
        options={{
          tabBarLabel: 'Завдання',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="clipboard-check"
              color={color}
              size={size}
            />
          ),
        }}
      />

        <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{
                  tabBarLabel: 'Профіль',
                  tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="account-outline" color={color} size={size} />
                  ),
                }}
              />
    </Tab.Navigator>
  );
};