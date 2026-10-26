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

## Database and realtime updates

Tasks are saved in the `tasks` collection, with `title` (string), `completed`
(boolean), `authorId` (UID), and `createdAt` (server timestamp).
`firebase/taskService.js` creates tasks and updates their completion status.
`firebase/realtimeService.js` provides `subscribeToTasks(onTasks, onError)`,
preserves Firestore IDs, sorts by creation time, and returns listener cleanup.
`components/TaskBoard.js` subscribes after signin and updates the list and counts
from snapshots, including changes from other clients. Signout unmounts the board,
stops the listener, and clears its task state. Failed writes preserve the draft;
loading, empty, error, and retry states are shown in the board.

All task documents must include `createdAt` to appear in the ordered query.

## Publish Firestore rules

In Firebase Console > Firestore > Rules, paste `firestore.rules` and click Publish.
This file is not deployed by committing or pushing it to GitHub. The rules allow
signed-in users to read tasks, create tasks using their own UID, and change any
shared task's completion status. Changes to author, title, and creation time are
not allowed. Deletion is not part of this prototype. These are prototype rules
for one shared board, not a system for separating multiple private groups.

## Manual database and realtime checks

1. Open two independent sessions (for example a normal and a private browser
   window) and sign into different accounts using the same Firebase project.
2. Add a task in session A. It should appear in B without refreshing, with the
   same title and completion status.
3. Complete the task in B. Both clients' checkbox and counts should update.
4. Refresh A and confirm the task persists.
5. Sign out and confirm the board is hidden. Sign in again and confirm tasks load.
6. Check the tasks collection in Firebase Console for the four agreed fields.

## Manual authentication checks

1. Create an account with an email and a password of at least six characters.
2. Confirm the signed-in email and task board appear, and the user is listed in
   Firebase Console > Authentication > Users.
3. Sign out; the task board should be replaced by the signin form.
4. Sign in with the same account and confirm the board returns.
5. Try an incorrect password and confirm an error appears without opening the board.
6. Reload after signing in to check that the observer restores the web session.

These live checks must be performed against the configured group project.
