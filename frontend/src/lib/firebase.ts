import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ─── Firebase Configuration ───
// Built-in Safe-Mode: We bake the credentials directly to bypass CI injection failures,
// while still allowing dynamic overrides from environment variables.
const configRaw = import.meta.env.VITE_FIREBASE_CONFIG;
const firebaseConfig = configRaw ? JSON.parse(configRaw) : {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBSHc1dY_3rKRZfCvLPnjnlxAZzgu6uQz8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hackaphobia-roomie.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hackaphobia-roomie",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hackaphobia-roomie.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "562503050786",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:562503050786:web:3ea9ba4990f91b7c6f4c7b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XBGKK943H9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, facebookProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, db };

