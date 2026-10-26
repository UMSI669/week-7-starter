import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

export async function createThread({ title, content, user }) {
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  if (!trimmedTitle) {
    throw new Error('Add a title before publishing your thread.');
  }
  if (!trimmedContent) {
    throw new Error('Add some content before publishing your thread.');
  }
  if (!user) {
    throw new Error('Sign in before publishing a thread.');
  }

  return addDoc(collection(db, 'threads'), {
    title: trimmedTitle,
    content: trimmedContent,
    authorId: user.uid,
    authorEmail: user.email || 'Community member',
    createdAt: serverTimestamp(),
  });
}

export function subscribeToThreads(onThreads, onError) {
  const threadsQuery = query(
    collection(db, 'threads'),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    threadsQuery,
    snapshot => {
      onThreads(snapshot.docs.map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data(),
      })));
    },
    onError,
  );
}
