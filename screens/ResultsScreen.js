import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform } from 'react-native';
import Button from '../components/Button';
import ScoreDashboard from '../components/ScoreDashboard';
import colors from '../theme/colors';

export default function ResultsScreen({ route, navigation }) {
  const { score = 0, total = 0, subject } = route.params || {};
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 50;

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Blue header */}
      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>{subject?.name || 'Quiz'}</Text>
        <Text style={styles.headerSub}>Quiz Results</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Score ring + passed badge + stats row — all from ScoreDashboard */}
        <ScoreDashboard score={score} total={total} />

        {/* Feedback message */}
        <Text style={styles.feedbackText}>
          {passed
            ? 'Great job! You have passed this quiz. Keep up the excellent work!'
            : "Don't give up! Review the material and try again to improve your score."}
        </Text>

        {/* Action buttons */}
        <Button title="Try Again" onPress={() => navigation.replace('Quiz', { subject })} />
        <View style={styles.spacer} />
        <Button
          title="Back to Subjects"
          variant="secondary"
          onPress={() => navigation.navigate('Subjects')}
        />
        <View style={styles.spacer} />
        <Button
          title="Go to Dashboard"
          variant="secondary"
          onPress={() => navigation.navigate('Dashboard')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  blueHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  content: { padding: 24, alignItems: 'center', paddingTop: 28 },
  feedbackText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  spacer: { height: 10 },
});
