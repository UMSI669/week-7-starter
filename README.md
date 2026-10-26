# Q&A Board

A small Expo React Native app for posting and answering questions, backed by Firebase.

## Features

- **Firebase Auth**: email/password sign up, log in, and log out (`/auth`)
- **Firestore storage**: questions in `questions/`, answers and discussion in `questions/{id}/replies/`
- **Real-time updates**: the list and detail screens use `onSnapshot`, so new posts appear right away on every device

## Screens

| Route | What it does |
| --- | --- |
| `/questions` | Browse, search, and post questions |
| `/questions/[id]` | View a question, post answers, and join the discussion |
| `/auth` | Log in, sign up, or log out |

## Setup

1. Copy `.env.example` to `.env` and fill in your Firebase web config values.
2. In the Firebase console, enable **Authentication → Email/Password** and create a **Firestore** database.
3. Paste `firestore.rules` into **Firestore → Rules** and publish.
4. Install and run:

```bash
npm install
npx expo start
```

> The `EXPO_PUBLIC_` keys are bundled into the app. That's fine for a class prototype, but a production app should keep secrets on a backend.
