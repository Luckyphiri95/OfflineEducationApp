import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import colors from '../theme/colors';

export default function BrandedLoadingScreen() {
  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandBlue} />
      <Image
        source={require('../assets/mzansigo-icon.png')}
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
    backgroundColor: colors.brandBlue,
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
