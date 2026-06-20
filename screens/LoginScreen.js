// LoginScreen.js
// The first screen users see. Handles email + password login.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView, // Prevents keyboard from covering inputs on iOS
  Platform,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  // useState stores form values locally in this component
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Basic client-side validation before sending to the backend
  const validate = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return; // Stop if validation fails

    setLoading(true);
    try {
      // TODO: Replace this with a real API call to POST /login
      // const response = await fetch('http://YOUR_BACKEND/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });

      // Simulate network delay for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Logged in!');
      // TODO: Navigate to Dashboard once it exists:
      // navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      // Always runs — stops the loading spinner whether success or error
      setLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView pushes the form up when keyboard appears
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Log in to continue learning</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}       // Updates state on every keystroke
        keyboardType="email-address"  // Shows email keyboard on mobile
        autoCapitalize="none"         // Prevents auto-capitalizing email
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}        // Hides password characters
      />

      {/* Navigate to ForgotPassword screen */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading} // Prevent double-tapping while loading
      >
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      {/* Navigate to Register screen */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>
          Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 14,
    color: '#1a1a2e',
  },
  forgotText: {
    color: '#4a90d9',
    textAlign: 'right',
    marginBottom: 24,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4a90d9',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4e8', // Lighter color when disabled
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  linkBold: {
    color: '#4a90d9',
    fontWeight: '600',
  },
});
