import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './src/config/firebase';
import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Firebase restores a saved session on startup, then reports every
  // sign-in / sign-out here. Switching screens on `user` is our navigation.
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <View style={styles.loading}>
        <Text style={styles.setupTitle}>Firebase is not configured</Text>
        <Text style={styles.setupText}>
          Fill in the EXPO_PUBLIC_FIREBASE_* values in the .env file (see README), then
          restart with: npx expo start --clear
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {!authReady ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : user ? (
        <ChatScreen user={user} />
      ) : (
        <LoginScreen />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  setupText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
