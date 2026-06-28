import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import colors from '../theme/colors';

const questions = [
  {
    id: '1',
    question: 'What is 5 + 3?',
    options: ['6', '7', '8', '9'],
    answer: '8',
  },
  {
    id: '2',
    question: 'Which word is a noun?',
    options: ['Run', 'Book', 'Quick', 'Happy'],
    answer: 'Book',
  },
];

export default function QuizScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      navigation.navigate('Results');
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.header}>Quiz Time</Text>
        <Text style={styles.subHeader}>Question {currentIndex + 1} of {questions.length}</Text>

        <Card style={styles.card}>
          <Text style={styles.question}>{currentQuestion.question}</Text>
          {currentQuestion.options.map((option) => (
            <Button
              key={option}
              title={option}
              variant={selectedOption === option ? 'secondary' : 'primary'}
              onPress={() => setSelectedOption(option)}
              style={styles.optionButton}
            />
          ))}
        </Card>

        <Button title={currentIndex === questions.length - 1 ? 'Submit' : 'Next'} onPress={handleNext} disabled={!selectedOption} />
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
  header: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  subHeader: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 18,
  },
  card: {
    flex: 1,
    paddingVertical: 24,
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 22,
  },
  optionButton: {
    marginBottom: 12,
  },
});