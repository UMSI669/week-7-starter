import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './config';

export function observeAuthState(onUser, onError) {
  return onAuthStateChanged(auth, onUser, onError);
}

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function signOutCurrentUser() {
  return signOut(auth);
}
