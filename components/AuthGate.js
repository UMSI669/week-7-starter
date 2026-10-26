import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { observeAuthState, signIn, signOutCurrentUser, signUp } from '../firebase/authService';

function friendlyError(error) {
  switch (error.code) {
    case 'auth/invalid-email': return 'Enter a valid email address.';
    case 'auth/email-already-in-use': return 'This email already has an account. Try signing in.';
    case 'auth/weak-password': return 'Choose a password with at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'The email or password did not work. Please try again.';
    case 'auth/network-request-failed': return 'Could not connect. Check your internet connection and try again.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait before trying again.';
    case 'auth/operation-not-allowed': return 'Email/password sign-in must be enabled in Firebase Console.';
    default: return 'We could not complete that action. Please try again.';
  }
}

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => observeAuthState(nextUser => {
    setUser(nextUser);
    setReady(true);
  }, authError => {
    setError(friendlyError(authError));
    setReady(true);
  }), []);

  async function runAuth(operation) {
    setBusy(true);
    setError('');
    try {
      await operation(email, password);
      setPassword('');
    } catch (authError) {
      setError(friendlyError(authError));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <View style={styles.panel}><ActivityIndicator /><Text>Checking your sign-in…</Text></View>;
  }

  if (user) {
    return (
      <>
        <View style={styles.panel}>
          <Text style={styles.label}>Signed in as {user.email}</Text>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => runAuth(signOutCurrentUser)} style={[styles.button, busy && styles.disabled]}>
            <Text style={styles.buttonText}>{busy ? 'Please wait…' : 'Sign out'}</Text>
          </Pressable>
        </View>
        {children}
      </>
    );
  }

  const disabled = busy || !email.trim() || !password;
  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Join your group</Text>
      <Text>Create an account or sign in to open the task board.</Text>
      <TextInput accessibilityLabel="Email" placeholder="Email" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} editable={!busy} style={styles.input} />
      <TextInput accessibilityLabel="Password" placeholder="Password" autoCapitalize="none" autoCorrect={false} secureTextEntry value={password} onChangeText={setPassword} editable={!busy} style={styles.input} />
      <Text style={styles.hint}>For a new account, choose a password with at least 6 characters.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        <Pressable accessibilityRole="button" disabled={disabled} onPress={() => runAuth(signUp)} style={[styles.button, disabled && styles.disabled]}>
          <Text style={styles.buttonText}>{busy ? 'Please wait…' : 'Create account'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={disabled} onPress={() => runAuth(signIn)} style={[styles.button, disabled && styles.disabled]}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12 },
  heading: { color: '#17213a', fontSize: 20, fontWeight: '800' },
  label: { color: '#17213a', fontSize: 15 },
  input: { borderColor: '#d8deeb', borderWidth: 1, borderRadius: 10, minHeight: 46, paddingHorizontal: 13, color: '#17213a', fontSize: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: { alignItems: 'center', backgroundColor: '#3558bd', borderRadius: 10, padding: 13 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  disabled: { backgroundColor: '#aab7d9' },
  error: { color: '#a32d32', fontSize: 14 },
  hint: { color: '#66738a', fontSize: 13 },
});
