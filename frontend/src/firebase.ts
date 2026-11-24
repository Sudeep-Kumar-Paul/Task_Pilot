import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: env.VITE_FIREBASE_APP_ID ?? "",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? "",
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

// Toggle between mock mode and live mode
export const mockMode = env.VITE_MOCK === "true";

// Initialize instance
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function getFirebase(): Promise<{ auth: Auth; db: Firestore }> {
  return { auth, db };
}

export async function getCurrentUser(): Promise<User | null> {
  await auth.authStateReady();
  return auth.currentUser;
}

export const signInWithEmail = (email: string, pass: string) =>
  signInWithEmailAndPassword(auth, email, pass);

export const signUpWithEmail = (email: string, pass: string) =>
  createUserWithEmailAndPassword(auth, email, pass);

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signOutUser = () => signOut(auth);

export const getIdToken = async () => auth.currentUser?.getIdToken();

export function authError(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  const messages: Record<string, string> = {
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/email-already-in-use": "An account with this email already exists. Please sign in.",
    "auth/weak-password": "Use a password with at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled. Please try again.",
    "auth/popup-blocked": "Allow pop-ups in your browser to continue with Google.",
    "auth/unauthorized-domain":
      "This website needs to be added to your Firebase authorized domains.",
    "auth/operation-not-allowed": "Enable this sign-in method in your Firebase project.",
    "auth/network-request-failed": "Unable to connect. Check your connection and try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  };
  return messages[code] ?? (error instanceof Error ? error.message : "Something went wrong. Please try again.");
}
