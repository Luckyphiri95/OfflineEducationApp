import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import colors from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.topSection}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join and start tracking your learning progress.</Text>
      </View>

      <View style={styles.formCard}>
        <Input label="Full Name" value={name} onChangeText={setName} placeholder="Enter your name" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="Enter your email" />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          secureTextEntry
        />
        <Button title="Register" onPress={() => navigation.replace('Dashboard')} />

        <View style={styles.bottomRow}>
          <Text style={styles.caption}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  topSection: {
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  linkText: {
    color: colors.primary,
    fontSize: 15,
    marginBottom: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  caption: {
    color: colors.textSecondary,
  },
});