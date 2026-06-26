import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import Card from '../components/Card';
import Button from '../components/Button';

const stats = [
  { label: 'Completed', value: '12' },
  { label: 'Lessons', value: '4' },
  { label: 'Accuracy', value: '88%' },
];

const subjects = [
  { title: 'Mathematics', progress: '75%' },
  { title: 'English', progress: '64%' },
  { title: 'Science', progress: '89%' },
];

export default function DashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good afternoon</Text>
            <Text style={styles.title}>Welcome to your dashboard</Text>
          </View>
          <Button title="Progress" variant="secondary" onPress={() => navigation.navigate('Progress')} />
        </View>

        <Card>
          <Text style={styles.cardTitle}>Weekly progress</Text>
          <View style={styles.statRow}>
            {stats.map((item) => (
              <View key={item.label} style={styles.statItem}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your subjects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Subjects')}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        {subjects.map((subject) => (
          <Card key={subject.title} style={styles.subjectCard}>
            <View style={styles.subjectRow}>
              <View>
                <Text style={styles.subjectTitle}>{subject.title}</Text>
                <Text style={styles.subjectProgress}>Progress {subject.progress}</Text>
              </View>
              <Button title="Open" variant="secondary" onPress={() => navigation.navigate('SubjectDetails')} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: 6,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionLink: {
    color: colors.primary,
    fontSize: 14,
  },
  subjectCard: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  subjectProgress: {
    color: colors.textSecondary,
    marginTop: 6,
  },
});