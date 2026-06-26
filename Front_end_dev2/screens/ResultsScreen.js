import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import colors from '../theme/colors';

export default function ResultsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Quiz Complete</Text>
        <Text style={styles.subtitle}>Great work! Here's your result summary.</Text>

        <Card style={styles.scoreCard}>
          <Text style={styles.scoreValue}>8/10</Text>
          <Text style={styles.scoreLabel}>Correct answers</Text>
        </Card>

        <View style={styles.summaryRow}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>8</Text>
            <Text style={styles.metricLabel}>Correct</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>2</Text>
            <Text style={styles.metricLabel}>Wrong</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>80%</Text>
            <Text style={styles.metricLabel}>Grade</Text>
          </Card>
        </View>

        <Button title="View Answers" onPress={() => {}} />
        <Button title="Back to Subjects" variant="secondary" onPress={() => navigation.navigate('Subjects')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 24,
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  scoreValue: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.primary,
  },
  scoreLabel: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 18,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricLabel: {
    marginTop: 8,
    color: colors.textSecondary,
  },
});