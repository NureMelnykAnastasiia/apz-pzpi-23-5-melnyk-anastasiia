import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

import { ManagerTabs } from './ManagerTabs';
import { FloristTabs } from './FloristTabs';
import { CleanerTabs } from './CleanerTabs';

const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

export const RootNavigator = () => {
  const { token, user } = useAuthStore();

  return (
    <NavigationContainer>
      {!token ? (
        <AuthNavigator />
      ) : (
        <>
          {(user?.role === 'ADMIN' || user?.role === 'OFFICE_MANAGER') && <ManagerTabs />}
          {user?.role === 'FLORIST' && <FloristTabs />}
          {user?.role === 'CLEANER' && <CleanerTabs />}
         
          {!['ADMIN', 'OFFICE_MANAGER', 'FLORIST', 'CLEANER'].includes(user?.role || '') && (
            <AuthNavigator />
          )}
        </>
      )}
    </NavigationContainer>
  );
};