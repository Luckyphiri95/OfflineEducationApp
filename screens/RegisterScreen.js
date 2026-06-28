import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import colors from '../theme/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import BASE_URL from '../config';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!name || !email || !password || !confirmPassword) { setError('Please fill in all fields'); return false; }
    if (!email.includes('@')) { setError('Please enter a valid email address'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return false; }
    setError('');
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message || 'Registration failed. Please try again.'); return; }
      setSuccess(true);
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successPage}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Account Created!</Text>
          <Text style={styles.successMessage}>
            Your account has been successfully created. You can now log in and start learning.
          </Text>
          <Button title="OK — Go to Login" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Blue top section with back button */}
      <View style={styles.blueHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Create Account</Text>
        <Text style={styles.heroSubtitle}>Join and start learning today</Text>
      </View>

      {/* White form section */}
      <View style={styles.formSheet}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Input label="Full Name" value={name} onChangeText={(v) => { setName(v); setError(''); }} placeholder="Enter your full name" />
          <Input label="Email" value={email} onChangeText={(v) => { setEmail(v); setError(''); }} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" value={password} onChangeText={(v) => { setPassword(v); setError(''); }} placeholder="Enter your password" secureTextEntry />
          <Input label="Confirm Password" value={confirmPassword} onChangeText={(v) => { setConfirmPassword(v); setError(''); }} placeholder="Confirm your password" secureTextEntry />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button title={loading ? 'Creating Account...' : 'Sign Up'} onPress={handleRegister} disabled={loading} />

          <View style={styles.bottomRow}>
            <Text style={styles.caption}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  blueHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 20,
  },
  backText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '500',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 22,
  },
  formSheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 32,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  successPage: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
});
