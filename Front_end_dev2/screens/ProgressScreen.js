import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Card from '../components/Card';
import colors from '../theme/colors';

const history = [
  { subject: 'Mathematics', score: '88%', date: 'Jun 24' },
  { subject: 'English', score: '92%', date: 'Jun 22' },
  { subject: 'Science', score: '81%', date: 'Jun 20' },
];

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Review your recent performance and study history.</Text>

        <Card>
          <Text style={styles.sectionTitle}>Overall progress</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>88%</Text>
              <Text style={styles.progressLabel}>Average score</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>24</Text>
              <Text style={styles.progressLabel}>Completed items</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.historyTitle}>Quiz history</Text>
        {history.map((item) => (
          <Card key={item.subject} style={styles.historyCard}>
            <View style={styles.historyRow}>
              <View>
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
              <Text style={styles.score}>{item.score}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    flex: 1,
    marginRight: 12,
  },
  progressNumber: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
  },
  progressLabel: {
    color: colors.textSecondary,
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  historyCard: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subject: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyDate: {
    color: colors.textSecondary,
    marginTop: 6,
  },
  score: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
});