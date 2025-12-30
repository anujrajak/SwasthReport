import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser,
  Auth,
} from "firebase/auth";
import { firebaseApp } from "../firebase";

const provider = new GoogleAuthProvider();

// Only initialize auth if firebaseApp is available
let auth: Auth | null = null;
try {
  if (firebaseApp) {
    auth = getAuth(firebaseApp);
  }
} catch (error) {
  console.error("Failed to initialize Firebase Auth:", error);
}

export { auth };

export const signIn = async (): Promise<FirebaseUser | null> => {
  if (!auth) {
    const errorMsg = "Firebase auth is not initialized. Please configure Firebase environment variables.";
    console.error(errorMsg);
    alert(errorMsg);
    return null;
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Signin failed", error);
    alert("Sign in failed. Please try again.");
    return null;
  }
};

export const logout = async (): Promise<void> => {
  if (!auth) {
    console.error("Firebase auth is not initialized.");
    return;
  }
  await signOut(auth).catch((error) => {
    console.error("Sign out failed", error);
  });
};
