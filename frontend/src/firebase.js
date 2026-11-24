import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signOutUser = () => signOut(auth);

export const getIdToken = () => auth.currentUser?.getIdToken();
