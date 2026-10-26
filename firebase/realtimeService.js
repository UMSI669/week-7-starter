import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './config';

// Call after sign-in. Return this cleanup function from the screen's effect.
// Every task must include createdAt to appear in this ordered query.
export function subscribeToTasks(onTasks, onError) {
  const tasksQuery = query(
    collection(db, 'tasks'),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    tasksQuery,
    snapshot => {
      onTasks(snapshot.docs.map(document => ({
        ...document.data(),
        id: document.id,
      })));
    },
    onError,
  );
}
