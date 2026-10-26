# Equipment Maintenance Tracker

## Project Description

The Equipment Maintenance Tracker is a basic mobile application built with React Native, Expo, and Firebase. It allows users to create accounts, sign in, and record information about equipment that needs maintenance.

## Features

- **Firebase Authentication:** Users can create accounts, sign in, and sign out.
- **Cloud Firestore:** Users can add equipment names and maintenance statuses, which are saved in the database.
- **Real-Time Updates:** Equipment records automatically update in the application when information changes in Firestore.

## Technologies Used

- React Native
- Expo
- JavaScript
- Firebase Authentication
- Cloud Firestore

## How to Run

1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file containing the Firebase configuration variables.
4. Run `npx expo start`.
5. Open the application using Expo Go.

## Testing

I tested the application by creating a user account, signing in, adding equipment, and verifying that the information was saved in Firestore. I also tested real-time updates by changing equipment information in Firebase and observing the changes in the application.

## AI Use

I used ChatGPT for step-by-step guidance in setting up Firebase Authentication, Firestore database storage, and real-time updates. I also used AI assistance to troubleshoot errors and understand how the different parts of the application work.
