import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import App from '../App';
import { createMessage, subscribeToMessages } from '../firebase/messageService';
import { observeAuthState, signIn, signOutCurrentUser, signUp } from '../firebase/authService';

jest.mock('../firebase/authService', () => ({
  observeAuthState: jest.fn(),
  signIn: jest.fn(),
  signOutCurrentUser: jest.fn(),
  signUp: jest.fn(),
}));

jest.mock('../firebase/messageService', () => ({
  createMessage: jest.fn(),
  subscribeToMessages: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const signedInUser = { uid: 'user-42', email: 'student@example.com' };
let authListener;
let messageListener;
let messageErrorListener;
let authUnsubscribe;
let messageUnsubscribe;

function signInUser(rendered) {
  if (authListener) act(() => authListener(signedInUser));
  return rendered;
}

beforeEach(() => {
  authUnsubscribe = jest.fn();
  messageUnsubscribe = jest.fn();
  observeAuthState.mockImplementation(callback => {
    authListener = callback;
    return authUnsubscribe;
  });
  subscribeToMessages.mockImplementation((onMessages, onError) => {
    messageListener = onMessages;
    messageErrorListener = onError;
    return messageUnsubscribe;
  });
  signIn.mockResolvedValue(undefined);
  signUp.mockResolvedValue(undefined);
  signOutCurrentUser.mockResolvedValue(undefined);
  createMessage.mockResolvedValue({ id: 'created-message' });
});

test('shows auth loading state before Firebase resolves, then signed-out controls', () => {
  const screen = render(<App />);
  expect(screen.getByText('Checking your sign-in…')).toBeTruthy();
  if (authListener) act(() => authListener(null));
  expect(screen.getByText('Welcome to the message board')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Create account' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
});

test('sign up, sign in, and sign out use services and auth errors are friendly', async () => {
  const screen = render(<App />);
  if (authListener) act(() => authListener(null));
  fireEvent.changeText(screen.getByLabelText('Email'), 'student@example.com');
  fireEvent.changeText(screen.getByLabelText('Password'), 'not-visible-password');
  expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true);
  expect(screen.queryByText('not-visible-password')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
  await waitFor(() => expect(signUp).toHaveBeenCalledWith('student@example.com', 'not-visible-password'));
  fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  await waitFor(() => expect(signIn).toHaveBeenCalledWith('student@example.com', 'not-visible-password'));

  signIn.mockRejectedValueOnce(new Error('That email or password did not work.'));
  fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText('That email or password did not work.')).toBeTruthy();

  signInUser(screen);
  fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
  await waitFor(() => expect(signOutCurrentUser).toHaveBeenCalledTimes(1));
});

test('signed-in user sees live messages and author information', async () => {
  const screen = render(<App />);
  signInUser(screen);
  expect(screen.getByText('Loading messages…')).toBeTruthy();
  act(() => messageListener([
    { id: 'message-one', text: 'Hello from the other client', authorEmail: 'other@example.com' },
  ]));
  expect(await screen.findByText('Hello from the other client')).toBeTruthy();
  expect(screen.getByText('other@example.com')).toBeTruthy();

  act(() => messageListener([
    { id: 'message-two', text: 'A newer update', authorEmail: 'new@example.com' },
  ]));
  expect(await screen.findByText('A newer update')).toBeTruthy();
  expect(screen.queryByText('Hello from the other client')).toBeNull();
});

test('empty and whitespace messages are disabled; successful send clears input', async () => {
  const screen = render(<App />);
  signInUser(screen);
  const send = screen.getByRole('button', { name: 'Send' });
  const input = screen.getByLabelText('Message');
  expect(send.props.accessibilityState.disabled).toBe(true);
  fireEvent.changeText(input, '   ');
  expect(screen.getByRole('button', { name: 'Send' }).props.accessibilityState.disabled).toBe(true);
  fireEvent.changeText(input, 'A short note');
  fireEvent.press(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(createMessage).toHaveBeenCalledWith({ text: 'A short note', user: signedInUser }));
  await waitFor(() => expect(screen.getByLabelText('Message').props.value).toBe(''));
});

test('failed message write preserves the draft and displays an error', async () => {
  createMessage.mockRejectedValueOnce(new Error('Offline for this test.'));
  const screen = render(<App />);
  signInUser(screen);
  fireEvent.changeText(screen.getByLabelText('Message'), 'Keep this draft');
  fireEvent.press(screen.getByRole('button', { name: 'Send' }));
  expect(await screen.findByText('Offline for this test.')).toBeTruthy();
  expect(screen.getByLabelText('Message').props.value).toBe('Keep this draft');
});

test('unmount cleans up both authentication and Firestore listeners', () => {
  const screen = render(<App />);
  signInUser(screen);
  screen.unmount();
  expect(authUnsubscribe).toHaveBeenCalledTimes(1);
  expect(messageUnsubscribe).toHaveBeenCalledTimes(1);
});

test('renders a helpful empty state and message listener errors', () => {
  const screen = render(<App />);
  signInUser(screen);
  act(() => messageListener([]));
  expect(screen.getByText('No messages yet. Start the conversation!')).toBeTruthy();
  act(() => messageErrorListener(new Error('Rules denied this read.')));
  expect(screen.getByText('Messages could not be loaded: Rules denied this read.')).toBeTruthy();
});
