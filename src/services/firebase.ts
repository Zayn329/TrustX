import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase configuration from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if the required environment variables are set
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

for (const varName of requiredEnvVars) {
  if (!import.meta.env[varName]) {
    console.warn(`Firebase environment variable ${varName} is not set. Firebase will not be initialized.`);
  }
}

// Initialize Firebase only if all required variables are present
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (typeof window !== 'undefined') {
  // Check if all required environment variables are present (not empty strings)
  const allPresent = requiredEnvVars.every(
    (varName) => import.meta.env[varName] && import.meta.env[varName].length > 0
  );

  if (allPresent) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn('Firebase initialization skipped due to missing environment variables.');
  }
}

export { app, db };
export type { FirebaseApp, Firestore };