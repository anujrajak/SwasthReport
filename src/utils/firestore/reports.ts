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
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";
import { cleanFirestoreData } from "./clean-data";
import { getPatients } from "./patients";

export interface TestParameterResult {
  value: number | string;
  unit: string;
  range: string | Record<string, string>;
}

export interface TestResult {
  name: string;
  category: string;
  parameters: Record<string, TestParameterResult>;
  comment?: string;
}

export interface TestResults {
  [testId: string]: TestResult;
}

export interface Report {
  date: Timestamp;
  doctor: string; // Reference or "Self" as default
  title?: string;
  tests: TestResults;
}

export interface ReportWithId extends Report {
  id: string;
}

export interface ReportWithPatientInfo extends ReportWithId {
  patientId: string;
  patientName: string;
}

/**
 * Get all reports for a patient
 */
export const getReports = async (
  userId: string,
  patientId: string
): Promise<ReportWithId[]> => {
  const reportsRef = collection(
    db,
    "users",
    userId,
    "patients",
    patientId,
    "reports"
  );
  const q = query(reportsRef, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Report),
  }));
};

/**
 * Get a single report by ID
 */
export const getReport = async (
  userId: string,
  patientId: string,
  reportId: string
): Promise<ReportWithId | null> => {
  const reportRef = doc(
    db,
    "users",
    userId,
    "patients",
    patientId,
    "reports",
    reportId
  );
  const reportDoc = await getDoc(reportRef);

  if (!reportDoc.exists()) {
    return null;
  }

  return {
    id: reportDoc.id,
    ...(reportDoc.data() as Report),
  };
};

/**
 * Create a new report
 */
export const createReport = async (
  userId: string,
  patientId: string,
  reportData: Omit<Report, "date"> & { date?: Date | Timestamp }
): Promise<string> => {
  // Convert date to Timestamp if it's a Date
  const date =
    reportData.date instanceof Date
      ? Timestamp.fromDate(reportData.date)
      : reportData.date || Timestamp.now();

  const dataToSave: Report = {
    date,
    doctor: reportData.doctor || "Self",
    tests: reportData.tests,
    comments: reportData.comments,
  };

  const cleanedData = cleanFirestoreData(dataToSave, {
    optionalStringFields: ["comments"],
  });

  const reportsRef = collection(
    db,
    "users",
    userId,
    "patients",
    patientId,
    "reports"
  );
  const newReportRef = doc(reportsRef);

  await setDoc(newReportRef, cleanedData);

  return newReportRef.id;
};

/**
 * Update an existing report
 */
export const updateReport = async (
  userId: string,
  patientId: string,
  reportId: string,
  reportData: Partial<Omit<Report, "date">> & { date?: Date | Timestamp }
): Promise<void> => {
  const dataToSave: Record<string, unknown> = {};

  // Copy all fields except date
  if (reportData.doctor !== undefined) {
    dataToSave.doctor = reportData.doctor;
  }
  if (reportData.tests !== undefined) {
    dataToSave.tests = reportData.tests;
  }
  if (reportData.comments !== undefined) {
    dataToSave.comments = reportData.comments;
  }

  // Convert date to Timestamp if it's a Date
  if (reportData.date) {
    dataToSave.date =
      reportData.date instanceof Date
        ? Timestamp.fromDate(reportData.date)
        : reportData.date;
  }

  const cleanedData = cleanFirestoreData(dataToSave, {
    optionalStringFields: ["comments"],
  });

  const reportRef = doc(
    db,
    "users",
    userId,
    "patients",
    patientId,
    "reports",
    reportId
  );
  await setDoc(reportRef, cleanedData, { merge: true });
};

/**
 * Delete a report
 */
export const deleteReport = async (
  userId: string,
  patientId: string,
  reportId: string
): Promise<void> => {
  const reportRef = doc(
    db,
    "users",
    userId,
    "patients",
    patientId,
    "reports",
    reportId
  );
  await deleteDoc(reportRef);
};

/**
 * Get all reports across all patients for a user with pagination
 * Returns reports sorted by date descending
 */
