import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

/**
 * ProgressCard — subject card showing name, status badge, description and progress bar.
 * Props:
 *   name        {string}   — subject name
 *   description {string}   — short subject description (optional)
 *   status      {string}   — 'Complete' | 'In Progress' | 'Started'
 *   progress    {number}   — 0–100 percentage
 *   onPress     {function} — tap handler
 */

const STATUS_STYLES = {
  Complete:    { bg: colors.badgeSuccess,  text: colors.badgeSuccessText },
  'In Progress': { bg: colors.badgeInfo,   text: colors.badgeInfoText },
  Started:     { bg: colors.badgeWarning,  text: colors.badgeWarningText },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Started;
  return (
    <View style={[badge.wrap, { backgroundColor: s.bg }]}>
      <Text style={[badge.text, { color: s.text }]}>{status}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700' },
});

export default function ProgressCard({ name, description, status = 'Started', progress = 0, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <StatusBadge status={status} />
      </View>

      {description ? (
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
      ) : null}

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressPct}>{progress}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressPct: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
});
