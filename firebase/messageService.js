import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

// ======================================================
// CREATE A MESSAGE
// ======================================================
export async function createMessage({ text, user }) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('Write a message before sending.');
  }
  if (!user) {
    throw new Error('Sign in before sending a message.');
  }

  // Uncomment this block to create the Firestore document:
  return addDoc(collection(db, 'messages'), {
    text: trimmedText,
    authorId: user.uid,
    authorEmail: user.email,
    createdAt: serverTimestamp(),
  });
}

// ======================================================
// READ MESSAGES ONCE
// ======================================================
export async function loadMessagesOnce() {
  // Uncomment this block for the one-time read:
  const messagesQuery = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(messagesQuery);
  return snapshot.docs.map(documentSnapshot => ({
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  }));
}

// ======================================================
// REALTIME MESSAGE SUBSCRIPTION
// ======================================================
export function subscribeToMessages(onMessages, onError) {
  // Uncomment this block to subscribe to live changes:
  const messagesQuery = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    messagesQuery,
    snapshot => {
      const nextMessages = snapshot.docs.map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data(),
      }));
      onMessages(nextMessages);
    },
    onError,
  );
}
