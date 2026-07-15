import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, StatusBar, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import colors from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BASE_URL from '../../config';
import { confirmAction } from '../../utils/confirmAction';

const EMPTY_FORM = { name: '', description: '' };

export default function AdminSubjectsScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editingGuide, setEditingGuide] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingGuide, setUploadingGuide] = useState(false);
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
    setEditingGuide(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (subject) => {
    setForm({ name: subject.name, description: subject.description || '' });
    setEditingId(subject.id);
    setEditingGuide({
      guide_filename: subject.guide_filename || null,
      guide_original_name: subject.guide_original_name || null,
    });
    setError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setEditingGuide(null);
    setError('');
  };

  const pickAndUploadGuide = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.canceled || !result.assets?.length) return;

    const file = result.assets[0];
    setUploadingGuide(true);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        // On web, DocumentPicker returns a real browser File object at file.file
        formData.append('pdf', file.file, file.name || 'study-guide.pdf');
      } else {
        formData.append('pdf', {
          uri: file.uri,
          name: file.name || 'study-guide.pdf',
          type: 'application/pdf',
        });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(`${BASE_URL}/api/subjects/${editingId}/guide`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        throw new Error(`Server responded ${res.status}${bodyText ? `: ${bodyText}` : ''}`);
      }
      const data = await res.json();
      setEditingGuide({
        guide_filename: data.guide_filename,
        guide_original_name: data.guide_original_name,
      });
      load();
    } catch (err) {
      const detail = err.name === 'AbortError'
        ? 'Request timed out after 60s — if this is the hosted backend, it may still be waking up from idle (can take up to a minute on first use); please try again.'
        : (err.message || 'Unknown error');
      Alert.alert('Error', `Failed to upload study guide.\n\n${detail}`);
    } finally {
      setUploadingGuide(false);
    }
  };

  const removeGuide = () => {
    confirmAction({
      title: 'Remove Study Guide',
      message: 'This will remove the uploaded PDF for this subject.',
      confirmLabel: 'Remove',
      onConfirm: async () => {
        try {
          await fetch(`${BASE_URL}/api/subjects/${editingId}/guide`, { method: 'DELETE' });
          setEditingGuide({ guide_filename: null, guide_original_name: null });
          load();
        } catch {
          Alert.alert('Error', 'Could not remove study guide.');
        }
      },
    });
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
    confirmAction({
      title: 'Delete Subject',
      message: `Delete "${subject.name}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await fetch(`${BASE_URL}/api/subjects/${subject.id}`, { method: 'DELETE' });
          load();
        } catch { Alert.alert('Error', 'Could not delete subject.'); }
      },
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{item.name}</Text>
        {item.description ? <Text style={styles.rowDesc} numberOfLines={1}>{item.description}</Text> : null}
        {item.guide_filename ? <Text style={styles.rowGuide}>📄 Guide</Text> : null}
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
            {editingId ? (
              <View style={styles.guideSection}>
                <Text style={styles.guideLabel}>Study Guide (PDF)</Text>
                {editingGuide?.guide_filename ? (
                  <View style={styles.guideCurrent}>
                    <Text style={styles.guideFileText} numberOfLines={1}>
                      📄 {editingGuide.guide_original_name || editingGuide.guide_filename}
                    </Text>
                    <TouchableOpacity onPress={removeGuide}>
                      <Text style={styles.guideRemoveText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.guideEmptyText}>No study guide uploaded yet.</Text>
                )}
                <View style={{ marginTop: 10 }}>
                  <Button
                    title={uploadingGuide ? 'Uploading...' : editingGuide?.guide_filename ? 'Replace PDF' : 'Upload PDF'}
                    onPress={pickAndUploadGuide}
                    variant="secondary"
                    disabled={uploadingGuide}
                  />
                </View>
              </View>
            ) : (
              <Text style={styles.guideEmptyText}>Save the subject first to attach a study guide PDF.</Text>
            )}

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
  rowGuide: { fontSize: 11, color: colors.primary, fontWeight: '700', marginTop: 4 },
  guideSection: {
    borderTopWidth: 1, borderTopColor: colors.border,
    marginTop: 10, paddingTop: 14, marginBottom: 4,
  },
  guideLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  guideCurrent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.background, borderRadius: 10, padding: 10,
  },
  guideFileText: { flex: 1, fontSize: 13, color: colors.textPrimary, marginRight: 8 },
  guideRemoveText: { fontSize: 12, fontWeight: '700', color: colors.error },
  guideEmptyText: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
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
