// AppNavigator.js
// This file defines all the screens in the app and how to navigate between them.
// Stack Navigator = screens stack on top of each other (like a pile of cards)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import all auth screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// createStackNavigator gives us Stack.Navigator and Stack.Screen components
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    // NavigationContainer is the root wrapper — required by React Navigation
    <NavigationContainer>
      <Stack.Navigator
        // The first screen listed here is the one that loads on app open
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // Hide the default top header on all screens
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
