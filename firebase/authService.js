// ======================================================
// OBSERVE AUTHENTICATION STATE
// ======================================================

// PART 2 - Uncomment this import and the auth import below:
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';

// PART 3 - Uncomment this import when you reach the auth buttons:
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

export function observeAuthState(callback) {
  // Uncomment this line to connect the screen to Firebase Auth:
  return onAuthStateChanged(auth, callback);
}

// ======================================================
// SIGN UP, SIGN IN, AND SIGN OUT
// ======================================================

export function signUp(email, password) {
  // Uncomment this line to enable the Create account button:
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signIn(email, password) {
  // Uncomment this line to enable the Sign in button:
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutCurrentUser() {
  // Uncomment this line to enable the Sign out button:
  return signOut(auth);
}
