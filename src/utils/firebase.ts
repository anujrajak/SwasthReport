import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Validate that all required environment variables are present
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;

if (missingVars.length > 0) {
  console.warn(
    `Missing required Firebase environment variables: ${missingVars.join(
      ", "
    )}\n` +
      `Please configure Firebase environment variables. ` +
      `The app may not function correctly without these variables.`
  );
} else {
  try {
const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey!,
  authDomain: requiredEnvVars.authDomain!,
  projectId: requiredEnvVars.projectId!,
  storageBucket: requiredEnvVars.storageBucket!,
  messagingSenderId: requiredEnvVars.messagingSenderId!,
  appId: requiredEnvVars.appId!,
  measurementId: requiredEnvVars.measurementId!,
};

// Initialize Firebase
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
}

export { firebaseApp, db };
