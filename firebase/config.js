import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const environmentNames = {
  apiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'EXPO_PUBLIC_FIREBASE_APP_ID',
};
const missingSettings = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => environmentNames[key]);

export const firebaseConfigError = missingSettings.length
  ? `Firebase is not configured. Add these values to .env: ${missingSettings.join(', ')}. Then restart Expo.`
  : null;

// Reuse the default app during Expo Fast Refresh. Do not initialize Firebase
// until the local project configuration is present.
export const app = firebaseConfigError
  ? null
  : (getApps().length ? getApp() : initializeApp(firebaseConfig));
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
