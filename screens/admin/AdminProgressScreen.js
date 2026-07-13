import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar, Platform, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import BASE_URL from '../../config';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function ProgressBar({ pct }) {
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, pct))}%` }]} />
    </View>
  );
}

function calculateOverallProgress(entries) {
  const withContent = (Array.isArray(entries) ? entries : []).filter((row) => row.total > 0);
  if (withContent.length === 0) {
    return { pct: 0, completedSubjects: 0, subjectCount: 0, status: 'Not Started' };
  }

  const completedSubjects = withContent.filter((row) => row.pct >= 100).length;
  const averagePct = Math.round(withContent.reduce((sum, row) => sum + row.pct, 0) / withContent.length);

  let status = 'In Progress';
  if (averagePct >= 100) status = 'Complete';
  else if (averagePct <= 0) status = 'Not Started';

  return {
    pct: averagePct,
    completedSubjects,
    subjectCount: withContent.length,
    status,
  };
}

export default function AdminProgressScreen({ navigation, route }) {
  const { user: currentUser } = route.params || {};
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const usersRes = await fetch(`${BASE_URL}/api/auth/users`).then((r) => r.json());
      const users = Array.isArray(usersRes) ? usersRes : [];

      const learnerData = await Promise.all(
        users.map(async (learner) => {
          const progressRes = await fetch(`${BASE_URL}/api/progress?user_id=${learner.id}`).then((r) => r.json());
          const overall = calculateOverallProgress(Array.isArray(progressRes) ? progressRes : []);
          return {
            ...learner,
            progressPct: overall.pct,
            completedSubjects: overall.completedSubjects,
            subjectCount: overall.subjectCount,
            status: overall.status,
          };
        })
      );

      setLearners(
        learnerData.sort((a, b) => (b.progressPct || 0) - (a.progressPct || 0))
      );
    } catch {
      setLearners([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  const renderItem = ({ item }) => {
    const isSelf = item.id === currentUser?.id;
    return (
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.username?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.rowText}>
          <View style={styles.nameRow}>
            <Text style={styles.rowName}>{item.username}</Text>
            {item.is_admin ? (
              <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>
            ) : null}
            {isSelf ? (
              <View style={styles.selfBadge}><Text style={styles.selfBadgeText}>You</Text></View>
            ) : null}
          </View>
          <Text style={styles.rowEmail}>{item.email}</Text>
          <Text style={styles.rowMeta}>Joined {formatDate(item.created_at)}</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{item.status}</Text>
            <Text style={styles.progressPct}>{item.progressPct}%</Text>
          </View>
          <ProgressBar pct={item.progressPct} />
          <Text style={styles.rowMeta}>
            {item.completedSubjects}/{item.subjectCount || 0} subject{item.subjectCount === 1 ? '' : 's'} completed
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.blueHeader}>
        <Text style={styles.backText} onPress={() => navigation.goBack()}>← Back</Text>
        <Text style={styles.headerTitle}>Learner Progress</Text>
        <Text style={styles.headerSub}>Track how students are progressing through the content</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Loading learner progress...</Text>
        </View>
      ) : (
        <FlatList
          data={learners}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No learner progress available yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  blueHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 20,
  },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '500', marginBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  rowText: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  rowMeta: { fontSize: 11, color: colors.placeholder, marginTop: 3 },
  adminBadge: {
    backgroundColor: colors.badgeInfo,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminBadgeText: { fontSize: 10, fontWeight: '700', color: colors.badgeInfoText },
  selfBadge: {
    backgroundColor: colors.badgeSuccess,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  selfBadgeText: { fontSize: 10, fontWeight: '700', color: colors.badgeSuccessText },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressLabel: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  progressPct: { fontSize: 12, fontWeight: '700', color: colors.primary },
  barTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  barFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 12, fontSize: 14 },
});
