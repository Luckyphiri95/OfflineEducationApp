import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, StatusBar, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BASE_URL from '../../config';

const EMPTY_FORM = { name: '', description: '' };

export default function AdminSubjectsScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await fetch(`${BASE_URL}/api/subjects`).then((r) => r.json());
      setSubjects(Array.isArray(data) ? data : []);
    } catch { }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (subject) => {
    setForm({ name: subject.name, description: subject.description || '' });
    setEditingId(subject.id);
    setError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
  };

  const saveSubject = async () => {
    if (!form.name.trim()) { setError('Subject name is required'); return; }
    setSaving(true);
    try {
      const url = editingId
        ? `${BASE_URL}/api/subjects/${editingId}`
        : `${BASE_URL}/api/subjects`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() }),
      });
      if (!res.ok) throw new Error();
      cancelForm();
      load();
    } catch {
      setError('Failed to save subject. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteSubject = (subject) => {
    Alert.alert(
      'Delete Subject',
      `Delete "${subject.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await fetch(`${BASE_URL}/api/subjects/${subject.id}`, { method: 'DELETE' });
              load();
            } catch { Alert.alert('Error', 'Could not delete subject.'); }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{item.name}</Text>
        {item.description ? <Text style={styles.rowDesc} numberOfLines={1}>{item.description}</Text> : null}
      </View>
      <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
        <Text style={styles.editBtnText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteSubject(item)}>
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.page}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        <View style={styles.blueHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subjects</Text>
        </View>

        {showForm ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editingId ? 'Edit Subject' : 'Add Subject'}</Text>
            <Input
              label="Subject Name"
              value={form.name}
              onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); setError(''); }}
              placeholder="e.g. Mathematics"
            />
            <Input
              label="Description"
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Short description (optional)"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.formRow}>
              <Button title="Cancel" onPress={cancelForm} variant="secondary" />
              <View style={{ width: 10 }} />
              <Button title={saving ? 'Saving...' : 'Save'} onPress={saveSubject} disabled={saving} />
            </View>
          </View>
        ) : (
          <View style={styles.addWrap}>
            <Button title="+ Add Subject" onPress={openAdd} />
          </View>
        )}

        <FlatList
          data={subjects}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No subjects yet. Add one above.</Text>
          }
        />
      </View>
    </KeyboardAvoidingView>
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
  addWrap: { paddingHorizontal: 20, paddingTop: 16 },
  formCard: {
    backgroundColor: colors.surface, margin: 16, borderRadius: 16,
    padding: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  formTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  formRow: { flexDirection: 'row', marginTop: 4 },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 8 },
  list: { padding: 16, paddingTop: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  rowText: { flex: 1, marginRight: 8 },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  editBtn: {
    backgroundColor: colors.badgeInfo, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, marginRight: 6,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: colors.badgeInfoText },
  deleteBtn: {
    backgroundColor: colors.badgeError, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: colors.badgeErrorText },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 14 },
});
