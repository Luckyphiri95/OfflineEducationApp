import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import Card from './Card';

export default function QuestionCard({ question, current, total }) {
  return (
    <Card>
      <Text style={styles.progress}>Question {current} of {total}</Text>
      <Text style={styles.question}>{question}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  progress: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 30,
  },
});
