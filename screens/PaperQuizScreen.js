import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import colors from '../theme/colors';
import Button from '../components/Button';
import BASE_URL from '../config';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const QUIZ_SECONDS = 120;

// Map backend row fields to a consistent format the UI can use
function normalizeQuestion(q) {
  return {
    id: q.id,
    paper_id: q.paper_id,
    question: q.question,
    options: [q.option_a, q.option_b, q.option_c, q.option_d],
    correct_answer: q[q.correct_answer],
  };
}

export default function PaperQuizScreen({ route, navigation }) {
  const { paper, subject, user } = route.params || {};

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  // Accumulates { questionId: selectedAnswer } for the final submitPaperQuiz call
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_SECONDS);
  const timerRef = useRef(null);

  // ── Fetch questions from backend, filtered to this paper ────────────────
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/quiz`);
        if (!response.ok) throw new Error('Failed to load practice questions');
        const data = await response.json();

        // Filter to this paper only, then normalize
        const filtered = data
          .filter((q) => q.paper_id === paper?.id)
          .map(normalizeQuestion);

        if (filtered.length === 0) {
          setLoadError(`No practice questions found for ${paper?.title || 'this paper'}.`);
        } else {
          setQuestions(filtered);
        }
      } catch {
        setLoadError('Could not load practice questions. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // ── Countdown timer — starts once questions are loaded ──────────────────
  useEffect(() => {
    if (questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [questions]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const timerWarning = timeLeft <= 30;

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  // ── Submit all collected answers to the backend ────────────────────────
  const submitToBackend = async (finalAnswers) => {
    try {
      const response = await fetch(`${BASE_URL}/api/submitPaperQuiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          subject_id: subject?.id ?? paper?.subject_id,
          paper_id: paper?.id,
          answers: finalAnswers,
        }),
      });
      const data = await response.json();
      return { score: data.score, total: data.total };
    } catch {
      // If submit fails, calculate score locally as fallback
      let score = 0;
      questions.forEach((q) => {
        if (finalAnswers[q.id] === q.correct_answer) score++;
      });
      return { score, total: questions.length };
    }
  };

  const handleAutoSubmit = async () => {
    const result = await submitToBackend(answers);
    navigation.replace('Results', { score: result.score, total: result.total, subject, paper, user });
  };

  const handleNext = async () => {
    if (!selected || submitted) return;

    // Save this question's answer
    const updatedAnswers = { ...answers, [currentQuestion.id]: selected };
    setAnswers(updatedAnswers);
    setSubmitted(true);

    setTimeout(async () => {
      if (isLast) {
        clearInterval(timerRef.current);
        const result = await submitToBackend(updatedAnswers);
        navigation.replace('Results', { score: result.score, total: result.total, subject, paper, user });
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setSubmitted(false);
      }
    }, 700);
  };

  const handleQuit = () => {
    clearInterval(timerRef.current);
    navigation.goBack();
  };

  // ── Option styling based on selection and submit state ─────────────────
  const getOptionStyle = (option) => {
    if (!submitted) return selected === option ? styles.optionSelected : styles.option;
    if (option === currentQuestion.correct_answer) return styles.optionCorrect;
    if (option === selected) return styles.optionWrong;
    return styles.option;
  };

  const getOptionTextStyle = (option) => {
    if (!submitted) return selected === option ? styles.optionTextSelected : styles.optionText;
    if (option === currentQuestion.correct_answer) return styles.optionTextCorrect;
    if (option === selected) return styles.optionTextWrong;
    return styles.optionText;
  };

  const getLetterStyle = (option) => {
    if (!submitted && selected === option) return [styles.optionLetter, styles.optionLetterSelected];
    if (submitted && option === currentQuestion.correct_answer) return [styles.optionLetter, styles.optionLetterCorrect];
    if (submitted && option === selected) return [styles.optionLetter, styles.optionLetterWrong];
    return [styles.optionLetter];
  };

  const getLetterTextColor = (option) => {
    if ((!submitted && selected === option) ||
        (submitted && (option === currentQuestion.correct_answer || option === selected))) {
      return '#fff';
    }
    return colors.textSecondary;
  };

  // ── Loading / error states ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading practice questions...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{loadError}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Blue header */}
      <View style={styles.blueHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleQuit} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{paper?.title || 'Practice'}</Text>
          <Text style={[styles.timer, timerWarning && styles.timerWarning]}>
            {mins}:{secs}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.questionCounter}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {/* Answer options */}
        {currentQuestion.options.map((option, i) => (
          <TouchableOpacity
            key={option}
            style={getOptionStyle(option)}
            onPress={() => !submitted && setSelected(option)}
            activeOpacity={submitted ? 1 : 0.7}
          >
            <View style={getLetterStyle(option)}>
              <Text style={[styles.optionLetterText, { color: getLetterTextColor(option) }]}>
                {OPTION_LETTERS[i]}
              </Text>
            </View>
            <Text style={getOptionTextStyle(option)}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isLast ? 'Submit' : 'Next Question →'}
          onPress={handleNext}
          disabled={!selected || submitted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 16, color: colors.textSecondary, fontSize: 15 },
  errorText: { color: colors.error, fontSize: 15, textAlign: 'center', marginBottom: 24 },
  blueHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  timer: { color: '#fff', fontSize: 15, fontWeight: '700', minWidth: 48, textAlign: 'right' },
  timerWarning: { color: '#FFD700' },
  progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginBottom: 8 },
  progressFill: { height: 5, backgroundColor: '#fff', borderRadius: 3 },
  questionCounter: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 16 },
  questionCard: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  questionText: { fontSize: 17, color: colors.textPrimary, fontWeight: '600', lineHeight: 26 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border,
    padding: 14, marginBottom: 10,
  },
  optionSelected: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e8f1fb', borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.primary,
    padding: 14, marginBottom: 10,
  },
  optionCorrect: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.badgeSuccess, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.badgeSuccessText,
    padding: 14, marginBottom: 10,
  },
  optionWrong: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.badgeError, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.badgeErrorText,
    padding: 14, marginBottom: 10,
  },
  optionLetter: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  optionLetterSelected: { backgroundColor: colors.primary },
  optionLetterCorrect: { backgroundColor: colors.badgeSuccessText },
  optionLetterWrong: { backgroundColor: colors.badgeErrorText },
  optionLetterText: { fontSize: 13, fontWeight: '700' },
  optionText: { flex: 1, fontSize: 15, color: colors.textPrimary },
  optionTextSelected: { flex: 1, fontSize: 15, color: colors.primary, fontWeight: '600' },
  optionTextCorrect: { flex: 1, fontSize: 15, color: colors.badgeSuccessText, fontWeight: '600' },
  optionTextWrong: { flex: 1, fontSize: 15, color: colors.badgeErrorText, fontWeight: '600' },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
});
