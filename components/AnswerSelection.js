import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function AnswerSelection({ options, selected, onSelect }) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = selected === option;
        return (
          <TouchableOpacity
            key={index}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <View style={[styles.bullet, isSelected && styles.bulletSelected]}>
              <Text style={[styles.bulletText, isSelected && styles.bulletTextSelected]}>
                {String.fromCharCode(65 + index)}
              </Text>
            </View>
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EBF3FD',
  },
  bullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bulletSelected: {
    backgroundColor: colors.primary,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  bulletTextSelected: {
    color: '#fff',
  },
  optionText: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
});
