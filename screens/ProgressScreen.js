import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import BottomNav from '../components/BottomNav';
import Loader from '../components/Loader';
import BASE_URL from '../config';

function ProgressBar({ pct }) {
  const barColor = pct >= 80 ? colors.badgeSuccessText : pct >= 50 ? colors.primary : colors.badgeWarningText;
  return (
    <View style={pb.track}>
      <View style={[pb.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
    </View>
  );
}

const pb = StyleSheet.create({
  track: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, marginHorizontal: 10 },
  fill: { height: 6, borderRadius: 3 },
});

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProgressScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [subjectRes, resultsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/subjects`).then((r) => r.json()),
        fetch(`${BASE_URL}/api/results`).then((r) => r.json()),
      ]);

      setSubjects(subjectRes);

      // Filter to this user's results only
      const userResults = user?.id
        ? resultsRes.filter((r) => r.user_id === user.id)
        : resultsRes;

      // Sort newest first by id
      setResults(userResults.sort((a, b) => b.id - a.id));
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); loadData(); };

  // Build a subject name lookup map
  const subjectNameMap = {};
  subjects.forEach((s) => { subjectNameMap[s.id] = s.name; });

  // Latest result per subject for the performance bars
  const latestBySubject = {};
  results.forEach((r) => {
    if (!latestBySubject[r.subject_id]) latestBySubject[r.subject_id] = r;
  });

  // Stats
  const quizCount = results.length;
  const avgScore = quizCount > 0
    ? Math.round(results.reduce((sum, r) => sum + Math.round((r.score / r.total_questions) * 100), 0) / quizCount)
    : null;

  // Subject performance rows — only subjects that have at least one result
  const performanceRows = Object.values(latestBySubject).map((r) => ({
    subjectId: r.subject_id,
    name: subjectNameMap[r.subject_id] || `Subject ${r.subject_id}`,
    pct: r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0,
  }));

  // Recent quizzes — all results, newest first, with subject name and score %
  const recentQuizzes = results.slice(0, 10).map((r) => ({
    id: r.id,
    subject: subjectNameMap[r.subject_id] || `Subject ${r.subject_id}`,
    pct: r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0,
    date: formatDate(r.completed_at),
  }));

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>My Progress</Text>
        <Text style={styles.headerSub}>Track your learning performance</Text>
      </View>

      {loading ? (
        <Loader message="Loading progress..." />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{quizCount}</Text>
              <Text style={styles.statLabel}>Quizzes Taken</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{avgScore !== null ? `${avgScore}%` : '—'}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>

          {/* Subject Performance */}
          <Text style={styles.sectionTitle}>Subject Performance</Text>
          {performanceRows.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No quiz results yet. Start a quiz to track your progress.</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {performanceRows.map((row, i) => (
                <View
                  key={row.subjectId}
                  style={[styles.perfRow, i < performanceRows.length - 1 && styles.perfRowBorder]}
                >
                  <Text style={styles.perfName} numberOfLines={1}>{row.name}</Text>
                  <ProgressBar pct={row.pct} />
                  <Text style={styles.perfPct}>{row.pct}%</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recent Quizzes */}
          <Text style={styles.sectionTitle}>Recent Quizzes</Text>
          {recentQuizzes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent quizzes.</Text>
            </View>
          ) : (
            recentQuizzes.map((q) => {
              const passed = q.pct >= 50;
              return (
                <View key={q.id} style={styles.quizCard}>
                  <View>
                    <Text style={styles.quizSubject}>{q.subject}</Text>
                    <Text style={styles.quizDate}>{q.date}</Text>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: passed ? colors.badgeSuccess : colors.badgeError }]}>
                    <Text style={[styles.scoreText, { color: passed ? colors.badgeSuccessText : colors.badgeErrorText }]}>
                      {q.pct}%
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <BottomNav current="Progress" navigation={navigation} user={user} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  blueHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 28,
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 14,
    padding: 18, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statValue: { color: colors.primary, fontSize: 28, fontWeight: '700' },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  perfRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  perfRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  perfName: { width: 110, fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  perfPct: { width: 38, fontSize: 12, color: colors.textSecondary, fontWeight: '600', textAlign: 'right' },
  quizCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 16, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  quizSubject: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  quizDate: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  scoreBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  scoreText: { fontSize: 14, fontWeight: '700' },
  emptyCard: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 24, alignItems: 'center', marginBottom: 24,
  },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
