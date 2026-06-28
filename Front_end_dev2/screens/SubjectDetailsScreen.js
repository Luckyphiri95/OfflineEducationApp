import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import colors from '../theme/colors';

export default function SubjectDetailsScreen({ route, navigation }) {
  const subject = route.params?.subject || { title: 'Subject', description: 'Description not available.' };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{subject.title}</Text>
        <Text style={styles.subtitle}>{subject.description}</Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>What you will learn</Text>
        <Text style={styles.sectionText}>
          - Core concepts and guided examples
          {'\n'}- Practice questions with instant feedback
          {'\n'}- Progress tracking and score history
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Ready to start?</Text>
        <Text style={styles.sectionText}>Take the quiz to test what you've learned.</Text>
        <Button title="Start Quiz" onPress={() => navigation.navigate('Quiz')} />
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionText: {
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 18,
  },
});