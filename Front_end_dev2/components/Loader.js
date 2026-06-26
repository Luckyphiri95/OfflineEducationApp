import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function Loader({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 14,
    color: colors.textSecondary,
    fontSize: 15,
  },
});