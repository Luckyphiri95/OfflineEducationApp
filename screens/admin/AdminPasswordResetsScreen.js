import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, StatusBar, Platform, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import BASE_URL from '../../config';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AdminPasswordResetsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [newPasswords, setNewPasswords] = useState({});
  const [resolvingId, setResolvingId] = useState(null);

  const load = async () => {
    try {
      const data = await fetch(`${BASE_URL}/api/auth/reset-requests`).then((r) => r.json());
      setRequests(Array.isArray(data) ? data : []);
    } catch { }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const resolve = async (request) => {
    const newPassword = (newPasswords[request.id] || '').trim();
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Enter a new password of at least 6 characters.');
      return;
    }
    setResolvingId(request.id);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-requests/${request.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to reset password');
      }
      Alert.alert('Done', `Password for ${request.email} has been reset. Let them know the new password.`);
      load();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to reset password.');
    } finally {
      setResolvingId(null);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const resolved = requests.filter((r) => r.status !== 'pending');

  const renderItem = ({ item }) => {
    const isPending = item.status === 'pending';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmail}>{item.email}</Text>
          {isPending ? (
            <View style={styles.pendingBadge}><Text style={styles.pendingBadgeText}>Pending</Text></View>
          ) : (
            <View style={styles.resolvedBadge}><Text style={styles.resolvedBadgeText}>Resolved</Text></View>
          )}
        </View>
        {item.message ? <Text style={styles.cardMessage}>"{item.message}"</Text> : null}
        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>

        {isPending && (
          <View style={styles.resolveRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="New password"
              secureTextEntry
              value={newPasswords[item.id] || ''}
              onChangeText={(v) => setNewPasswords((p) => ({ ...p, [item.id]: v }))}
            />
            <TouchableOpacity
              style={styles.resolveBtn}
              onPress={() => resolve(item)}
              disabled={resolvingId === item.id}
            >
              <Text style={styles.resolveBtnText}>{resolvingId === item.id ? 'Saving...' : 'Reset'}</Text>
            </TouchableOpacity>
          </View>
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
        <Text style={styles.headerTitle}>Password Resets</Text>
        <Text style={styles.headerSub}>
          {pending.length} pending request{pending.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={[...pending, ...resolved]}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No password reset requests yet.</Text>
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
  card: {
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEmail: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cardMessage: { fontSize: 13, color: colors.textSecondary, marginTop: 6, fontStyle: 'italic' },
  cardDate: { fontSize: 11, color: colors.placeholder, marginTop: 6 },
  pendingBadge: {
    backgroundColor: colors.badgeWarning, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  pendingBadgeText: { fontSize: 10, fontWeight: '700', color: colors.badgeWarningText },
  resolvedBadge: {
    backgroundColor: colors.badgeSuccess, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  resolvedBadgeText: { fontSize: 10, fontWeight: '700', color: colors.badgeSuccessText },
  resolveRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  passwordInput: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: colors.textPrimary,
  },
  resolveBtn: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  resolveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 14 },
});
