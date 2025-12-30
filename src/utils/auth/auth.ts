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

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

export const signIn = async (): Promise<FirebaseUser | null> => {
  if (!auth) {
    console.error("Firebase auth is not initialized. Please configure Firebase environment variables.");
    return null;
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Signin failed", error);
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
