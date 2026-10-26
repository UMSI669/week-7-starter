import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import { auth } from './config';

// Create a new user account
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign in an existing user
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign out the current user
export const logoutUser = () => {
  return signOut(auth);
};

// Listen for changes in authentication
export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};