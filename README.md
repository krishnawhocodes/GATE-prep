# GATE Mission Control

A personal GATE CSE command center for lecture tracking, planner tasks, study timer, revision queue, practice logs, mistakes, doubts, DSA, analytics and cloud sync.

## Local run

```bash
npm install
npm run dev
```

## Firebase setup for cloud sync

The app works with localStorage without Firebase. Firebase is only needed if you want login and cross-device sync.

1. Create a Firebase project.
2. Add a Web App in Firebase Project Settings.
3. Enable Authentication → Sign-in method → Google.
4. Enable Firestore Database.
5. Use these Firestore rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gateMissionUsers/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Create `.env.local` using `.env.example` and paste your Firebase web config.

## Vercel deployment

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add the same `VITE_FIREBASE_*` variables in Vercel → Project Settings → Environment Variables.
7. Deploy.
8. In Firebase Authentication → Settings → Authorized domains, add your Vercel domain.

## Notes

- The app persists locally in the browser even without Firebase.
- When signed in, the app saves the whole tracker state to Firestore at `gateMissionUsers/{uid}/app/main`.
- Use Data Manager to export JSON backups anytime.
