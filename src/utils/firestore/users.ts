import { doc, setDoc, getDoc } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { db } from "../firebase";

export interface User {
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  labName?: string;
  labAddress?: string;
  labContacts?: string[];
  enableHeaderFooter?: boolean;
  topMargin?: number;
  bottomMargin?: number;
}

export const getUser = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, "users", uid));

  if (!userDoc.exists()) {
    return null;
  }

  return userDoc.data() as User;
};

export const createUser = async (
  uid: string,
  firebaseUser: FirebaseUser
): Promise<void> => {
  await setDoc(doc(db, "users", uid), {
    displayName: firebaseUser.displayName ?? "",
    email: firebaseUser.email ?? "",
    photoURL: firebaseUser.photoURL ?? null,
    phone: firebaseUser.phoneNumber ?? null,
  });
};

export const updateUser = async (
  uid: string,
  userData: Partial<User>
): Promise<void> => {
  // Filter out undefined values and convert empty strings to null for optional fields
  const cleanedData: Record<string, any> = {};

  for (const [key, value] of Object.entries(userData)) {
    if (value !== undefined) {
      // Convert empty strings to null for optional string fields
      if (
        (key === "phone" ||
          key === "photoURL" ||
          key === "labName" ||
          key === "labAddress") &&
        value === ""
      ) {
        cleanedData[key] = null;
      }
      // Handle arrays - filter out empty strings and set to empty array if all empty
      else if (key === "labContacts" && Array.isArray(value)) {
        const filtered = value.filter((item) => item && item.trim() !== "");
        cleanedData[key] = filtered.length > 0 ? filtered : null;
      } else {
        cleanedData[key] = value;
      }
    }
  }

  await setDoc(doc(db, "users", uid), cleanedData, { merge: true });
};
