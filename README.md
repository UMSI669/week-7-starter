# LKF Group Task Board

An Expo React Native prototype for shared group tasks.

## Run locally

Use Node.js compatible with Expo SDK 57 (22.13 or newer).

```sh
npm install
cp .env.example .env
npm start
```

Fill all six `EXPO_PUBLIC_FIREBASE_*` entries in `.env` with the web configuration
for the group's `si669-lkf-week7` Firebase project. Restart Expo after changing
environment values. Keep `.env` local; `.env.example` documents the variable names.
Client configuration is visible in the app; Firebase rules control database access.

Enable Email/Password under Firebase Authentication. Create the default Firestore
database. Press `w` in the Expo terminal for a browser preview. A physical phone's
Expo Go must support the project's SDK version.

## Authentication

`firebase/config.js` exports `app`, `auth`, and `db`. `firebase/authService.js`
provides signup, signin, signout, and the authentication observer.
`components/AuthGate.js` displays loading and error states, shows the board after
signin, clears the password after successful actions, and cleans up the observer.

## Database and realtime integration status

The board currently uses local demo tasks; task writes are not yet saved to
Firestore. The agreed collection is `tasks`, with `title` (string), `completed`
(boolean), `authorId` (UID), and `createdAt` (server timestamp).
`firebase/realtimeService.js` provides `subscribeToTasks(onTasks, onError)`,
preserves document IDs, and returns the listener cleanup function. Connecting it
to the board and integrating the team's task writes are still pending.

## Manual authentication checks

1. Create an account with an email and a password of at least six characters.
2. Confirm the signed-in email and task board appear, and the user is listed in
   Firebase Console > Authentication > Users.
3. Sign out; the task board should be replaced by the signin form.
4. Sign in with the same account and confirm the board returns.
5. Try an incorrect password and confirm an error appears without opening the board.
6. Reload after signing in to check that the observer restores the web session.

These live checks must be performed against the configured group project.
