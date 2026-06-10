import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuthStore } from '../store/useAuthStore';


import { TeamTasksScreen } from '../screens/manager/TeamTasksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();



export const CleanerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
      }}
    >
      <Tab.Screen
        name="Tasks"
        component={TeamTasksScreen}
        options={{
          tabBarLabel: 'Мої завдання',
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