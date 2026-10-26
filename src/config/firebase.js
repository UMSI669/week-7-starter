import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Values come from the .env file in the project root (see .env.example).
// EXPO_PUBLIC_ variables are bundled into the app, so they are not secrets.
// Firestore Security Rules (firestore.rules) are what protect the data.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// If .env is missing or empty, Firebase throws auth/invalid-api-key on startup.
// App.js checks this flag and shows setup instructions instead of crashing.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  // Guard against creating a second app during Expo Fast Refresh.
  const isFirstInit = getApps().length === 0;
  app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

  // AsyncStorage persistence keeps the user signed in after the app is closed.
  // initializeAuth can only be called once, so reuse the instance on reloads.
  auth = isFirstInit
    ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
    : getAuth(app);

  db = getFirestore(app);
}

export { app, auth, db };
