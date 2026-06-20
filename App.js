
// App.js
// Entry point of the app. Just loads the navigator which handles all screens.
 
import 'react-native-gesture-handler'; // Must be the FIRST import for React Navigation to work
import React from 'react';
import AppNavigator from './navigation/AppNavigator';
 
export default function App() {
  return <AppNavigator />;
}