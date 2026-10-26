test('Firebase initialization is guarded and exports app, auth, and db without real credentials', () => {
  jest.resetModules();
  const app = { name: 'existing-app' };
  const auth = { name: 'auth-client' };
  const db = { name: 'firestore-client' };
  const getApps = jest.fn(() => [app]);
  const getApp = jest.fn(() => app);
  const initializeApp = jest.fn();
  const getAuth = jest.fn(() => auth);
  const getFirestore = jest.fn(() => db);
  jest.doMock('firebase/app', () => ({ getApp, getApps, initializeApp }));
  jest.doMock('firebase/auth', () => ({ getAuth }));
  jest.doMock('firebase/firestore', () => ({ getFirestore }));

  const configured = require('../firebase/config');
  expect(configured).toEqual({ app, auth, db });
  expect(getApp).toHaveBeenCalledTimes(1);
  expect(initializeApp).not.toHaveBeenCalled();
  expect(getAuth).toHaveBeenCalledWith(app);
  expect(getFirestore).toHaveBeenCalledWith(app);
});

test('Firebase initializes a first app if no app exists yet', () => {
  jest.resetModules();
  const app = { name: 'new-app' };
  const getApps = jest.fn(() => []);
  const getApp = jest.fn();
  const initializeApp = jest.fn(() => app);
  jest.doMock('firebase/app', () => ({ getApp, getApps, initializeApp }));
  jest.doMock('firebase/auth', () => ({ getAuth: jest.fn(() => ({})) }));
  jest.doMock('firebase/firestore', () => ({ getFirestore: jest.fn(() => ({})) }));

  require('../firebase/config');
  expect(initializeApp).toHaveBeenCalledTimes(1);
  expect(getApp).not.toHaveBeenCalled();
});
