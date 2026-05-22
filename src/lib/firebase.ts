import { initializeApp, getApps, type FirebaseApp } from "@firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
  type Auth,
} from "@firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  type Firestore,
} from "@firebase/firestore";
import type { AppState } from "./types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebase() {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth: auth!, db: db! };
}

export type CloudUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export function toCloudUser(user: User | null): CloudUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export function subscribeToCloudAuth(callback: (user: CloudUser | null) => void) {
  const services = getFirebase();
  if (!services) return () => {};
  return onAuthStateChanged(services.auth, (user) => callback(toCloudUser(user)));
}

function appDocRef(uid: string) {
  const services = getFirebase();
  if (!services) throw new Error("Firebase is not configured");
  return doc(services.db, "gateMissionUsers", uid, "app", "main");
}

export async function signInWithGoogle() {
  const services = getFirebase();
  if (!services) throw new Error("Firebase environment variables are missing");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithPopup(services.auth, provider);
}

export async function signOutFromFirebase() {
  const services = getFirebase();
  if (!services) return;
  await signOut(services.auth);
}

export async function loadCloudState(uid: string): Promise<AppState | null> {
  const snap = await getDoc(appDocRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { state?: AppState };
  return data.state ?? null;
}

export async function saveCloudState(uid: string, state: AppState) {
  await setDoc(
    appDocRef(uid),
    {
      schemaVersion: 1,
      updatedAt: serverTimestamp(),
      state,
    },
    { merge: true },
  );
}
