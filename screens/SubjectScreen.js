import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, StatusBar, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import Loader from '../components/Loader';
import SearchSubjects from '../components/SearchSubjects';
import BottomNav from '../components/BottomNav';
import { fetchProgressMap, getSubjectProgress } from '../utils/progress';
import BASE_URL from '../config';

const FILTERS = ['All', 'In Progress', 'Done'];

function StatusBadge({ status }) {
  const map = {
    Complete:      { bg: colors.badgeSuccess,  text: colors.badgeSuccessText },
    'In Progress': { bg: colors.badgeInfo,     text: colors.badgeInfoText },
    Started:       { bg: colors.badgeWarning,  text: colors.badgeWarningText },
    'Not Started': { bg: colors.border,        text: colors.textSecondary },
  };
  const s = map[status] || map['Not Started'];
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

function ProgressBar({ pct }) {
  return (
    <View style={pb.track}>
      <View style={[pb.fill, { width: `${pct}%` }]} />
    </View>
  );
}

const pb = StyleSheet.create({
  track: { flex: 1, height: 5, backgroundColor: colors.border, borderRadius: 3 },
  fill: { height: 5, backgroundColor: colors.primary, borderRadius: 3 },
});

export default function SubjectScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [subjects, setSubjects] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [subjectRes, progress] = await Promise.all([
        fetch(`${BASE_URL}/api/subjects`).then((r) => r.json()),
        fetchProgressMap(user?.id),
      ]);
      setSubjects(subjectRes);
      setProgressMap(progress);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload whenever screen comes back into focus (after finishing a quiz)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const filtered = subjects.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const { status } = getSubjectProgress(progressMap, s.id);
    if (filter === 'In Progress') return matchSearch && status === 'In Progress';
    if (filter === 'Done') return matchSearch && status === 'Complete';
    return matchSearch;
  });

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Blue header */}
      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>Subjects</Text>
        <Text style={styles.headerSub}>Find the topic you want to study today</Text>
      </View>

      <View style={styles.body}>
        <SearchSubjects value={search} onChangeText={setSearch} />

        {/* Filter chips */}
        <View style={styles.chips}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <Loader message="Loading subjects..." />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search ? `No subjects match "${search}"` : 'No subjects in this category.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            renderItem={({ item }) => {
              const { pct, status } = getSubjectProgress(progressMap, item.id);
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('SubjectDetails', { subject: item, user })}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <StatusBadge status={status} />
                  </View>
                  {item.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                  ) : null}
                  <View style={styles.progressRow}>
                    <ProgressBar pct={pct} />
                    <Text style={styles.progressPct}>{pct}%</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      <BottomNav current="Subjects" navigation={navigation} user={user} />
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
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  cardDesc: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  progressPct: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', width: 32, textAlign: 'right' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center' },
});
