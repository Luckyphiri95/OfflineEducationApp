import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import colors from '../theme/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import BASE_URL from '../config';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(`${BASE_URL}/api/auth/reset-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error();
      setSent(true);
    } catch (err) {
      setError('Could not send your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.successPage}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>📨</Text>
          <Text style={styles.successTitle}>Request Sent</Text>
          <Text style={styles.successMessage}>
            An admin will reset the password for{' '}
            <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{email}</Text>
            {' '}and let you know your new password.
          </Text>
          <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Blue header with back button */}
      <View style={styles.blueHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Forgot Password?</Text>
        <Text style={styles.heroSubtitle}>Send a request and an admin will reset your password for you</Text>
      </View>

      {/* White form */}
      <View style={styles.formSheet}>
        <Input
          label="Email Address"
          value={email}
          onChangeText={(v) => { setEmail(v); setError(''); }}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Message (optional)"
          value={message}
          onChangeText={setMessage}
          placeholder="Anything the admin should know"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={loading ? 'Sending...' : 'Send Request to Admin'}
          onPress={handleReset}
          disabled={loading}
        />
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
    fontSize: 28,
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
    fontSize: 52,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
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