export const getAllReports = async (
  userId: string,
  pageSize: number = 50,
  lastReport?: { patientId: string; reportDate: Timestamp; reportId: string }
): Promise<{
  reports: ReportWithPatientInfo[];
  lastReport: { patientId: string; reportDate: Timestamp; reportId: string } | null;
  hasMore: boolean;
}> => {
  // Get all patients - fetch in batches if needed
  const allPatients: Awaited<ReturnType<typeof getPatients>>["patients"] = [];
  let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  let hasMorePatients = true;

  while (hasMorePatients) {
    const patientsResult = await getPatients(userId, 1000, lastDoc);
    allPatients.push(...patientsResult.patients);
    lastDoc = patientsResult.lastDoc;
    hasMorePatients = patientsResult.hasMore;
  }
  
  console.log(`Fetching reports for ${allPatients.length} patients`);

  // Get all reports from all patients
  const allReports: ReportWithPatientInfo[] = [];

  for (const patient of allPatients) {
    try {
      const reportsRef = collection(
        db,
        "users",
        userId,
        "patients",
        patient.id,
        "reports"
      );
      
      // Try to query with orderBy, but if it fails (no index), query without orderBy
      let querySnapshot;
      try {
        const q = query(reportsRef, orderBy("date", "desc"));
        querySnapshot = await getDocs(q);
      } catch (error) {
        // If orderBy fails (likely missing index), fetch without orderBy and sort in memory
        console.warn(`Failed to query reports with orderBy for patient ${patient.id}, fetching without orderBy:`, error);
        querySnapshot = await getDocs(reportsRef);
      }

      querySnapshot.docs.forEach((doc) => {
        const reportData = doc.data() as Report;
        // Only add if report has required fields
        if (reportData.date && reportData.tests) {
          allReports.push({
            id: doc.id,
            patientId: patient.id,
            patientName: patient.name,
            ...reportData,
          });
        } else {
          console.warn(`Report ${doc.id} for patient ${patient.id} is missing required fields:`, {
            hasDate: !!reportData.date,
            hasTests: !!reportData.tests,
            data: reportData,
          });
        }
      });
      
      if (querySnapshot.docs.length > 0) {
        console.log(`Found ${querySnapshot.docs.length} reports for patient ${patient.name} (${patient.id})`);
      }
    } catch (error) {
      // Log error but continue with other patients
      console.error(`Error fetching reports for patient ${patient.id}:`, error);
    }
  }

  console.log(`Total reports found across all patients: ${allReports.length}`);
  
  // Sort all reports by date descending
  allReports.sort((a, b) => {
    const dateA = a.date instanceof Timestamp ? a.date.toMillis() : a.date.getTime();
    const dateB = b.date instanceof Timestamp ? b.date.toMillis() : b.date.getTime();
    return dateB - dateA; // Descending order
  });

  // Implement pagination
  let startIndex = 0;
  if (lastReport) {
    // Find the index of the last report
    const lastIndex = allReports.findIndex(
      (r) =>
        r.patientId === lastReport.patientId &&
        r.id === lastReport.reportId
    );
    if (lastIndex !== -1) {
      startIndex = lastIndex + 1;
    }
  }

  const endIndex = startIndex + pageSize + 1; // Fetch one extra to check for more
  const paginatedReports = allReports.slice(startIndex, endIndex);
  const hasMore = paginatedReports.length > pageSize;
  const reportsToReturn = hasMore ? paginatedReports.slice(0, pageSize) : paginatedReports;

  const lastReportData =
    reportsToReturn.length > 0
      ? {
          patientId: reportsToReturn[reportsToReturn.length - 1].patientId,
          reportDate: reportsToReturn[reportsToReturn.length - 1].date instanceof Timestamp
            ? reportsToReturn[reportsToReturn.length - 1].date
            : Timestamp.fromDate(reportsToReturn[reportsToReturn.length - 1].date),
          reportId: reportsToReturn[reportsToReturn.length - 1].id,
        }
      : null;

  return {
    reports: reportsToReturn,
    lastReport: lastReportData,
    hasMore,
  };
};


