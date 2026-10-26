jest.mock('../firebase/config', () => ({ db: { name: 'test-database' } }));
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn((database, name) => ({ database, name })),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn((field, direction) => ({ field, direction })),
  query: jest.fn((...parts) => ({ parts })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}));

import { addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { createMessage, loadMessagesOnce, subscribeToMessages } from '../firebase/messageService';

const user = { uid: 'uid-7', email: 'writer@example.com' };

beforeEach(() => {
  collection.mockImplementation((database, name) => ({ database, name }));
});

test('creates trimmed, authenticated document data with a server timestamp', async () => {
  await createMessage({ text: '  hello  ', user });
  expect(addDoc).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'messages' }),
    { text: 'hello', authorId: 'uid-7', authorEmail: 'writer@example.com', createdAt: 'SERVER_TIMESTAMP' },
  );
  expect(serverTimestamp).toHaveBeenCalledTimes(1);
});

test('rejects blank text without making a Firestore write', async () => {
  await expect(createMessage({ text: '  ', user })).rejects.toThrow('Write a message before sending.');
  expect(addDoc).not.toHaveBeenCalled();
});

test('one-time read orders by newest and preserves each document ID', async () => {
  getDocs.mockResolvedValue({
    docs: [
      { id: 'firestore-123', data: () => ({ text: 'A message', authorEmail: 'writer@example.com' }) },
    ],
  });
  const result = await loadMessagesOnce();
  expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
  expect(query).toHaveBeenCalled();
  expect(result).toEqual([{ id: 'firestore-123', text: 'A message', authorEmail: 'writer@example.com' }]);
});

test('realtime subscription maps document IDs and returns Firestore unsubscribe', () => {
  const unsubscribe = jest.fn();
  const onMessages = jest.fn();
  const onError = jest.fn();
  onSnapshot.mockImplementation((messagesQuery, callback) => {
    callback({ docs: [{ id: 'stable-id', data: () => ({ text: 'Live message' }) }] });
    return unsubscribe;
  });

  expect(subscribeToMessages(onMessages, onError)).toBe(unsubscribe);
  expect(onMessages).toHaveBeenCalledWith([{ id: 'stable-id', text: 'Live message' }]);
  expect(onSnapshot.mock.calls[0][2]).toBe(onError);
});
