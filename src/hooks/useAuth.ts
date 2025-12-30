import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/utils/auth/auth";

interface UseAuthReturn {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Custom hook to check Firebase authentication status
 * @returns {UseAuthReturn} Object containing user, loading state, and authentication status
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase auth is not initialized. Authentication features will not work.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}


