import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Platform, RefreshControl, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import Loader from '../components/Loader';
import BottomNav from '../components/BottomNav';
import StatsCard from '../components/StatsCard';
import ProgressCard from '../components/ProgressCard';
import { fetchProgressMap, getSubjectProgress } from '../utils/progress';
import BASE_URL from '../config';

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function DashboardScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [subjects, setSubjects] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadData = async () => {
    try {
      const [subjectRes, progress] = await Promise.all([
        fetch(`${BASE_URL}/api/subjects`).then((r) => r.json()),
        fetchProgressMap(user?.id),
      ]);
      setSubjects(subjectRes.slice(0, 4));
      setProgressMap(progress);
    } catch {
      // fail silently on dashboard
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload whenever the screen comes back into focus (e.g. after finishing a quiz)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleLogout = () => {
    setMenuVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const initials = getInitials(user?.username || 'Learner');
  const totalSubjects = subjects.length;

  // Derive completed-subject count and avg completion % from progress map
  // (only consider subjects that actually have uploaded content)
  const withContent = Object.values(progressMap).filter((p) => p.total > 0);
  const completedCount = withContent.filter((p) => p.status === 'Complete').length;
  const avgProgress = withContent.length > 0
    ? Math.round(withContent.reduce((sum, p) => sum + p.pct, 0) / withContent.length)
    : null;

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Blue header */}
      <View style={styles.blueHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.username}>{user?.username || 'Learner'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => setMenuVisible(true)}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuCard}>
            <Text style={styles.menuName}>{user?.username || 'Learner'}</Text>
            <Text style={styles.menuEmail}>{user?.email || ''}</Text>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuItemText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatsCard value={totalSubjects.toString()} label="Subjects" />
          <StatsCard value={completedCount.toString()} label="Completed" />
          <StatsCard value={avgProgress !== null ? `${avgProgress}%` : '—'} label="Avg Progress" />
        </View>

        {/* Continue Learning */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Subjects', { user })}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Loader message="Loading subjects..." />
        ) : subjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No subjects available yet.</Text>
          </View>
        ) : (
          subjects.map((subject) => {
            const { pct, status } = getSubjectProgress(progressMap, subject.id);
            return (
              <ProgressCard
                key={subject.id}
                name={subject.name}
                description={subject.description}
                status={status}
                progress={pct}
                onPress={() => navigation.navigate('SubjectDetails', { subject, user })}
              />
            );
          })
        )}
      </ScrollView>

      <BottomNav current="Dashboard" navigation={navigation} user={user} />
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  username: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  sectionLink: { color: colors.primary, fontSize: 13 },
  emptyCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 15 },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'android' ? 100 : 108,
    paddingRight: 24,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    minWidth: 180,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  menuName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, paddingHorizontal: 16 },
  menuEmail: { fontSize: 12, color: colors.textSecondary, paddingHorizontal: 16, marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  menuItem: { paddingHorizontal: 16, paddingVertical: 8 },
  menuItemText: { fontSize: 14, fontWeight: '600', color: colors.badgeDangerText || '#d33' },
});
