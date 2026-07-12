import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import BASE_URL from '../config';
import { fetchProgressMap, getSubjectProgress } from '../utils/progress';

const TABS = [
  { key: 'intro', label: 'Introduction' },
  { key: 'activities', label: 'Activities' },
  { key: 'guide', label: 'Study Guide' },
  { key: 'papers', label: 'Past Papers' },
];

function StatusBadge({ status }) {
  const map = {
    Complete:      { bg: colors.badgeSuccess, text: colors.badgeSuccessText },
    'In Progress': { bg: colors.badgeInfo,    text: colors.badgeInfoText },
    'Not Started': { bg: colors.badgeWarning, text: colors.badgeWarningText },
    'No Content':  { bg: colors.border,       text: colors.textSecondary },
  };
  const style = map[status] || map['Not Started'];
  return (
    <View style={[badge.wrap, { backgroundColor: style.bg }]}>
      <Text style={[badge.text, { color: style.text }]}>{status}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700' },
});

export default function SubjectDetailsScreen({ route, navigation }) {
  const { subject, user } = route.params;
  const [activeTab, setActiveTab] = useState('intro');
  const [progressMap, setProgressMap] = useState({});
  const [activities, setActivities] = useState([]);
  const [papers, setPapers] = useState([]);
  const [questionCounts, setQuestionCounts] = useState({ activities: {}, papers: {} });
  const [latestScores, setLatestScores] = useState({ activities: {}, papers: {} });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [progress, activityData, paperData, quizData, resultsData] = await Promise.all([
        fetchProgressMap(user?.id),
        fetch(`${BASE_URL}/api/activities`).then((r) => r.json()),
        fetch(`${BASE_URL}/api/papers`).then((r) => r.json()),
        fetch(`${BASE_URL}/api/quiz`).then((r) => r.json()),
        fetch(`${BASE_URL}/api/results`).then((r) => r.json()),
      ]);

      setProgressMap(progress);
      setActivities(Array.isArray(activityData) ? activityData.filter((a) => a.subject_id === subject.id) : []);
      setPapers(Array.isArray(paperData) ? paperData.filter((p) => p.subject_id === subject.id) : []);

      const counts = { activities: {}, papers: {} };
      if (Array.isArray(quizData)) {
        quizData.forEach((q) => {
          if (q.activity_id) counts.activities[q.activity_id] = (counts.activities[q.activity_id] || 0) + 1;
          if (q.paper_id) counts.papers[q.paper_id] = (counts.papers[q.paper_id] || 0) + 1;
        });
      }
      setQuestionCounts(counts);

      const scores = { activities: {}, papers: {} };
      if (Array.isArray(resultsData)) {
        const userResults = resultsData.filter((r) => r.user_id === user?.id);
        userResults.forEach((r) => {
          const pct = r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0;
          if (r.type === 'activity' && r.activity_id) {
            if (!scores.activities[r.activity_id] || r.id > scores.activities[r.activity_id].id) {
              scores.activities[r.activity_id] = { id: r.id, pct };
            }
          }
          if (r.type === 'paper' && r.paper_id) {
            if (!scores.papers[r.paper_id] || r.id > scores.papers[r.paper_id].id) {
              scores.papers[r.paper_id] = { id: r.id, pct };
            }
          }
        });
      }
      setLatestScores(scores);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [subject.id, user?.id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const { pct, status } = getSubjectProgress(progressMap, subject.id);
  const pdfUrl = subject.guide_filename ? `${BASE_URL}/uploads/${subject.guide_filename}` : null;

  const handleOpenGuide = async () => {
    if (!pdfUrl) {
      Alert.alert(
        'Study Guide Coming Soon',
        `The study guide for ${subject.name} is not available yet. Check back later.`,
        [{ text: 'OK' }]
      );
      return;
    }
    try {
      await fetch(`${BASE_URL}/api/subjects/${subject.id}/guide/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id }),
      });
    } catch {
      // non-critical — still let the student view the guide even if this fails
    }
    navigation.navigate('StudyGuideViewer', { pdfUrl, subjectName: subject.name });
  };

  const openPaperPdf = (paper) => {
    if (!paper.filename) return;
    navigation.navigate('StudyGuideViewer', {
      pdfUrl: `${BASE_URL}/uploads/${paper.filename}`,
      subjectName: paper.title,
    });
  };

  const renderIntroTab = () => (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          {subject.description ||
            `Learn the key concepts and skills for ${subject.name}. This subject covers essential material to build a strong foundation.`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What You Will Learn</Text>
        {[
          'Core concepts with guided examples',
          'Practice questions with instant feedback',
          'Progress tracking and score history',
        ].map((item, i) => (
          <View key={i} style={styles.topicRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.topicText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderActivitiesTab = () => (
    <View style={styles.section}>
      {activities.length === 0 ? (
        <Text style={styles.emptyText}>No activities available yet for this subject.</Text>
      ) : (
        activities.map((activity) => {
          const count = questionCounts.activities[activity.id] || 0;
          const lastScore = latestScores.activities[activity.id]?.pct;
          return (
            <View key={activity.id} style={styles.card}>
              <Text style={styles.cardTitle}>{activity.title}</Text>
              <Text style={styles.cardSub}>
                {count} question{count === 1 ? '' : 's'}
                {lastScore !== undefined ? ` · Last score ${lastScore}%` : ''}
              </Text>
              <TouchableOpacity
                style={[styles.actionBtn, count === 0 && styles.actionBtnDisabled]}
                disabled={count === 0}
                onPress={() => navigation.navigate('ActivityQuiz', { activity, subject, user })}
              >
                <Text style={[styles.actionBtnText, count === 0 && styles.actionBtnTextDisabled]}>
                  {count === 0 ? 'No questions yet' : lastScore !== undefined ? 'Retake' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );

  const renderGuideTab = () => (
    <View style={styles.section}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Study Guide</Text>
        <Text style={styles.cardSub}>
          {pdfUrl ? 'A downloadable study guide is available for this subject.' : 'Not uploaded yet — check back later.'}
        </Text>
        <TouchableOpacity
          style={[styles.actionBtn, !pdfUrl && styles.actionBtnDisabled]}
          disabled={!pdfUrl}
          onPress={handleOpenGuide}
        >
          <Text style={[styles.actionBtnText, !pdfUrl && styles.actionBtnTextDisabled]}>
            {pdfUrl ? '📄 View Study Guide' : 'Coming soon'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPapersTab = () => (
    <View style={styles.section}>
      {papers.length === 0 ? (
        <Text style={styles.emptyText}>No past papers available yet for this subject.</Text>
      ) : (
        papers.map((paper) => {
          const count = questionCounts.papers[paper.id] || 0;
          return (
            <View key={paper.id} style={styles.card}>
              <Text style={styles.cardTitle}>{paper.title}</Text>
              {paper.year ? <Text style={styles.cardSub}>{paper.year}</Text> : null}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, !paper.filename && styles.actionBtnDisabled]}
                  disabled={!paper.filename}
                  onPress={() => openPaperPdf(paper)}
                >
                  <Text style={[styles.actionBtnText, !paper.filename && styles.actionBtnTextDisabled]}>
                    {paper.filename ? '📄 View PDF' : 'PDF coming soon'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnSecondary, count === 0 && styles.actionBtnDisabled]}
                  disabled={count === 0}
                  onPress={() => navigation.navigate('PaperQuiz', { paper, subject, user })}
                >
                  <Text style={[styles.actionBtnTextSecondary, count === 0 && styles.actionBtnTextDisabled]}>
                    {count > 0 ? `Practice (${count})` : 'No practice questions'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Blue header with back button */}
      <View style={styles.blueHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subject.name}</Text>
      </View>

      {/* Progress summary bar */}
      <View style={styles.progressSummary}>
        <View style={styles.progressRow}>
          <StatusBadge status={status} />
          <Text style={styles.progressPct}>{pct}% Complete</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {activeTab === 'intro' && renderIntroTab()}
          {activeTab === 'activities' && renderActivitiesTab()}
          {activeTab === 'guide' && renderGuideTab()}
          {activeTab === 'papers' && renderPapersTab()}
        </ScrollView>
      )}
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
  progressSummary: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  progressPct: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  section: { padding: 20, paddingBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  aboutText: { fontSize: 15, color: colors.textSecondary, lineHeight: 24 },
  topicRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  checkIcon: { color: colors.success, fontSize: 15, fontWeight: '700', marginRight: 10, marginTop: 2 },
  topicText: { flex: 1, fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 20 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  cardSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2, marginBottom: 10 },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  actionBtnSecondary: {
    backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.primary,
  },
  actionBtnDisabled: { backgroundColor: colors.disabled, borderColor: colors.border },
  actionBtnText: { color: colors.onPrimary, fontSize: 13, fontWeight: '700' },
  actionBtnTextSecondary: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  actionBtnTextDisabled: { color: colors.textSecondary },
});
