import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { getPatients } from "@/utils/firestore/patients";
import { getAllReports, getPendingVerificationReports, getReport, verifyReport, type ReportWithPatientInfo } from "@/utils/firestore/reports";
import { getPatient } from "@/utils/firestore/patients";
import { getUser } from "@/utils/firestore/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Users, FileText, Calendar, Eye, CheckCircle, Clock, Loader2, Activity } from "lucide-react";
import { FaClock } from "react-icons/fa";
import { toast } from "sonner";
import { toTitleCase } from "@/lib/utils";
import type { ReportWithId, TestResult } from "@/utils/firestore/reports";
import type { PatientWithId } from "@/utils/firestore/patients";
import type { User } from "@/utils/firestore/users";

export default function DashboardPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const router = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalReports: 0,
    loading: true,
  });
  const [pendingReports, setPendingReports] = useState<ReportWithPatientInfo[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    report: ReportWithId | null;
    patient: PatientWithId | null;
    lab: User | null;
  } | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setStats({ totalPatients: 0, totalReports: 0, loading: false });
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch patients count - get all patients
        let totalPatients = 0;
        let lastDoc = null;
        let hasMore = true;
        
        while (hasMore) {
          const patientsResult = await getPatients(firebaseUser.uid, 1000, lastDoc);
          totalPatients += patientsResult.patients.length;
          lastDoc = patientsResult.lastDoc;
          hasMore = patientsResult.hasMore;
        }

        // Fetch all reports to get accurate count
        let totalReports = 0;
        let lastReport = null;
        let hasMoreReports = true;
        
        while (hasMoreReports) {
          const reportsResult = await getAllReports(firebaseUser.uid, 100, lastReport || undefined);
          totalReports += reportsResult.reports.length;
          lastReport = reportsResult.lastReport;
          hasMoreReports = reportsResult.hasMore;
        }

        setStats({
          totalPatients,
          totalReports,
          loading: false,
        });

        // Fetch pending verification reports
        const pending = await getPendingVerificationReports(firebaseUser.uid, 10);
        setPendingReports(pending);
        setLoadingPending(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setStats({ totalPatients: 0, totalReports: 0, loading: false });
        setLoadingPending(false);
      }
    };

    fetchDashboardData();
  }, [firebaseUser?.uid]);

  const handleViewReport = async (report: ReportWithPatientInfo) => {
    if (!firebaseUser?.uid) return;

    setLoadingReport(true);
    setDrawerOpen(true);
    setSelectedReport(null);

    try {
      // Fetch full report, patient data, and lab details
      const [fullReport, patient, lab] = await Promise.all([
        getReport(firebaseUser.uid, report.patientId, report.id),
        getPatient(firebaseUser.uid, report.patientId),
        getUser(firebaseUser.uid),
      ]);

      if (fullReport && patient) {
        setSelectedReport({ report: fullReport, patient, lab });
      } else {
        toast.error("Failed to load report details");
        setDrawerOpen(false);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      toast.error("Failed to load report details");
      setDrawerOpen(false);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleVerifyReport = async () => {
    if (
      !firebaseUser?.uid ||
      !selectedReport?.report ||
      !selectedReport?.patient
    ) {
      return;
    }

    const toastId = toast.loading("Verifying report...");

    try {
      await verifyReport(
        firebaseUser.uid,
        selectedReport.patient.id,
        selectedReport.report.id
      );

      // Update local state
      if (selectedReport.report) {
        setSelectedReport({
          ...selectedReport,
          report: {
            ...selectedReport.report,
            verified: true,
            reportedDate: Timestamp.now(),
          },
        });
      }

      // Remove from pending reports list
      setPendingReports((prev) =>
        prev.filter(
          (r) =>
            !(r.patientId === selectedReport.patient.id && r.id === selectedReport.report.id)
        )
      );

      toast.success("Report verified successfully", { id: toastId });
    } catch (error) {
      console.error("Failed to verify report:", error);
      toast.error("Failed to verify report. Please try again.", {
        id: toastId,
      });
    }
  };

  if (authLoading || stats.loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Skeleton className="aspect-video rounded-xl" />
          <Skeleton className="aspect-video rounded-xl" />
          <Skeleton className="aspect-video rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your lab activities and statistics
        </p>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered patients in your lab
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pathology reports created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total reports created
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Verification Reports</CardTitle>
              <CardDescription>
                Reports awaiting verification ({pendingReports.length})
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router("/dashboard/reports")}
            >
              View All Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingPending ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : pendingReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All reports verified</h3>
              <p className="text-muted-foreground mb-4">
                There are no pending verification reports.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReports.map((report) => {
                  const reportDate =
                    report.date instanceof Timestamp
                      ? report.date.toDate()
                      : new Date(report.date);
                  const testCount = Object.keys(report.tests || {}).length;
                  const testNames = Object.values(report.tests || {})
                    .map((test) => test.name)
                    .join(", ");

                  return (
                    <TableRow
                      key={`${report.patientId}-${report.id}`}
                      className="cursor-pointer"
                      onClick={() =>
                        router(
                          `/dashboard/patients/${report.patientId}/reports`
                        )
                      }
                    >
                      <TableCell className="font-medium">
                        {reportDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{toTitleCase(report.patientName)}</TableCell>
                      <TableCell>{report.doctor}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {testCount} test(s)
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {testNames.length > 50
                              ? `${testNames.substring(0, 50)}...`
                              : testNames}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FaClock className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-600 font-medium">
                            Pending
                          </span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReport(report)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[96vh]">
          <div className="mx-auto w-full max-w-4xl overflow-y-auto">
            <DrawerHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DrawerTitle className="text-xl sm:text-2xl">
                    Pathology Report
                  </DrawerTitle>
                  <DrawerDescription className="text-xs sm:text-sm">
                    View complete report details
                  </DrawerDescription>
                </div>
                {selectedReport?.report && !selectedReport.report.verified && (
                  <Button
                    className="w-full sm:w-auto"
                    onClick={handleVerifyReport}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify Report
                  </Button>
                )}
              </div>
            </DrawerHeader>
            <div
              className="overflow-y-auto bg-white"
              style={{ padding: "2.54cm 2.54cm" }}
            >
              {loadingReport ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : selectedReport?.report && selectedReport?.patient ? (
                <>
                  {/* Screen version - PDF-like format */}
                  <div
                    className="space-y-0 print:hidden px-2 sm:px-0 bg-white"
                    style={{
                      maxWidth: "210mm",
                      margin: "0 auto",
                      fontFamily: "'Open Sans', Arial, sans-serif",
                      backgroundColor: "white",
                    }}
                  >
                    {/* Header Section - matching PDF format */}
                    {selectedReport.lab?.enableHeaderFooter !== false && (
                      <div
                        className="border-b-[3px] border-[#0d9488] p-3 sm:p-4 mb-0"
                        style={{
                          background:
                            "linear-gradient(to right, #ecfeff, #cffafe)",
                        }}
                      >
                        <div className="flex gap-4 items-center">
                          <div className="flex items-center justify-start">
                            {selectedReport.lab?.labLogo ? (
                              <img
                                src={selectedReport.lab.labLogo}
                                alt="Lab Logo"
                                className="max-w-[80px] sm:max-w-[100px] max-h-[80px] sm:max-h-[100px] object-contain"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-black/5 border-2 border-black/10">
                                <svg
                                  width="32"
                                  height="32"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="text-gray-600"
                                >
                                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <h1
                              className="text-lg sm:text-xl md:text-2xl font-bold m-0"
                              style={{
                                color: "#0d9488",
                                letterSpacing: "0.5px",
                                textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                              }}
                            >
                              {toTitleCase(selectedReport.lab?.labName) ||
                                "PATHOLOGY LABORATORY"}
                            </h1>
                            {selectedReport.lab?.labAddress && (
                              <p
                                className="text-[0.65rem] m-0 mt-1"
                                style={{ color: "#64748b" }}
                              >
                                <span
                                  className="font-semibold"
                                  style={{ color: "#0891b2" }}
                                >
                                  Address:
                                </span>{" "}
                                <span>{selectedReport.lab.labAddress}</span>
                              </p>
                            )}
                            {selectedReport.lab?.labContacts &&
                              selectedReport.lab.labContacts.length > 0 && (
                                <p
                                  className="text-[0.65rem] m-0 mt-1"
                                  style={{ color: "#64748b" }}
                                >
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#0891b2" }}
                                  >
                                    Contact:
                                  </span>{" "}
                                  <span>
                                    {selectedReport.lab.labContacts.join(" | ")}
                                  </span>
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Patient Details Section - matching PDF format */}
                    <div
                      className="border border-gray-300 border-t border-t-gray-300 p-3 sm:p-4 mb-0"
                      style={{ borderTop: "1px solid #ccc" }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-[0.75rem] mb-2">
                        <div className="flex flex-col gap-2">
                          <div>
                            <span style={{ color: "#000000" }}>Name : </span>
                            <span
                              className="font-semibold text-sm sm:text-base"
                              style={{ color: "#000000" }}
                            >
                              {selectedReport.patient.title
                                ? `${selectedReport.patient.title} `
                                : ""}
                              {toTitleCase(selectedReport.patient.name)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#000000" }}>Age : </span>
                            <span
                              className="font-medium"
                              style={{ color: "#000000" }}
                            >
                              {selectedReport.patient.age} Years
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#000000" }}>Sex : </span>
                            <span
                              className="font-medium capitalize"
                              style={{ color: "#000000" }}
                            >
                              {selectedReport.patient.gender}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#000000" }}>Ref. By : </span>
                            <span
                              className="font-semibold"
                              style={{ color: "#000000" }}
                            >
                              {selectedReport.report.doctor || "SELF"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 text-left sm:text-right">
                          <div>
                            <span style={{ color: "#000000" }}>Registered: </span>
                            <span
                              className="font-medium"
                              style={{ color: "#000000" }}
                            >
                              {selectedReport.report.registeredDate instanceof
                              Timestamp
                                ? selectedReport.report.registeredDate
                                    .toDate()
                                    .toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }) +
                                  " " +
                                  selectedReport.report.registeredDate
                                    .toDate()
                                    .toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                : selectedReport.report.createdAt instanceof
                                  Timestamp
                                ? selectedReport.report.createdAt
                                    .toDate()
                                    .toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }) +
                                  " " +
                                  selectedReport.report.createdAt
                                    .toDate()
                                    .toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                : selectedReport.report.date instanceof Timestamp
                                ? selectedReport.report.date
                                    .toDate()
                                    .toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }) +
                                  " " +
                                  selectedReport.report.date
                                    .toDate()
                                    .toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                : new Date(
                                    selectedReport.report.date
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }) +
                                  " " +
                                  new Date(
                                    selectedReport.report.date
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#000000" }}>Collected : </span>
                            <span
                              className="font-medium"
                              style={{ color: "#000000" }}
                            >
                              {selectedReport.report.collectedDate instanceof
                              Timestamp
                                ? selectedReport.report.collectedDate
                                    .toDate()
                                    .toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }) +
                                  " " +
                                  selectedReport.report.collectedDate
                                    .toDate()
                                    .toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                : selectedReport.report.date instanceof Timestamp
                                ? selectedReport.report.date
                                    .toDate()
                                    .toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }) +
                                  " " +
                                  selectedReport.report.date
                                    .toDate()
                                    .toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                : new Date(
                                    selectedReport.report.date
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }) +
                                  " " +
                                  new Date(
                                    selectedReport.report.date
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                            </span>
                          </div>
                          {selectedReport.report.reportedDate && (
                            <div>
                              <span style={{ color: "#000000" }}>
                                Reported :{" "}
                              </span>
                              <span
                                className="font-medium"
                                style={{ color: "#000000" }}
                              >
                                {selectedReport.report.reportedDate instanceof
                                Timestamp
                                  ? selectedReport.report.reportedDate
                                      .toDate()
                                      .toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }) +
                                    " " +
                                    selectedReport.report.reportedDate
                                      .toDate()
                                      .toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })
                                  : new Date(
                                      selectedReport.report.reportedDate
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }) +
                                    " " +
                                    new Date(
                                      selectedReport.report.reportedDate
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Test Results Section - matching PDF format */}
                    {Object.entries(selectedReport.report.tests || {}).map(
                      ([testId, test]: [string, TestResult]) => {
                        const testParams = Object.entries(
                          test.parameters || {}
                        ).filter(([_, paramResult]) => {
                          return (
                            paramResult.value !== null &&
                            paramResult.value !== undefined &&
                            paramResult.value !== ""
                          );
                        });

                        if (testParams.length === 0) return null;

                        const hasTestComment =
                          test.comment && test.comment.trim() !== "";

                        return (
                          <div
                            key={testId}
                            className="border border-gray-300 border-t border-t-gray-300 p-3 sm:p-4 mb-0"
                            style={{ borderTop: "1px solid #ccc" }}
                          >
                            {/* Test Name - Centered */}
                            <div className="text-center mb-4">
                              <h2
                                className="text-base sm:text-lg font-semibold m-0"
                                style={{ fontSize: "1rem", color: "#000000" }}
                              >
                                {test.name}
                              </h2>
                              {test.category && (
                                <p
                                  className="text-[0.75rem] m-0 mt-2"
                                  style={{ color: "#1e293b" }}
                                >
                                  {test.category}
                                </p>
                              )}
                            </div>

                            {/* Test Table */}
                            <div className="overflow-x-auto -mx-3 sm:mx-0 mb-4">
                              <table
                                className="w-full border-collapse"
                                style={{ border: "1px solid #ccc" }}
                              >
                                <thead>
                                  <tr>
                                    <th
                                      className="text-left p-2 border border-gray-300 font-semibold"
                                      style={{
                                        width: "35%",
                                        borderBottom: "1px solid #ccc",
                                        fontSize: "0.75rem",
                                        color: "#000000",
                                      }}
                                    >
                                      Test
                                    </th>
                                    <th
                                      className="text-left p-2 border border-gray-300 font-semibold"
                                      style={{
                                        width: "20%",
                                        borderBottom: "1px solid #ccc",
                                        fontSize: "0.75rem",
                                        color: "#000000",
                                      }}
                                    >
                                      Result
                                    </th>
                                    <th
                                      className="text-left p-2 border border-gray-300 font-semibold"
                                      style={{
                                        width: "25%",
                                        borderBottom: "1px solid #ccc",
                                        fontSize: "0.75rem",
                                        color: "#000000",
                                      }}
                                    >
                                      Ref. Value
                                    </th>
                                    <th
                                      className="text-left p-2 border border-gray-300 font-semibold"
                                      style={{
                                        width: "20%",
                                        borderBottom: "1px solid #ccc",
                                        fontSize: "0.75rem",
                                        color: "#000000",
                                      }}
                                    >
                                      Unit
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {testParams.map(([paramName, paramResult]) => {
                                    const rangeStr =
                                      typeof paramResult.range === "string"
                                        ? paramResult.range
                                        : typeof paramResult.range === "object"
                                        ? paramResult.range[
                                            selectedReport.patient.gender.toLowerCase()
                                          ] ||
                                          paramResult.range["normal"] ||
                                          "N/A"
                                        : "N/A";

                                    const isOutOfRange = (() => {
                                      const value = paramResult.value;
                                      const numValue =
                                        typeof value === "string"
                                          ? parseFloat(value)
                                          : value;
                                      if (
                                        typeof numValue !== "number" ||
                                        isNaN(numValue)
                                      )
                                        return false;
                                      const rangeMatch = rangeStr.match(
                                        /(\d+\.?\d*)\s*[-–—]\s*(\d+\.?\d*)/
                                      );
                                      if (rangeMatch) {
                                        const min = parseFloat(rangeMatch[1]);
                                        const max = parseFloat(rangeMatch[2]);
                                        return numValue < min || numValue > max;
                                      }
                                      return false;
                                    })();

                                    return (
                                      <tr key={paramName}>
                                        <td
                                          className="p-2 border border-gray-300"
                                          style={{
                                            width: "35%",
                                            fontSize: "0.75rem",
                                            color: "#1e293b",
                                          }}
                                        >
                                          {paramName}
                                        </td>
                                        <td
                                          className={`p-2 border border-gray-300 ${
                                            isOutOfRange ? "font-bold" : ""
                                          }`}
                                          style={{
                                            width: "20%",
                                            fontSize: "0.75rem",
                                            color: "#1e293b",
                                          }}
                                        >
                                          {paramResult.value}
                                        </td>
                                        <td
                                          className="p-2 border border-gray-300"
                                          style={{
                                            width: "25%",
                                            fontSize: "0.75rem",
                                            color: "#1e293b",
                                          }}
                                        >
                                          {rangeStr}
                                        </td>
                                        <td
                                          className="p-2 border border-gray-300"
                                          style={{
                                            width: "20%",
                                            fontSize: "0.75rem",
                                            color: "#1e293b",
                                          }}
                                        >
                                          {paramResult.unit || "-"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Test Comment */}
                            {hasTestComment && (
                              <div className="mt-4 pt-4">
                                <h3
                                  className="text-sm font-semibold mb-2"
                                  style={{
                                    fontSize: "0.875rem",
                                    color: "#1e293b",
                                  }}
                                >
                                  Comments
                                </h3>
                                <p
                                  className="text-xs whitespace-pre-wrap"
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "#1e293b",
                                  }}
                                >
                                  {test.comment}
                                </p>
                              </div>
                            )}

                            {/* Pathologist Signature - if verified */}
                            {selectedReport.report.verified &&
                              selectedReport.lab?.pathologistName && (
                                <div
                                  className="flex justify-end items-end mt-4 mb-2"
                                  style={{ marginRight: "2rem" }}
                                >
                                  <div className="text-right">
                                    {selectedReport.lab?.pathologistSignature && (
                                      <img
                                        src={
                                          selectedReport.lab.pathologistSignature
                                        }
                                        alt="Signature"
                                        className="max-w-[150px] max-h-[60px] mb-2 block"
                                      />
                                    )}
                                    <p
                                      className="font-bold m-0 mt-1"
                                      style={{
                                        fontSize: "0.75rem",
                                        color: "#1e293b",
                                      }}
                                    >
                                      {toTitleCase(
                                        selectedReport.lab.pathologistName
                                      )}
                                    </p>
                                    {selectedReport.lab?.pathologistTitle && (
                                      <p
                                        className="m-0 mt-1"
                                        style={{
                                          fontSize: "0.65rem",
                                          color: "#475569",
                                        }}
                                      >
                                        {selectedReport.lab.pathologistTitle}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      }
                    )}

                    {/* Footer Section - matching PDF format */}
                    {selectedReport.lab?.enableHeaderFooter !== false && (
                      <div
                        className="border-t-[3px] border-[#0891b2] p-3 sm:p-4 mt-0"
                        style={{
                          background:
                            "linear-gradient(to right, #f0fdfa, #ccfbf1)",
                          textAlign: "center",
                        }}
                      >
                        <p
                          className="m-0"
                          style={{
                            fontSize: "0.65rem",
                            color: "#334155",
                            fontWeight: "500",
                            lineHeight: "1.6",
                          }}
                        >
                          All pathology tests have their technical limitations.
                          The results are for interpretation by the referring
                          physician Any abnormal reading is to be correlated with
                          the patient's condition. Unexpected results need to be
                          re-confirmed by repeat tests. This report is not valid
                          for medico-legal purpose.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No report data available
                  </p>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
