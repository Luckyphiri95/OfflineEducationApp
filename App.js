
// App.js
// Entry point of the app. Just loads the navigator which handles all screens.
 
import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';
import OfflineBanner from './components/OfflineBanner';
import SyncManager from './components/SyncManager';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SyncManager />
      <OfflineBanner />
      <View style={{ flex: 1 }}>
        <AppNavigator />
      </View>
    </GestureHandlerRootView>
  );
}