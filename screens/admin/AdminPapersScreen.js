import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, StatusBar, Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import colors from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BASE_URL from '../../config';
import { confirmAction } from '../../utils/confirmAction';

const EMPTY_FORM = { title: '', year: '' };

export default function AdminPapersScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');

  const loadSubjects = async () => {
    try {
      const data = await fetch(`${BASE_URL}/api/subjects`).then((r) => r.json());
      const list = Array.isArray(data) ? data : [];
      setSubjects(list);
      if (list.length > 0 && !selectedSubject) setSelectedSubject(list[0]);
    } catch { }
  };

  const loadPapers = useCallback(async (subject) => {
    if (!subject) return;
    try {
      const data = await fetch(`${BASE_URL}/api/papers`).then((r) => r.json());
      setPapers(Array.isArray(data) ? data.filter((p) => p.subject_id === subject.id) : []);
    } catch { }
  }, []);

  useFocusEffect(useCallback(() => { loadSubjects(); }, []));
  useFocusEffect(useCallback(() => { loadPapers(selectedSubject); }, [selectedSubject]));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setEditingFile(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (paper) => {
    setForm({ title: paper.title, year: paper.year || '' });
    setEditingId(paper.id);
    setEditingFile({ filename: paper.filename || null, original_name: paper.original_name || null });
    setError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setEditingFile(null);
    setError('');
  };

  const pickAndUploadFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.canceled || !result.assets?.length) return;

    const file = result.assets[0];
    setUploadingFile(true);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        formData.append('pdf', file.file, file.name || 'past-paper.pdf');
      } else {
        formData.append('pdf', {
          uri: file.uri,
          name: file.name || 'past-paper.pdf',
          type: 'application/pdf',
        });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(`${BASE_URL}/api/papers/${editingId}/file`, {
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
      setEditingFile({ filename: data.filename, original_name: data.original_name });
      loadPapers(selectedSubject);
    } catch (err) {
      const detail = err.name === 'AbortError'
        ? 'Request timed out after 60s — if this is the hosted backend, it may still be waking up from idle (can take up to a minute on first use); please try again.'
        : (err.message || 'Unknown error');
      Alert.alert('Error', `Failed to upload past paper PDF.\n\n${detail}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const removeFile = () => {
    confirmAction({
      title: 'Remove PDF',
      message: 'This will remove the uploaded PDF for this past paper.',
      confirmLabel: 'Remove',
      onConfirm: async () => {
        try {
          await fetch(`${BASE_URL}/api/papers/${editingId}/file`, { method: 'DELETE' });
          setEditingFile({ filename: null, original_name: null });
          loadPapers(selectedSubject);
        } catch {
          Alert.alert('Error', 'Could not remove PDF.');
        }
      },
    });
  };

  const savePaper = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    try {
      const body = {
        subject_id: selectedSubject.id,
        title: form.title.trim(),
        year: form.year.trim(),
      };
      const url = editingId ? `${BASE_URL}/api/papers/${editingId}` : `${BASE_URL}/api/papers`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      cancelForm();
      loadPapers(selectedSubject);
    } catch {
      setError('Failed to save past paper. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deletePaper = (paper) => {
    confirmAction({
      title: 'Delete Past Paper',
      message: `Delete "${paper.title}"? This also removes its practice questions and PDF.`,
      onConfirm: async () => {
        try {
          await fetch(`${BASE_URL}/api/papers/${paper.id}`, { method: 'DELETE' });
          loadPapers(selectedSubject);
        } catch { Alert.alert('Error', 'Could not delete past paper.'); }
      },
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{item.title}</Text>
        {item.year ? <Text style={styles.rowDesc}>{item.year}</Text> : null}
        {item.filename ? <Text style={styles.rowGuide}>📄 PDF attached</Text> : null}
      </View>
      <TouchableOpacity
        style={styles.questionsBtn}
        onPress={() => navigation.navigate('AdminPaperQuestions', { paper: item })}
      >
        <Text style={styles.questionsBtnText}>Questions</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
        <Text style={styles.editBtnText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deletePaper(item)}>
        <Text style={styles.deleteBtnText}>Del</Text>
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
          <Text style={styles.headerTitle}>Past Papers</Text>
        </View>

        {/* Subject chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
          {subjects.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.chip, selectedSubject?.id === s.id && styles.chipActive]}
              onPress={() => { setSelectedSubject(s); setShowForm(false); }}
            >
              <Text style={[styles.chipText, selectedSubject?.id === s.id && styles.chipTextActive]}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {showForm ? (
          <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{editingId ? 'Edit Past Paper' : 'Add Past Paper'}</Text>
              <Input
                label="Title"
                value={form.title}
                onChangeText={(v) => { setForm((f) => ({ ...f, title: v })); setError(''); }}
                placeholder="e.g. Mathematics Paper 1"
              />
              <Input
                label="Year"
                value={form.year}
                onChangeText={(v) => setForm((f) => ({ ...f, year: v }))}
                placeholder="e.g. 2023"
              />

              {editingId ? (
                <View style={styles.guideSection}>
                  <Text style={styles.guideLabel}>Past Paper (PDF)</Text>
                  {editingFile?.filename ? (
                    <View style={styles.guideCurrent}>
                      <Text style={styles.guideFileText} numberOfLines={1}>
                        📄 {editingFile.original_name || editingFile.filename}
                      </Text>
                      <TouchableOpacity onPress={removeFile}>
                        <Text style={styles.guideRemoveText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.guideEmptyText}>No PDF uploaded yet.</Text>
                  )}
                  <View style={{ marginTop: 10 }}>
                    <Button
                      title={uploadingFile ? 'Uploading...' : editingFile?.filename ? 'Replace PDF' : 'Upload PDF'}
                      onPress={pickAndUploadFile}
                      variant="secondary"
                      disabled={uploadingFile}
                    />
                  </View>
                </View>
              ) : (
                <Text style={styles.guideEmptyText}>Save the past paper first to attach a PDF.</Text>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.formRow}>
                <Button title="Cancel" onPress={cancelForm} variant="secondary" />
                <View style={{ width: 10 }} />
                <Button title={saving ? 'Saving...' : 'Save'} onPress={savePaper} disabled={saving} />
              </View>
            </View>
          </ScrollView>
        ) : (
          <>
            <View style={styles.addWrap}>
              <Button title="+ Add Past Paper" onPress={openAdd} disabled={!selectedSubject} />
            </View>
            <FlatList
              data={papers}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {selectedSubject ? 'No past papers for this subject yet.' : 'Select a subject above.'}
                </Text>
              }
            />
          </>
        )}
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
  chipScroll: { maxHeight: 54, flexGrow: 0 },
  chipContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  addWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  formScroll: { flex: 1 },
  formCard: {
    backgroundColor: colors.surface, margin: 16, borderRadius: 16,
    padding: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  formTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  formRow: { flexDirection: 'row', marginTop: 4 },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 8 },
  list: { padding: 16, paddingTop: 4 },
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
  questionsBtn: {
    backgroundColor: colors.badgeWarning, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, marginRight: 6,
  },
  questionsBtnText: { fontSize: 12, fontWeight: '700', color: colors.badgeWarningText },
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
