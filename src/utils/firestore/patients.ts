import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { cleanFirestoreData } from "./clean-data";

export interface Patient {
  name: string;
  title?: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  createdAt?: Timestamp;
}

export interface PatientWithId extends Patient {
  id: string;
}

/**
 * Get paginated patients for a user
 */
export const getPatients = async (
  userId: string,
  pageSize: number = 50,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  patients: PatientWithId[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> => {
  const patientsRef = collection(db, "users", userId, "patients");
  let q = query(patientsRef, orderBy("name"), limit(pageSize + 1));

  if (lastDoc) {
    q = query(patientsRef, orderBy("name"), startAfter(lastDoc), limit(pageSize + 1));
  }

  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;
  const hasMore = docs.length > pageSize;
  const patientsToReturn = hasMore ? docs.slice(0, pageSize) : docs;

  const patients = patientsToReturn.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Patient),
  }));

  return {
    patients,
    lastDoc: patientsToReturn.length > 0 ? patientsToReturn[patientsToReturn.length - 1] : null,
    hasMore,
  };
};

/**
 * Get a single patient by ID
 */
export const getPatient = async (
  userId: string,
  patientId: string
): Promise<PatientWithId | null> => {
  const patientRef = doc(db, "users", userId, "patients", patientId);
  const patientDoc = await getDoc(patientRef);

  if (!patientDoc.exists()) {
    return null;
  }

  return {
    id: patientDoc.id,
    ...(patientDoc.data() as Patient),
  };
};

/**
 * Create a new patient
 */
export const createPatient = async (
  userId: string,
  patientData: Patient
): Promise<string> => {
  const cleanedData = cleanFirestoreData(patientData, {
    optionalStringFields: ["email"],
  });

  // Add createdAt timestamp if not provided
  if (!cleanedData.createdAt) {
    cleanedData.createdAt = Timestamp.now();
  }

  const patientsRef = collection(db, "users", userId, "patients");
  const newPatientRef = doc(patientsRef);

  await setDoc(newPatientRef, cleanedData);

  return newPatientRef.id;
};

/**
 * Update an existing patient
 */
export const updatePatient = async (
  userId: string,
  patientId: string,
  patientData: Partial<Patient>
): Promise<void> => {
  const cleanedData = cleanFirestoreData(patientData, {
    optionalStringFields: ["email"],
  });

  const patientRef = doc(db, "users", userId, "patients", patientId);
  await setDoc(patientRef, cleanedData, { merge: true });
};

/**
 * Delete a patient
 */
export const deletePatient = async (
  userId: string,
  patientId: string
): Promise<void> => {
  const patientRef = doc(db, "users", userId, "patients", patientId);
  await deleteDoc(patientRef);
};

/**
 * Search patients by name (fetches all and filters client-side)
 * For better performance, consider implementing server-side search
 */
export const searchPatients = async (
  userId: string,
  searchTerm: string
): Promise<PatientWithId[]> => {
  if (!searchTerm.trim()) {
    return [];
  }

  const allPatients: PatientWithId[] = [];
  let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  let hasMore = true;

  // Fetch all patients in batches
  while (hasMore) {
    const result = await getPatients(userId, 1000, lastDoc || undefined);
    allPatients.push(...result.patients);
    lastDoc = result.lastDoc;
    hasMore = result.hasMore;
  }

  // Filter by search term (case-insensitive)
  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  return allPatients.filter((patient) => {
    const fullName = patient.title 
      ? `${patient.title} ${patient.name}`.toLowerCase()
      : patient.name.toLowerCase();
    return fullName.includes(lowerSearchTerm) || 
           patient.name.toLowerCase().includes(lowerSearchTerm) ||
           (patient.phone && patient.phone.includes(lowerSearchTerm)) ||
           (patient.email && patient.email.toLowerCase().includes(lowerSearchTerm));
  });
};
