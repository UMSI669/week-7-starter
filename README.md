# commonplace

A small community board built with Expo + React Native and Firebase. People create an account, sign in, and share short threads (a title and some text) in a shared feed, "The common room." New threads show up on every signed-in device as soon as they're posted, with no refresh.

The UI follows the team's commonplace Figma file.

## What the app does

- **Log in or sign up.** The login screen takes an email and password. "Sign up" opens a create-account dialog (passwords need at least 8 characters). Both password fields have a show/hide toggle.
- **Read the feed.** Once signed in, you see every thread, newest first, with the author's initials, email, and when it was posted.
- **Start a thread.** The blue **+** button opens a composer. Add a title and content, then **Publish thread**.
- **Log out.** Tap your initials in the top-right corner, then **Log out**.

## How it uses Firebase

All Firebase code lives in [`firebase/`](firebase/); [`App.js`](App.js) only calls those functions.

### Authentication: who you are

[`firebase/authService.js`](firebase/authService.js) uses Firebase Authentication with email/password.

| Action | Firebase call |
|---|---|
| Create account | `createUserWithEmailAndPassword` |
| Log in | `signInWithEmailAndPassword` |
| Log out | `signOut` |
| Watch sign-in state | `onAuthStateChanged` |

`App.js` subscribes to `onAuthStateChanged` when it starts. Firebase tells the app whether someone is already signed in, and the app shows the login screen or the feed. The app never decides this itself, so signing in, signing up, or logging out all flow through that one listener.

### Firestore: where threads are stored

[`firebase/threadService.js`](firebase/threadService.js) saves each thread as a document in the `threads` collection in Cloud Firestore:

| Field | Value |
|---|---|
| `title` | Thread title (trimmed, required) |
| `content` | Thread body (trimmed, required) |
| `authorId` | The signed-in user's Firebase UID |
| `authorEmail` | The signed-in user's email |
| `createdAt` | `serverTimestamp()`, set by Firebase, not the phone's clock |

`createThread` writes a new document with `addDoc`. Firestore generates the document ID, which the app uses as the list key.

### Realtime updates: seeing new threads instantly

`subscribeToThreads` uses Firestore's `onSnapshot` on the `threads` collection, ordered by `createdAt` newest first. Firestore sends the current list immediately and then again every time a thread is added, so when anyone publishes, every signed-in device updates on its own.

The subscription starts when a user signs in and is unsubscribed when they log out or the app closes. The auth listener is cleaned up the same way.

### Security rules

[`firestore.rules`](firestore.rules) is where the data is actually protected. Hiding a button doesn't stop anyone.

- Only signed-in users can read threads.
- Only signed-in users can create threads, and only as themselves: `authorId` must match their UID, `title` and `content` must be non-empty strings, and `createdAt` must be the server time.
- Nobody can edit or delete threads.

## Run it locally

1. Install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file in the project root with the Firebase **web** app config (Firebase Console → Project settings → General → Your apps):
   ```sh
   EXPO_PUBLIC_FIREBASE_API_KEY=
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   EXPO_PUBLIC_FIREBASE_APP_ID=
   ```
   `.env` is git-ignored. These values identify the Firebase project but aren't secret; the security rules above are what protect the data. Never put Admin SDK or service-account credentials here.
3. In the Firebase Console, make sure **Authentication → Email/Password** is enabled and a **Cloud Firestore** database exists. Publish `firestore.rules` to it.
4. Start the app (`-c` clears Metro's cache, which is needed after changing `.env`):
   ```sh
   npx expo start -c --ios      # or --android, --web
   ```

### Try the realtime feed

Open the app on two devices or simulators, signed in with different accounts. Publish a thread on one and watch it appear on the other without refreshing.

## Project layout

| Path | What's there |
|---|---|
| `App.js` | Every screen: login, create-account dialog, feed, thread composer |
| `firebase/config.js` | Initializes Firebase from the `.env` values |
| `firebase/authService.js` | Sign up, log in, log out, and the sign-in listener |
| `firebase/threadService.js` | Create threads and subscribe to the live feed |
| `firestore.rules` | Firestore security rules |
| `assets/icons/` | SVG icons exported from Figma |
| `metro.config.js` | Lets `App.js` import the `.svg` icons as components |

`firebase/messageService.js` and the tests in `__tests__/` are left over from the class starter (a simple message board) and haven't been updated for threads yet.
