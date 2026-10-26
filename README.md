# Firebase Tour: a realtime message board

A small Expo + React Native application for learning the Firebase ideas that matter when collaborating on prototypes: Authentication, Firestore documents, and realtime updates. The app has one screen and uses React state and effects-no Redux, navigation framework, backend proxy, or production architecture detour.


## Student setup
Fork this to a new repository

```sh
git clone <your-fork-repository-url>
cd firebase-tour
npm install
cp .env.example .env
npm start
```

### Step 1: Create App
In Firebase Console, create app - choose "web"

### Step 2: Enable Firebase Authentication
To allow users to sign up and sign in:
In the left-hand navigation menu of the Firebase console, expand Security and click Authentication.
Click Get started.
Under the Sign-in method tab, select Email/Password, toggle it to Enabled, and click Save.
### Step 3: Enable Cloud Firestore
To store your app's messages:
In the left-hand navigation menu, under Databses and Storage, click Firestore.
Click Create database.
Select your database location and click Next.
Choose Start in test mode for your initial setup (this lets you read and write immediately while you are developing), and click Create.


Copy `.env.example` to `.env` and paste their Firebase **web** configuration into `.env`. Expo substitutes `EXPO_PUBLIC_*` values into the client application. The local `.env` workflow helps avoid accidental repository commits; it does **not** make these client configuration values secret. The security boundary is Firebase Authentication together with Firebase Security Rules. Never put Admin SDK credentials, service-account JSON, or private keys in these variables. This course does not use a backend configuration proxy.

## The tour

Complete **Parts 1–8 in order**. Search the repository for `PART 1`, `PART 2`, and so on. Most parts say exactly which import, return statement, or effect block to uncomment; you should not need to invent Firebase code. For a `/* ... */` block, remove the two comment markers as directed. Each part includes why the code matters, a product question, a verification, and the next destination. At the end of each part, run:

```sh
npm run check-progress
npm test
```

The progress checker parses active JavaScript with Babel rather than counting lesson comments. Its `--report-only` mode is for the starter branch's CI report. The normal checker exits nonzero when a lesson is incomplete and prints a concrete next step.

1. Configure and initialize Firebase from environment values.
2. Observe the asynchronous Authentication state and show the right screen.
3. Sign up, sign in, and sign out with email and password.
4. Create a Firestore message associated with the current user's UID and email.
5. Demonstrate a one-time read and preserve each document's Firestore ID.
6. Replace the app's startup read with a realtime subscription.
7. Clean up both Auth and Firestore subscriptions when effects end.
8. Read the minimal Firestore Security Rules and discuss what the UI can-and cannot-protect.

The message document is intentionally flat: `text`, `authorId`, `authorEmail`, and `createdAt`. Firestore's document ID is included as `id` when data is mapped to the UI, and the query orders by newest first.


## Testing

Unit tests use mocked Firebase SDK functions or mocked service modules. They make no network calls, require no Firebase project or `.env`, and do not write to the live class Firebase project. Tests cover configuration's duplicate-initialization guard, auth UI and operations, message writes/reads, document IDs, realtime updates, and listener cleanup. `npm run test:infrastructure` checks starter setup independently from unfinished product features.

Real-device/manual verification is still needed to confirm cross-client realtime behavior against a configured Firebase project. Open the app on two clients signed into different accounts, send a message from one, and check that it appears on the other without refreshing.


You must be able to identify the authentication observer, Firestore write, one-time read, realtime listener, and cleanup function in your completed code.
