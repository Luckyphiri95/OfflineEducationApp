import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import Button from './Button';

export default function ExplanationModal({ visible, correctAnswer, explanation, hint, onContinue }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Not quite</Text>
          </View>

          <Text style={styles.label}>Correct answer</Text>
          <Text style={styles.correctAnswer}>{correctAnswer}</Text>

          <Text style={styles.label}>Explanation</Text>
          <Text style={styles.bodyText}>
            {explanation || 'No explanation provided for this question yet.'}
          </Text>

          <Text style={styles.label}>Hint / Clue</Text>
          <Text style={styles.bodyText}>
            {hint || 'No hint provided for this question yet.'}
          </Text>

          <View style={{ marginTop: 20 }}>
            <Button title="Continue" onPress={onContinue} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.badgeError,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeText: { color: colors.badgeErrorText, fontSize: 12, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginTop: 10, marginBottom: 4 },
  correctAnswer: { fontSize: 16, fontWeight: '700', color: colors.badgeSuccessText },
  bodyText: { fontSize: 14, color: colors.textPrimary, lineHeight: 21 },
});
