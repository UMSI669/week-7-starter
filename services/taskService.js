import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

const TASKS_COLLECTION = 'tasks';

/**
 * Creates the group's agreed task shape. `db` and `user` come from the shared
 * Firebase/auth setup, keeping this feature independent of that setup file.
 */
export async function addTask(db, user, title) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new Error('A task title is required.');
  }
  if (!user?.uid) {
    throw new Error('You must be signed in to add a task.');
  }

  return addDoc(collection(db, TASKS_COLLECTION), {
    title: trimmedTitle,
    completed: false,
    authorId: user.uid,
    createdAt: serverTimestamp(),
  });
}

/** Updates only the completion status of an existing task. */
export function setTaskCompleted(db, taskId, completed) {
  return updateDoc(doc(db, TASKS_COLLECTION, taskId), { completed });
}
