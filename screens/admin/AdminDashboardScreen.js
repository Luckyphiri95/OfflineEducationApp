import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import BASE_URL from '../../config';

function StatCard({ value, label, color }) {
  return (
    <View style={[stat.card, { borderLeftColor: color }]}>
      <Text style={[stat.value, { color }]}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 14,
    padding: 16, borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  value: { fontSize: 28, fontWeight: '700' },
  label: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});

function NavTile({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={tile.wrap} onPress={onPress} activeOpacity={0.75}>
      <Text style={tile.icon}>{icon}</Text>
      <View style={tile.text}>
        <Text style={tile.title}>{title}</Text>
        <Text style={tile.sub}>{subtitle}</Text>
      </View>
      <Text style={tile.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const tile = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  icon: { fontSize: 26, marginRight: 14 },
  text: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 22, color: colors.textSecondary },
});

export default function AdminDashboardScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [counts, setCounts] = useState({ subjects: '—', questions: '—', users: '—' });

  const handleLogout = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        fetch(`${BASE_URL}/api/subjects`).then((r) => r.json()),
        fetch(`${BASE_URL}/api/quiz`).then((r) => r.json()),
        fetch(`${BASE_URL}/api/auth/users`).then((r) => r.json()),
      ]).then(([subjects, questions, users]) => {
        setCounts({
          subjects: Array.isArray(subjects) ? subjects.length : '—',
          questions: Array.isArray(questions) ? questions.length : '—',
          users: Array.isArray(users) ? users.length : '—',
        });
      }).catch(() => {});
    }, [])
  );

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.blueHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>ADMIN PANEL</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSub}>Welcome, {user?.username}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <StatCard value={counts.subjects} label="Subjects" color={colors.primary} />
          <StatCard value={counts.questions} label="Questions" color={colors.badgeSuccessText} />
          <StatCard value={counts.users} label="Users" color={colors.badgeWarningText} />
        </View>

        <Text style={styles.sectionTitle}>Manage Content</Text>

        <NavTile
          icon="📚"
          title="Subjects"
          subtitle="Add, edit or remove subjects"
          onPress={() => navigation.navigate('AdminSubjects', { user })}
        />
        <NavTile
          icon="❓"
          title="Activities"
          subtitle="Manage quiz activities per subject"
          onPress={() => navigation.navigate('AdminActivities', { user })}
        />
        <NavTile
          icon="📄"
          title="Past Papers"
          subtitle="Upload papers and manage practice questions"
          onPress={() => navigation.navigate('AdminPapers', { user })}
        />
        <NavTile
          icon="📝"
          title="Community Board"
          subtitle="Post articles and school-improvement tips"
          onPress={() => navigation.navigate('AdminCommunityBoard', { user })}
        />
        <NavTile
          icon="👥"
          title="Users"
          subtitle="View and manage student accounts"
          onPress={() => navigation.navigate('AdminUsers', { user })}
        />
      </ScrollView>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
});
