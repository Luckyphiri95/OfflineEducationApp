import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Linking, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import Button from '../components/Button';
import { fetchProgressMap, getSubjectProgress } from '../utils/progress';

const TOPICS_BY_SUBJECT = {
  1: ['Algebra and equations', 'Geometry and shapes', 'Statistics and data', 'Number systems'],
  2: ['Grammar and punctuation', 'Reading comprehension', 'Essay writing', 'Vocabulary building'],
  3: ['Scientific method', 'Biology basics', 'Chemistry fundamentals', 'Physics concepts'],
  4: ['Introduction to programming', 'Data structures', 'Algorithms', 'Databases and SQL'],
};

const DEFAULT_TOPICS = [
  'Core concepts and theory',
  'Practical exercises',
  'Problem solving techniques',
  'Assessment preparation',
];

// PDF study guide URLs per subject.
// Replace the null values with real URLs (Google Drive, Dropbox, or your server)
// when the study guides are ready. New subjects added via the backend will
// automatically show a "Coming Soon" button until a URL is added here.
const PDF_GUIDES = {
  1: null, // Mathematics — e.g. 'https://drive.google.com/file/d/XXXXX/view'
  2: null, // English
  3: null, // Science
  4: 'https://learning.richfield.ac.za/mod/resource/view.php?id=558437', // Computer Studies
};

function StatusBadge({ status }) {
  const map = {
    Complete:      { bg: colors.badgeSuccess, text: colors.badgeSuccessText },
    'In Progress': { bg: colors.badgeInfo,    text: colors.badgeInfoText },
    Started:       { bg: colors.badgeWarning, text: colors.badgeWarningText },
    'Not Started': { bg: colors.border,       text: colors.textSecondary },
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
  const [progressMap, setProgressMap] = useState({});

  useFocusEffect(
    useCallback(() => {
      fetchProgressMap(user?.id).then(setProgressMap);
    }, [])
  );

  const { pct, status } = getSubjectProgress(progressMap, subject.id);
  const topics = TOPICS_BY_SUBJECT[subject.id] || DEFAULT_TOPICS;
  const pdfUrl = PDF_GUIDES[subject.id] ?? null;

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
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Error', 'Unable to open the study guide on this device.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong while opening the study guide.');
    }
  };

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

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* About section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {subject.description ||
              `Learn the key concepts and skills for ${subject.name}. This subject covers essential material to build a strong foundation.`}
          </Text>
        </View>

        {/* Topics covered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topics Covered</Text>
          {topics.map((topic, i) => (
            <View key={i} style={styles.topicRow}>
              <View style={styles.topicDot} />
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
        </View>

        {/* What you will learn */}
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
      </ScrollView>

      {/* Fixed CTA bar — Start Quiz + Study Guide */}
      <View style={styles.ctaBar}>
        <Button
          title="Start Quiz"
          onPress={() => navigation.navigate('Quiz', { subject, user })}
        />

        <TouchableOpacity
          style={[styles.guideBtn, !pdfUrl && styles.guideBtnDisabled]}
          onPress={handleOpenGuide}
          activeOpacity={0.75}
        >
          <Text style={styles.guideBtnIcon}>📄</Text>
          <View>
            <Text style={[styles.guideBtnText, !pdfUrl && styles.guideBtnTextDisabled]}>
              View Study Guide
            </Text>
            {!pdfUrl && (
              <Text style={styles.guideBtnSub}>Coming soon</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
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
  scroll: { flex: 1 },
  section: { padding: 20, paddingBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  aboutText: { fontSize: 15, color: colors.textSecondary, lineHeight: 24 },
  topicRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  topicDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: colors.primary, marginTop: 7, marginRight: 12,
  },
  checkIcon: { color: colors.success, fontSize: 15, fontWeight: '700', marginRight: 10, marginTop: 2 },
  topicText: { flex: 1, fontSize: 15, color: colors.textSecondary, lineHeight: 22 },

  // Fixed bottom CTA bar
  ctaBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    gap: 10,
  },

  // Study guide button
  guideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  guideBtnDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  guideBtnIcon: {
    fontSize: 20,
  },
  guideBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  guideBtnTextDisabled: {
    color: colors.textSecondary,
  },
  guideBtnSub: {
    fontSize: 11,
    color: colors.placeholder,
    marginTop: 1,
  },
});
