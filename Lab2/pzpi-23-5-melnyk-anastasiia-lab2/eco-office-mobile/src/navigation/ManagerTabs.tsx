import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DashboardScreen } from '../screens/manager/DashboardScreen';
import { TeamTasksScreen } from '../screens/manager/TeamTasksScreen';
import { LocationsScreen } from '../screens/manager/LocationsScreen'; // Додали імпорт
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const ManagerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32', 
        tabBarInactiveTintColor: 'gray',
        headerShown: false, 
        tabBarStyle: { 
          paddingBottom: 5, 
          paddingTop: 5, 
          height: 60 
        }
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Головна',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Locations" 
        component={LocationsScreen} 
        options={{
          tabBarLabel: 'Кімнати',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="floor-plan" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TeamTasksScreen} 
        options={{
          tabBarLabel: 'Завдання',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-check-outline" color={color} size={size} />
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