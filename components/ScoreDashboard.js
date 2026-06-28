import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

/**
 * ScoreDashboard — displays the quiz result summary.
 * Shows a circular score ring, a passed/failed badge, and a stats row.
 * Props:
 *   score      {number} — number of correct answers
 *   total      {number} — total number of questions
 */
export default function ScoreDashboard({ score = 0, total = 0 }) {
  const wrong = total - score;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 50;

  return (
    <View style={styles.container}>
      {/* Circular score ring */}
      <View style={[styles.ring, passed ? styles.ringPass : styles.ringFail]}>
        <Text style={styles.ringScore}>{score}/{total}</Text>
        <Text style={styles.ringLabel}>Score</Text>
      </View>

      {/* Passed / Failed badge */}
      <View style={[styles.badge, passed ? styles.badgePass : styles.badgeFail]}>
        <Text style={[styles.badgeText, passed ? styles.badgeTextPass : styles.badgeTextFail]}>
          {passed ? '✓ PASSED' : '✗ FAILED'}
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{score}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.error }]}>{wrong}</Text>
          <Text style={styles.statLabel}>Wrong</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: passed ? colors.badgeSuccessText : colors.error }]}>
            {percentage}%
          </Text>
          <Text style={styles.statLabel}>Grade</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  ringPass: { borderColor: colors.badgeSuccessText },
  ringFail: { borderColor: colors.error },
  ringScore: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  ringLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 24,
  },
  badgePass: { backgroundColor: colors.badgeSuccess },
  badgeFail: { backgroundColor: colors.badgeError },
  badgeText: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  badgeTextPass: { color: colors.badgeSuccessText },
  badgeTextFail: { color: colors.badgeErrorText },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  statCard: {
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
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
