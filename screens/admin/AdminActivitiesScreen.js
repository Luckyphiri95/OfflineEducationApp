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

const EMPTY_FORM = { title: '' };

export default function AdminActivitiesScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [questionCounts, setQuestionCounts] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadSubjects = async () => {
    try {
      const data = await fetch(`${BASE_URL}/api/subjects`).then((r) => r.json());
      const list = Array.isArray(data) ? data : [];
      setSubjects(list);
      if (list.length > 0 && !selectedSubject) setSelectedSubject(list[0]);
    } catch { }
  };

  const loadActivities = useCallback(async (subject) => {
    if (!subject) return;
    try {
      const [activityData, quizData] = await Promise.all([
        fetch(`${BASE_URL}/api/activities`).then((r) => r.json()),
        fetch(`${BASE_URL}/api/quiz`).then((r) => r.json()),
      ]);
      setActivities(Array.isArray(activityData) ? activityData.filter((a) => a.subject_id === subject.id) : []);
      const counts = {};
      if (Array.isArray(quizData)) {
        quizData.forEach((q) => {
          if (q.activity_id) counts[q.activity_id] = (counts[q.activity_id] || 0) + 1;
        });
      }
      setQuestionCounts(counts);
    } catch { }
  }, []);

  useFocusEffect(useCallback(() => { loadSubjects(); }, []));
  useFocusEffect(useCallback(() => { loadActivities(selectedSubject); }, [selectedSubject]));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (activity) => {
    setForm({ title: activity.title });
    setEditingId(activity.id);
    setError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
  };

  const saveActivity = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    try {
      const body = {
        subject_id: selectedSubject.id,
        title: form.title.trim(),
      };
      const url = editingId ? `${BASE_URL}/api/activities/${editingId}` : `${BASE_URL}/api/activities`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      cancelForm();
      loadActivities(selectedSubject);
    } catch {
      setError('Failed to save activity. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteActivity = (activity) => {
    confirmAction({
      title: 'Delete Activity',
      message: `Delete "${activity.title}"? This also removes its questions.`,
      onConfirm: async () => {
        try {
          await fetch(`${BASE_URL}/api/activities/${activity.id}`, { method: 'DELETE' });
          loadActivities(selectedSubject);
        } catch { Alert.alert('Error', 'Could not delete activity.'); }
      },
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{item.title}</Text>
        <Text style={styles.rowDesc}>{questionCounts[item.id] || 0} question{questionCounts[item.id] === 1 ? '' : 's'}</Text>
      </View>
      <TouchableOpacity
        style={styles.questionsBtn}
        onPress={() => navigation.navigate('AdminActivityQuestions', { activity: item })}
      >
        <Text style={styles.questionsBtnText}>Questions</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
        <Text style={styles.editBtnText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteActivity(item)}>
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
          <Text style={styles.headerTitle}>Activities</Text>
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
              <Text style={styles.formTitle}>{editingId ? 'Edit Activity' : 'Add Activity'}</Text>
              <Input
                label="Title"
                value={form.title}
                onChangeText={(v) => { setForm((f) => ({ ...f, title: v })); setError(''); }}
                placeholder="e.g. Chapter 1 Quiz"
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.formRow}>
                <Button title="Cancel" onPress={cancelForm} variant="secondary" />
                <View style={{ width: 10 }} />
                <Button title={saving ? 'Saving...' : 'Save'} onPress={saveActivity} disabled={saving} />
              </View>
            </View>
          </ScrollView>
        ) : (
          <>
            <View style={styles.addWrap}>
              <Button title="+ Add Activity" onPress={openAdd} disabled={!selectedSubject} />
            </View>
            <FlatList
              data={activities}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {selectedSubject ? 'No activities for this subject yet.' : 'Select a subject above.'}
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
