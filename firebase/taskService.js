import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './config';

export async function createTask({ title, user }) {
  if (!user) throw new Error('Sign in before adding a task.');
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error('Enter a task title.');
  if (trimmedTitle.length > 80) throw new Error('Keep the task title to 80 characters or fewer.');

  return addDoc(collection(db, 'tasks'), {
    title: trimmedTitle,
    completed: false,
    authorId: user.uid,
    createdAt: serverTimestamp(),
  });
}

export async function setTaskCompleted({ taskId, completed, user }) {
  if (!user) throw new Error('Sign in before changing a task.');
  if (!taskId || typeof completed !== 'boolean') throw new Error('Choose a valid task and completion status.');
  return updateDoc(doc(db, 'tasks', taskId), { completed });
}
