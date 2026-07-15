import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import colors from '../theme/colors';
import { subscribeToConnectivity } from '../utils/network';

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToConnectivity(setOnline);
    return unsubscribe;
  }, []);

  if (online) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.banner}>
        <Text style={styles.text}>You're offline — showing saved content</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.badgeWarning },
  banner: {
    backgroundColor: colors.badgeWarning,
    paddingVertical: 6,
    alignItems: 'center',
  },
  text: {
    color: colors.badgeWarningText,
    fontSize: 12,
    fontWeight: '700',
  },
});
