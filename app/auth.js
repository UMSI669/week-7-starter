import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../src/firebase';
import { useAuth } from '../src/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/questions'));

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
      close();
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setBusy(false);
    }
  };

  if (initializing) return <ActivityIndicator style={{ marginTop: 32 }} />;

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>You're signed in</Text>
        <Text style={styles.subtle}>{user.email}</Text>
        <Pressable style={styles.button} onPress={close}>
          <Text style={styles.buttonText}>Back to questions</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.danger]} onPress={() => signOut(auth)}>
          <Text style={styles.buttonText}>Log out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{mode === 'login' ? 'Log in' : 'Create an account'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (6+ characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={submit} disabled={busy}>
        <Text style={styles.buttonText}>
          {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => {
          setMode(mode === 'login' ? 'signup' : 'login');
          setError('');
        }}
      >
        <Text style={styles.switch}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </Text>
      </Pressable>
    </View>
  );
}

function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account with that email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/missing-password':
      return 'Please enter a password.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtle: { fontSize: 16, color: '#6b7280', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  danger: { backgroundColor: '#dc2626' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  error: { color: '#dc2626' },
  switch: { color: '#2563eb', textAlign: 'center', marginTop: 8, fontSize: 15 },
});
