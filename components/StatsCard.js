import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

/**
 * StatsCard — displays a single stat metric (value + label).
 * Props:
 *   value  {string}  — the number or text to display prominently
 *   label  {string}  — the caption below the value
 *   color  {string}  — optional override for the value color (defaults to primary)
 */
export default function StatsCard({ value, label, color }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, color ? { color } : null]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
