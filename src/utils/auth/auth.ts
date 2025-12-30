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
  } catch (error: any) {
    console.error("Signin failed", error);
    const errorMessage = error?.message || "Unknown error occurred";
    const errorCode = error?.code || "unknown";
    
    // Provide more specific error messages
    let userMessage = "Sign in failed. Please try again.";
    if (errorCode === "auth/popup-blocked") {
      userMessage = "Popup was blocked. Please allow popups for this site and try again.";
    } else if (errorCode === "auth/popup-closed-by-user") {
      userMessage = "Sign in was cancelled. Please try again.";
    } else if (errorCode === "auth/unauthorized-domain") {
      userMessage = "This domain is not authorized. Please contact the administrator.";
      console.error("Domain not authorized in Firebase. Add your domain to Firebase Console → Authentication → Settings → Authorized domains");
    } else if (errorCode === "auth/operation-not-allowed") {
      userMessage = "Google sign-in is not enabled. Please contact the administrator.";
    }
    
    alert(`${userMessage}\n\nError: ${errorMessage}`);
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
