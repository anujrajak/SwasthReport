import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { firebaseApp } from "../firebase";

const provider = new GoogleAuthProvider();

export const auth = getAuth(firebaseApp);

export const signIn = async (): Promise<FirebaseUser | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Signin failed", error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth).catch((error) => {
    console.error("Sign out failed", error);
  });
};
