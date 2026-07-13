import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, StatusBar, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import BASE_URL from '../../config';
import { confirmAction } from '../../utils/confirmAction';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsersScreen({ navigation, route }) {
  const { user: currentUser } = route.params || {};
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      const data = await fetch(`${BASE_URL}/api/auth/users`).then((r) => r.json());
      setUsers(Array.isArray(data) ? data : []);
    } catch { }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const deleteUser = (user) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Cannot Delete', 'You cannot delete your own account while logged in.');
      return;
    }
    confirmAction({
      title: 'Delete User',
      message: `Delete "${user.username}" (${user.email})? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await fetch(`${BASE_URL}/api/auth/users/${user.id}`, { method: 'DELETE' });
          load();
        } catch { Alert.alert('Error', 'Could not delete user.'); }
      },
    });
  };

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
          <Text style={styles.rowDate}>Joined {formatDate(item.created_at)}</Text>
        </View>
        {!isSelf && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteUser(item)}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.blueHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Users</Text>
        <Text style={styles.headerSub}>{users.length} registered account{users.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users registered yet.</Text>
        }
      />
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
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '500' },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  list: { padding: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  rowText: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  rowDate: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
  adminBadge: {
    backgroundColor: colors.badgeInfo, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  adminBadgeText: { fontSize: 10, fontWeight: '700', color: colors.badgeInfoText },
  selfBadge: {
    backgroundColor: colors.badgeSuccess, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  selfBadgeText: { fontSize: 10, fontWeight: '700', color: colors.badgeSuccessText },
  deleteBtn: {
    backgroundColor: colors.badgeError, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8,
  },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: colors.badgeErrorText },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 14 },
});
