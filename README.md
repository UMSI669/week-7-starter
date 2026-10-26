# LKF Group Task Board

An Expo React Native app where signed-in group members add tasks, see whether
they or another member created each task, and mark tasks complete. The board
and its counts update for every signed-in member as changes are saved.

## Run locally

Use Node.js compatible with Expo SDK 57 (22.13 or newer).

```sh
npm ci
npm start
```

Create a `.env` file in the app root and fill these values from the web app
configuration in the group's `si669-lkf-week7` Firebase project:

```text
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Restart Expo after changing `.env`. The file is ignored by Git. Firebase client
configuration is visible in the app; Firestore rules control database access.
If values are missing, the app shows a setup message.

Enable Email/Password under Firebase Authentication. Create the default Firestore
database. Press `w` in the Expo terminal for a browser preview. A physical phone's
Expo Go must support the project's SDK version.

## Firebase Authentication

`firebase/config.js` exports `app`, `auth`, and `db`. `firebase/authService.js`
uses Email/Password Authentication to create accounts, sign members in and out,
and observe sign-in state. `components/AuthGate.js` shows the board only to a
signed-in member and displays authentication errors.

## Firestore database

Tasks are saved in the `tasks` collection, with `title` (string), `completed`
(boolean), `authorId` (the creator's Firebase UID), and `createdAt` (server
timestamp). `firebase/taskService.js` creates tasks and changes their completion
status. Signed-in members share one board.

## Realtime updates

`firebase/realtimeService.js` listens to the Firestore `tasks` collection with
`onSnapshot`, ordered by creation time. After sign-in, `components/TaskBoard.js`
subscribes to that listener and redraws the tasks and counts when anyone adds or
completes a task. Members do not need to refresh. The listener stops on sign-out.

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
