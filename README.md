# Mini Chat Room

## App Overview

Mini Chat Room is a simple React Native (Expo) app with one shared chat room. Anyone with an account can log in, read the conversation, and post messages. New messages show up on every signed-in device right away, with no refreshing.

The app is built for SI 669 to practice three Firebase features: **Authentication**, **Database storage** (Cloud Firestore), and **Real-time updates**.

## Features

- **Sign up**: create an account with an email and password.
- **Log in**: sign in with an existing account. Simple error messages appear for problems like a wrong password, an invalid email, or a password under 6 characters.
- **Stay logged in**: the session is saved on the device, so reopening the app goes straight to the chat.
- **Chat Room**:
  - See messages from everyone, oldest at the top and newest at the bottom.
  - Your messages appear on the right in gray bubbles. Messages from other people appear on the left in white bubbles with their email above.
  - Type a message and tap the black ↑ button to send. Empty messages can't be sent.
  - Scroll up to read older messages. The list jumps to the newest message when one arrives.
- **Log out**: the *Log out* button returns you to the login screen.

## Firebase Integration

### 1. Firebase Authentication

Users sign up and log in with email and password.

| Action | Firebase function | Where |
| --- | --- | --- |
| Create account | `createUserWithEmailAndPassword()` | `src/screens/LoginScreen.js` |
| Log in | `signInWithEmailAndPassword()` | `src/screens/LoginScreen.js` |
| Log out | `signOut()` | `src/screens/ChatScreen.js` |
| Watch login state | `onAuthStateChanged()` | `App.js` |

`App.js` listens with `onAuthStateChanged()`. When a user is signed in it shows the Chat Room, and when nobody is signed in it shows the Login screen. This is how the app "navigates" after login or logout.

To keep users logged in, `src/config/firebase.js` sets up Auth with `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`, which saves the session in the device's storage.

### 2. Firebase Database (Cloud Firestore)

Messages are stored in a Firestore collection called `messages`. When a user taps send, `addDoc()` creates one document per message:

```js
{
  text: "Hello!",
  userId: "firebase-user-uid",
  senderEmail: "user@example.com",
  createdAt: serverTimestamp()
}
```

The text is trimmed first, and empty messages are not saved. The input is cleared only after the save succeeds.

### 3. Firebase Real-Time Updates

`src/screens/ChatScreen.js` subscribes to the collection with `onSnapshot()` on the query `orderBy('createdAt', 'asc')`. Firestore calls the listener once with the existing messages, then again every time *any* user adds a message, and the list re-renders. The function `onSnapshot()` returns is used as the `useEffect` cleanup, so the listener stops when the Chat screen unmounts (which happens on logout).

### Security Rules

`firestore.rules` makes sure that:

- only signed-in users can read messages,
- only signed-in users can create messages,
- a new message's `userId` must match the signed-in user's UID (no posting as someone else),
- messages can't be edited or deleted.

> **Note on API keys:** the `EXPO_PUBLIC_` variables in `.env` are bundled into the app, so anyone with the app can see them. They are **not** secrets. The data is protected by the Security Rules above, not by hiding the keys. A commercial app would need more backend setup than this assignment covers.

## Project Structure

```
App.js                      Watches auth state and shows Login or Chat
src/config/firebase.js      Firebase app, Auth (with persistence), Firestore
src/screens/LoginScreen.js  Email/password sign up and log in
src/screens/ChatScreen.js   Shared chat room: real-time list, send, log out
src/theme.js                Colors, fonts, and shadow from the reference images
src/image/                  UI reference images
firestore.rules             Firestore Security Rules
.env.example                Template for Firebase config values
```

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

(`firebase`, `@react-native-async-storage/async-storage`, and `react-native-safe-area-context` were added with `npx expo install`.)

### 2. Create a Firebase project and web app

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add project** (or open an existing one).
2. On the project overview page, click the **Web** icon (`</>`) to register a web app. You don't need Firebase Hosting.
3. Firebase shows a `firebaseConfig` object. Keep this page open for the next step.

### 3. Create the `.env` file

Copy the template in the project root:

```bash
cp .env.example .env
```

Fill each value from the `firebaseConfig` object:

```
EXPO_PUBLIC_FIREBASE_API_KEY=            # apiKey
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=        # authDomain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=         # projectId
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=     # storageBucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= # messagingSenderId
EXPO_PUBLIC_FIREBASE_APP_ID=             # appId
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=      # measurementId
```

`.env` is listed in `.gitignore`, so it is not committed. You can find the config again later under **Project settings → General → Your apps**.
The measurement ID is kept in the config, but this Expo Go app does not initialize Firebase Analytics.

### 4. Enable Email/Password Authentication

In the Firebase Console, go to **Build → Authentication → Get started → Sign-in method**. Choose **Email/Password**, turn it on, and click **Save**.

### 5. Create the Firestore database and apply the Security Rules

1. Go to **Build → Firestore Database → Create database**.
2. Pick a location and start in **production mode**.
3. Open the **Rules** tab, replace everything there with the contents of `firestore.rules`, and click **Publish**.

You don't need to create the `messages` collection yourself. Firestore creates it when the first message is sent.

### 6. Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i` for the iOS Simulator or `a` for the Android emulator. If you edit `.env` while the server is running, restart it with `npx expo start --clear`.

## Testing

### Real-time updates with two accounts

1. Start the app on **two devices or simulators** (for example, an iPhone running Expo Go and the iOS Simulator, or a simulator and an Android emulator).
2. On device A, create an account such as `alice@test.com`. On device B, create a different account such as `bob@test.com`.
3. Send a message from A. It should appear on B within a second or two, on the **left** with Alice's email, without refreshing. On A it appears on the **right** as "You".
4. Reply from B and check that it shows up on A right away.
5. In the Firebase Console under **Firestore Database → Data → messages**, check that each message has `text`, `userId`, `senderEmail`, and `createdAt`.

### Other checks

- **Persistence:** close the app completely, reopen it, and check that you are still in the Chat Room.
- **Log out:** tap *Log out* and check that you are back on the login screen.
- **Auth errors:** try a wrong password, a bad email, and a password under 6 characters. A short error message should appear for each.
- **Empty message:** the send button is disabled while the input is empty or only spaces.
