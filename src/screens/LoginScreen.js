import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors, serifFont, softShadow } from '../theme';

// Turn Firebase error codes into short, friendly messages.
function friendlyError(error) {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/missing-password':
      return 'Please enter a password.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // On success, onAuthStateChanged in App.js switches to the Chat Room.
  async function runAuth(action) {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      await action(auth, email.trim(), password);
    } catch (e) {
      setError(friendlyError(e));
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.title}>Mini Chat Room</Text>
        <Text style={styles.subtitle}>Log in or create an account to join the chat.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {busy ? (
          <ActivityIndicator style={styles.spinner} color={colors.primary} />
        ) : (
          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={() => runAuth(signInWithEmailAndPassword)}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Log in</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={() => runAuth(createUserWithEmailAndPassword)}
            >
              <Text style={styles.buttonText}>Create account</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 34,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 16,
    fontSize: 17,
    color: colors.text,
    marginBottom: 14,
    ...softShadow,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  spinner: {
    marginTop: 16,
  },
  buttons: {
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
  },
  button: {
    backgroundColor: colors.background,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'center',
    ...softShadow,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  primaryButtonText: {
    color: '#fff',
  },
});
