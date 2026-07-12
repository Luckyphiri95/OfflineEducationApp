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

const EMPTY_FORM = {
  question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'option_a',
};

const ANSWER_OPTIONS = [
  { key: 'option_a', label: 'A' },
  { key: 'option_b', label: 'B' },
  { key: 'option_c', label: 'C' },
  { key: 'option_d', label: 'D' },
];

export default function AdminPaperQuestionsScreen({ navigation, route }) {
  const { paper } = route.params || {};
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadQuestions = useCallback(async () => {
    if (!paper) return;
    try {
      const data = await fetch(`${BASE_URL}/api/quiz`).then((r) => r.json());
      setQuestions(Array.isArray(data) ? data.filter((q) => q.paper_id === paper.id) : []);
    } catch { }
  }, [paper]);

  useFocusEffect(useCallback(() => { loadQuestions(); }, [loadQuestions]));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (q) => {
    setForm({
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
    });
    setEditingId(q.id);
    setError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
  };

  const saveQuestion = async () => {
    const { question, option_a, option_b, option_c, option_d, correct_answer } = form;
    if (!question.trim() || !option_a.trim() || !option_b.trim() || !option_c.trim() || !option_d.trim()) {
      setError('All fields are required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        subject_id: paper.subject_id,
        paper_id: paper.id,
        question: question.trim(),
        option_a: option_a.trim(),
        option_b: option_b.trim(),
        option_c: option_c.trim(),
        option_d: option_d.trim(),
        correct_answer,
      };
      const url = editingId ? `${BASE_URL}/api/quiz/${editingId}` : `${BASE_URL}/api/quiz`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      cancelForm();
      loadQuestions();
    } catch {
      setError('Failed to save question. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = (q) => {
    Alert.alert(
      'Delete Question',
      'Delete this question? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await fetch(`${BASE_URL}/api/quiz/${q.id}`, { method: 'DELETE' });
              loadQuestions();
            } catch { Alert.alert('Error', 'Could not delete question.'); }
          },
        },
      ]
    );
  };

  const getCorrectLabel = (q) => {
    const map = { option_a: `A: ${q.option_a}`, option_b: `B: ${q.option_b}`, option_c: `C: ${q.option_c}`, option_d: `D: ${q.option_d}` };
    return map[q.correct_answer] || q.correct_answer;
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.rowQ} numberOfLines={2}>{index + 1}. {item.question}</Text>
        <Text style={styles.rowCorrect}>✓ {getCorrectLabel(item)}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
        <Text style={styles.editBtnText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteQuestion(item)}>
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
          <Text style={styles.headerTitle}>Practice Questions</Text>
          <Text style={styles.headerSub}>{paper?.title}{paper?.year ? ` (${paper.year})` : ''}</Text>
        </View>

        {showForm ? (
          <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{editingId ? 'Edit Question' : 'Add Question'}</Text>
              <Input
                label="Question"
                value={form.question}
                onChangeText={(v) => { setForm((f) => ({ ...f, question: v })); setError(''); }}
                placeholder="Enter the question"
              />
              <Input label="Option A" value={form.option_a} onChangeText={(v) => setForm((f) => ({ ...f, option_a: v }))} placeholder="Option A" />
              <Input label="Option B" value={form.option_b} onChangeText={(v) => setForm((f) => ({ ...f, option_b: v }))} placeholder="Option B" />
              <Input label="Option C" value={form.option_c} onChangeText={(v) => setForm((f) => ({ ...f, option_c: v }))} placeholder="Option C" />
              <Input label="Option D" value={form.option_d} onChangeText={(v) => setForm((f) => ({ ...f, option_d: v }))} placeholder="Option D" />

              <Text style={styles.correctLabel}>Correct Answer</Text>
              <View style={styles.answerRow}>
                {ANSWER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.answerBtn, form.correct_answer === opt.key && styles.answerBtnActive]}
                    onPress={() => setForm((f) => ({ ...f, correct_answer: opt.key }))}
                  >
                    <Text style={[styles.answerBtnText, form.correct_answer === opt.key && styles.answerBtnTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.formBtns}>
                <Button title="Cancel" onPress={cancelForm} variant="secondary" />
                <View style={{ width: 10 }} />
                <Button title={saving ? 'Saving...' : 'Save'} onPress={saveQuestion} disabled={saving} />
              </View>
            </View>
          </ScrollView>
        ) : (
          <>
            <View style={styles.addWrap}>
              <Button title="+ Add Question" onPress={openAdd} />
            </View>
            <FlatList
              data={questions}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No practice questions for this paper yet.</Text>
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
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  addWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  list: { padding: 16, paddingTop: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  rowBody: { flex: 1, marginRight: 8 },
  rowQ: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, lineHeight: 20 },
  rowCorrect: { fontSize: 12, color: colors.badgeSuccessText, marginTop: 4, fontWeight: '600' },
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
  formScroll: { flex: 1 },
  formCard: {
    backgroundColor: colors.surface, margin: 16, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  formTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  correctLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, marginTop: 4 },
  answerRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  answerBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center',
  },
  answerBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  answerBtnText: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  answerBtnTextActive: { color: '#fff' },
  formBtns: { flexDirection: 'row', marginTop: 4 },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 8 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 14 },
});
