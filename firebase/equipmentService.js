import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { db, auth } from './config';

// Reference the equipment collection
const equipmentCollection = collection(db, 'equipment');

// Add equipment to Firestore
export const addEquipment = async (name, status) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('You must sign in first.');
  }

  return await addDoc(equipmentCollection, {
    name: name,
    status: status,
    userId: user.uid,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToEquipment = (userId, onUpdate, onError) => {
  const equipmentQuery = query(
    equipmentCollection,
    where('userId', '==', userId)
  );

  return onSnapshot(
    equipmentQuery,
    (snapshot) => {
      const equipment = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      onUpdate(equipment);
    },
    onError
  );
};
