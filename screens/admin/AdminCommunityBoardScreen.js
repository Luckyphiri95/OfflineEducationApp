import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, StatusBar, Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BASE_URL from '../../config';
import { confirmAction } from '../../utils/confirmAction';

const EMPTY_FORM = { title: '', body: '', category: 'module', subject_id: null };

const CATEGORIES = [
  { key: 'module', label: 'Module Article' },
  { key: 'improvement', label: 'School Improvement' },
];

export default function AdminCommunityBoardScreen({ navigation, route }) {
  const { user } = route.params || {};
  const [articles, setArticles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [articleData, subjectData] = await Promise.all([
        fetch(`${BASE_URL}/api/articles`).then((r) => r.json()),
        fetch(`${BASE_URL}/api/subjects`).then((r) => r.json()),
      ]);
      setArticles(Array.isArray(articleData) ? articleData : []);
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
    } catch { }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (article) => {
    setForm({
      title: article.title,
      body: article.body,
      category: article.category,
      subject_id: article.subject_id || null,
    });
    setEditingId(article.id);
    setError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
  };

  const saveArticle = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and body are required');
      return;
    }
    if (form.category === 'module' && !form.subject_id) {
      setError('Select a subject for a Module Article');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        subject_id: form.category === 'module' ? form.subject_id : null,
        author_id: user?.id,
      };
      const url = editingId ? `${BASE_URL}/api/articles/${editingId}` : `${BASE_URL}/api/articles`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      cancelForm();
      load();
    } catch {
      setError('Failed to save article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteArticle = (article) => {
    confirmAction({
      title: 'Delete Article',
      message: `Delete "${article.title}"? This also removes its likes and comments.`,
      onConfirm: async () => {
        try {
          await fetch(`${BASE_URL}/api/articles/${article.id}`, { method: 'DELETE' });
          load();
        } catch { Alert.alert('Error', 'Could not delete article.'); }
      },
    });
  };

  const subjectName = (id) => subjects.find((s) => s.id === id)?.name;

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{item.title}</Text>
        <Text style={styles.rowDesc} numberOfLines={1}>
          {item.category === 'module' ? `Module — ${subjectName(item.subject_id) || 'Subject'}` : 'School Improvement'}
        </Text>
        <Text style={styles.rowMeta}>❤️ {item.like_count || 0}  💬 {item.comment_count || 0}</Text>
      </View>
      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => navigation.navigate('ArticleDetail', { article: item, user })}
      >
        <Text style={styles.viewBtnText}>View</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
        <Text style={styles.editBtnText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteArticle(item)}>
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
          <Text style={styles.headerTitle}>Community Board</Text>
        </View>

        {showForm ? (
          <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{editingId ? 'Edit Article' : 'Add Article'}</Text>

              <Text style={styles.pickerLabel}>Category</Text>
              <View style={styles.pickerRow}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.pickerBtn, form.category === c.key && styles.pickerBtnActive]}
                    onPress={() => { setForm((f) => ({ ...f, category: c.key })); setError(''); }}
                  >
                    <Text style={[styles.pickerBtnText, form.category === c.key && styles.pickerBtnTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {form.category === 'module' ? (
                <>
                  <Text style={styles.pickerLabel}>Subject</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {subjects.map((s) => (
                        <TouchableOpacity
                          key={s.id}
                          style={[styles.chip, form.subject_id === s.id && styles.chipActive]}
                          onPress={() => { setForm((f) => ({ ...f, subject_id: s.id })); setError(''); }}
                        >
                          <Text style={[styles.chipText, form.subject_id === s.id && styles.chipTextActive]}>
                            {s.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              ) : null}

              <Input
                label="Title"
                value={form.title}
                onChangeText={(v) => { setForm((f) => ({ ...f, title: v })); setError(''); }}
                placeholder="Article title"
              />
              <Input
                label="Body"
                value={form.body}
                onChangeText={(v) => { setForm((f) => ({ ...f, body: v })); setError(''); }}
                placeholder="Write the article..."
                multiline
                numberOfLines={8}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.formRow}>
                <Button title="Cancel" onPress={cancelForm} variant="secondary" />
                <View style={{ width: 10 }} />
                <Button title={saving ? 'Saving...' : 'Save'} onPress={saveArticle} disabled={saving} />
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.addWrap}>
            <Button title="+ Add Article" onPress={openAdd} />
          </View>
        )}

        {!showForm && (
          <FlatList
            data={articles}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No articles yet. Add one above.</Text>
            }
          />
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
  addWrap: { paddingHorizontal: 20, paddingTop: 16 },
  formScroll: { flex: 1 },
  formCard: {
    backgroundColor: colors.surface, margin: 16, borderRadius: 16,
    padding: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  formTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  pickerLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  pickerRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  pickerBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center',
  },
  pickerBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickerBtnText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  pickerBtnTextActive: { color: '#fff' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
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
  rowMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  viewBtn: {
    backgroundColor: colors.badgeWarning, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, marginRight: 6,
  },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: colors.badgeWarningText },
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
