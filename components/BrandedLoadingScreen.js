import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import colors from '../theme/colors';

export default function BrandedLoadingScreen() {
  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandNavy} />
      <Image
        source={require('../assets/mzansigo-logo-navy.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={colors.brandGold} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.brandNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 260,
    height: 260,
  },
  spinner: {
    marginTop: 24,
  },
});
