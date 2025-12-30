import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getPatient, type PatientWithId } from "@/utils/firestore/patients";
import {
  getReports,
  getReport,
  type ReportWithId,
  type TestResult,
} from "@/utils/firestore/reports";
import { getUser, type User } from "@/utils/firestore/users";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  Users,
  Eye,
  Loader2,
  Activity,
  Printer,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { toTitleCase } from "@/lib/utils";

export default function PatientReportsPage() {
  const params = useParams();
  const router = useNavigate();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const patientId = params.patientId as string;
  const [reports, setReports] = useState<ReportWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    report: ReportWithId | null;
    patient: PatientWithId | null;
    lab: User | null;
  } | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (!firebaseUser?.uid || !patientId) {
      setLoading(false);
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid, patientId]);

  const fetchData = async () => {
    if (!firebaseUser?.uid || !patientId) return;

    try {
      setLoading(true);
      const [patientData, reportsData] = await Promise.all([
        getPatient(firebaseUser.uid, patientId),
        getReports(firebaseUser.uid, patientId),
      ]);

      if (patientData) {
        setPatientName(patientData.name);
      }
      setReports(reportsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (report: ReportWithId) => {
    if (!firebaseUser?.uid || !patientId) return;

    setLoadingReport(true);
    setDrawerOpen(true);
    setSelectedReport(null);

    try {
      // Fetch full report, patient data, and lab details
      const [fullReport, patient, lab] = await Promise.all([
        getReport(firebaseUser.uid, patientId, report.id),
        getPatient(firebaseUser.uid, patientId),
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

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Not Authenticated</h2>
        <p className="text-muted-foreground">Please log in to view reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router("/dashboard/patients")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {patientName ? `${patientName}'s Reports` : "Patient Reports"}
          </h1>
          <p className="text-muted-foreground">
            View all pathology reports for this patient
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            All pathology reports for{" "}
            {toTitleCase(patientName) || "this patient"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                No reports have been created for this patient yet.
              </p>
              <Button
                onClick={() =>
                  router(`/dashboard/make-report?patientId=${patientId}`)
                }
              >
                Create Report
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  const reportDate =
                    report.date instanceof Timestamp
                      ? report.date.toDate()
                      : new Date(report.date);
                  const testCount = Object.keys(report.tests || {}).length;
                  const testNames = Object.values(report.tests || {})
                    .map((test) => test.name)
                    .join(", ");

                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {reportDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
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
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <DrawerTitle className="text-lg sm:text-xl">
                  Pathology Report
                </DrawerTitle>
                <DrawerDescription className="text-xs sm:text-sm">
                  View complete report details
                </DrawerDescription>
              </div>
              {selectedReport?.report && selectedReport?.patient && (
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (!selectedReport?.report || !selectedReport?.patient)
                      return;

                    const tests = Object.entries(
                      selectedReport.report.tests || {}
                    );
                    const lab = selectedReport.lab;
                    const patient = selectedReport.patient;
                    const report = selectedReport.report;
                    const enableHeaderFooter = lab?.enableHeaderFooter ?? true;
                    const topMargin = lab?.topMargin ?? 15;
                    const bottomMargin = lab?.bottomMargin ?? 15;

                    const reportDate =
                      report.date instanceof Timestamp
                        ? report.date.toDate().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) +
                          " " +
                          report.date.toDate().toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : new Date(report.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) +
                          " " +
                          new Date(report.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });

                    const registeredDate =
                      report.createdAt instanceof Timestamp
                        ? report.createdAt
                            .toDate()
                            .toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }) +
                          " " +
                          report.createdAt
                            .toDate()
                            .toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                        : reportDate;

                    // Generate HTML for each test (one per page)
                    const testPages = tests
                      .map(
                        (
                          [testId, test]: [string, TestResult],
                          testIndex: number
                        ) => {
                          const isLastTest = testIndex === tests.length - 1;
                          const parameters = Object.entries(
                            test.parameters || {}
                          ).filter(([_, paramResult]) => {
                            return (
                              paramResult.value !== null &&
                              paramResult.value !== undefined &&
                              paramResult.value !== ""
                            );
                          });

                          const rangeStr = (paramResult: any) => {
                            const range = paramResult.range;
                            if (typeof range === "string") return range;
                            if (typeof range === "object") {
                              return (
                                range[patient.gender.toLowerCase()] ||
                                range["normal"] ||
                                "N/A"
                              );
                            }
                            return "N/A";
                          };

                          const isOutOfRange = (
                            value: any,
                            rangeStr: string
                          ) => {
                            const numValue =
                              typeof value === "string"
                                ? parseFloat(value)
                                : value;
                            if (typeof numValue !== "number" || isNaN(numValue))
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
                          };

                          const paramsRows = parameters
                            .map(([paramName, paramResult]: [string, any]) => {
                              const rStr = rangeStr(paramResult);
                              const outOfRange = isOutOfRange(
                                paramResult.value,
                                rStr
                              );
                              return `
                          <tr>
                            <td style="width: 35%;"><div style="color: #666;">${paramName}</div></td>
                            <td style="${
                              outOfRange ? "font-weight: bold;" : ""
                            } width: 20%;">${paramResult.value}</td>
                            <td style="color: #666; width: 25%;">${rStr}</td>
                            <td style="width: 20%;">${
                              paramResult.unit || "-"
                            }</td>
                          </tr>
                        `;
                            })
                            .join("");

                          const hasTestComment =
                            test.comment && test.comment.trim() !== "";

                          return `
                        <div class="print-page"${
                          isLastTest
                            ? ' style="page-break-after: avoid !important;"'
                            : ""
                        }>
                          ${
                            enableHeaderFooter
                              ? `
                          <div class="print-header">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                              <div style="display: flex; align-items: center; justify-content: start;">
                                <div style="display: flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 8px; background: rgba(0,0,0,0.05); border: 2px solid rgba(0,0,0,0.1);">
                                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                  </svg>
                                </div>
                              </div>
                              <div style="display: flex; align-items: center; justify-content: end; text-align: right;">
                                <div>
                                  <h1 style="font-size: 1.875rem; font-weight: bold; margin: 0;">${
                                    toTitleCase(lab?.labName) ||
                                    "PATHOLOGY LABORATORY"
                                  }</h1>
                                  <p style="font-size: 0.875rem; color: #666; margin: 0.5rem 0 0 0;">${
                                    report.title || "PATHOLOGY REPORT"
                                  }</p>
                                  ${
                                    lab?.labAddress
                                      ? `<p style="font-size: 0.75rem; color: #666; margin: 0.75rem 0 0 0;">${lab.labAddress}</p>`
                                      : ""
                                  }
                                  ${
                                    lab?.labContacts &&
                                    lab.labContacts.length > 0
                                      ? `<p style="font-size: 0.75rem; color: #666; margin: 0.5rem 0 0 0;">${lab.labContacts.join(
                                          " | "
                                        )}</p>`
                                      : ""
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                          `
                              : ""
                          }
                          <div class="print-patient-details">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; font-size: 0.875rem; margin-bottom: 1.5rem;">
                              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <div><span style="color: #666;">Name : </span><span style="font-weight: 600; font-size: 1rem;">${
                                  patient.title ? patient.title + " " : ""
                                }${toTitleCase(patient.name)}</span></div>
                                <div><span style="color: #666;">Age : </span><span style="font-weight: 500;">${
                                  patient.age
                                } Years</span></div>
                                <div><span style="color: #666;">Sex : </span><span style="font-weight: 500; text-transform: capitalize;">${
                                  patient.gender
                                }</span></div>
                                <div><span style="color: #666;">Ref. By : </span><span style="font-weight: 600;">${
                                  report.doctor || "SELF"
                                }</span></div>
                            </div>
                              <div style="display: flex; flex-direction: column; gap: 0.5rem; text-align: right;">
                                <div><span style="color: #666;">Registered: </span><span style="font-weight: 500;">${registeredDate}</span></div>
                                <div><span style="color: #666;">Collected : </span><span style="font-weight: 500;">${reportDate}</span></div>
                                <div><span style="color: #666;">Reported : </span><span style="font-weight: 500;">${reportDate}</span></div>
                          </div>
                              </div>
                          </div>
                          <div class="print-test">
                            <div style="text-align: center; margin-bottom: 1rem;">
                              <h2 style="font-size: 1.25rem; font-weight: 600; margin: 0;">${
                                test.name
                              }</h2>
                              <p style="font-size: 0.875rem; color: #666; margin: 0.5rem 0 0 0;">${
                                test.category
                              }</p>
                            </div>
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                  <tr>
                                  <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ccc; font-weight: 600; width: 35%;">Test</th>
                                  <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ccc; font-weight: 600; width: 20%;">Result</th>
                                  <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ccc; font-weight: 600; width: 25%;">Ref. Value</th>
                                  <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ccc; font-weight: 600; width: 20%;">Unit</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${paramsRows}
                                </tbody>
                              </table>
                              ${
                                hasTestComment
                                  ? `<div style="margin-top: 1.5rem; padding: 0.5cm 0;">
                                      <h3 style="font-size: 1rem; font-weight: 600; padding-bottom: 0.25rem; margin-bottom: 0.75rem;">Comments</h3>
                                      <p style="font-size: 0.875rem; white-space: pre-wrap;">${test.comment}</p>
                                    </div>`
                                  : ""
                              }
                          </div>
                          ${
                            enableHeaderFooter
                              ? `
                          <div class="print-footer">
                            <p style="font-weight: 600; margin: 0;">${
                              toTitleCase(lab?.labName) ||
                              "PATHOLOGY LABORATORY"
                            }</p>
                            ${
                              lab?.labAddress
                                ? `<p style="margin: 0.25rem 0 0 0;">${lab.labAddress}</p>`
                                : ""
                            }
                            ${
                              lab?.labContacts && lab.labContacts.length > 0
                                ? `<p style="margin: 0.25rem 0 0 0;">${lab.labContacts.join(
                                    " | "
                                  )}</p>`
                                : ""
                            }
                          </div>
                          `
                              : ""
                          }
                        </div>
                      `;
                        }
                      )
                      .join("");

                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Pathology Report</title>
                            <style>
                              @page {
                                size: A4;
                                ${
                                  enableHeaderFooter
                                    ? "margin: 6mm;"
                                    : `margin: ${topMargin}mm 6mm ${bottomMargin}mm 6mm;`
                                }
                              }
                              body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 0;
                              }
                              .print-page {
                                display: flex;
                                flex-direction: column;
                                padding: 0;
                                margin: 0;
                                width: 100%;
                                min-height: 100vh;
                                box-sizing: border-box;
                              }
                              .print-page:not(:last-child) {
                                page-break-after: always;
                              }
                              .print-page:last-child {
                                page-break-after: avoid !important;
                              }
                              .print-page:last-of-type {
                                page-break-after: avoid !important;
                              }
                              .print-header {
                                width: 100%;
                                border: 1px solid #000;
                                border-bottom: 2px solid #000;
                                padding: 0.5cm;
                                margin: 0 0 0.5cm 0;
                                box-sizing: border-box;
                              }
                              .print-footer {
                                width: 100%;
                                border: 1px solid #000;
                                border-top: 1px solid #ccc;
                                padding: 0.5cm;
                                margin: auto 0 0 0;
                                text-align: center;
                                font-size: 10px;
                                color: #666;
                                box-sizing: border-box;
                              }
                              .print-patient-details {
                                width: 100%;
                                border: 1px solid #000;
                                padding: 0.5cm;
                                margin: 0 0 0.5cm 0;
                                box-sizing: border-box;
                              }
                              .print-test {
                                flex: 1;
                                width: 100%;
                                border: 1px solid #000;
                                padding: 0.5cm;
                                box-sizing: border-box;
                              }
                              table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #ccc;
                              }
                              th, td {
                                padding: 0.5rem;
                                text-align: left;
                                border: 1px solid #ccc;
                              }
                              thead th {
                                border-bottom: 2px solid #000;
                                background-color: #f5f5f5;
                              }
                            </style>
                          </head>
                          <body style="margin: 0; padding: 0;">
                            ${testPages}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      setTimeout(() => {
                        printWindow.print();
                      }, 250);
                    }
                  }}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print PDF
                </Button>
              )}
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto" style={{ padding: "2.54cm 2.54cm" }}>
            {loadingReport ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedReport?.report && selectedReport?.patient ? (
              <>
                {/* Screen version */}
                <div
                  className="space-y-0 print:hidden px-2 sm:px-0"
                  style={{ maxWidth: "210mm", margin: "0 auto" }}
                >
                  {/* Header Section with Lab Info */}
                  <div className="border-2 border-gray-300 rounded-lg p-3 sm:p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-center sm:justify-start">
                        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-primary/10 border-2 border-primary/20">
                          <Activity className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center sm:justify-end text-center sm:text-right space-y-2">
                        <div>
                          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                            {toTitleCase(selectedReport.lab?.labName) ||
                              "PATHOLOGY LABORATORY"}
                          </h1>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {selectedReport.report.title || "PATHOLOGY REPORT"}
                          </p>
                          {selectedReport.lab?.labAddress && (
                            <div className="mt-3 text-xs text-muted-foreground">
                              <p>{selectedReport.lab.labAddress}</p>
                            </div>
                          )}
                          {selectedReport.lab?.labContacts &&
                            selectedReport.lab.labContacts.length > 0 && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                <p>
                                  {selectedReport.lab.labContacts.join(" | ")}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient & Report Details Section */}
                  <div className="mb-4 border-2 border-gray-300 rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      {/* Left side - Patient Details */}
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div>
                          <span className="text-muted-foreground">Name : </span>
                          <span className="font-semibold text-sm sm:text-base">
                            {selectedReport.patient.title
                              ? `${selectedReport.patient.title} `
                              : ""}
                            {toTitleCase(selectedReport.patient.name)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Age : </span>
                          <span className="font-medium">
                            {selectedReport.patient.age} Years
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sex : </span>
                          <span className="font-medium capitalize">
                            {selectedReport.patient.gender}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Ref. By :{" "}
                          </span>
                          <span className="font-semibold">
                            {selectedReport.report.doctor || "SELF"}
                          </span>
                        </div>
                      </div>
                      {/* Right side - Dates */}
                      <div className="space-y-2 text-xs sm:text-sm text-left sm:text-right">
                        <div>
                          <span className="text-muted-foreground">
                            Registered:{" "}
                          </span>
                          <span className="font-medium">
                            {selectedReport.report.createdAt instanceof
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
                          <span className="text-muted-foreground">
                            Collected :{" "}
                          </span>
                          <span className="font-medium">
                            {selectedReport.report.date instanceof Timestamp
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
                          <span className="text-muted-foreground">
                            Reported :{" "}
                          </span>
                          <span className="font-medium">
                            {selectedReport.report.date instanceof Timestamp
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
                      </div>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  {/* Test Results Section */}
                  <div className="mb-8 space-y-6">
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

                        return (
                          <div
                            key={testId}
                            className="border-2 border-gray-300 rounded-lg p-3 sm:p-4"
                          >
                            {/* Test Name - Centered */}
                            <div className="text-center mb-3 sm:mb-4">
                              <h2 className="text-lg sm:text-xl font-semibold">
                                {test.name}
                              </h2>
                              {test.category && (
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                  {test.category}
                                </p>
                              )}
                            </div>

                            {/* Test Table */}
                            <div className="overflow-x-auto -mx-3 sm:mx-0">
                              <Table className="w-full min-w-[600px] sm:min-w-0">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[35%] font-semibold">
                                      Test
                                    </TableHead>
                                    <TableHead className="w-[20%] font-semibold">
                                      Result
                                    </TableHead>
                                    <TableHead className="w-[25%] font-semibold">
                                      Ref. Value
                                    </TableHead>
                                    <TableHead className="w-[20%] font-semibold">
                                      Unit
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {testParams.map(
                                    ([paramName, paramResult]) => {
                                      const rangeStr =
                                        typeof paramResult.range === "string"
                                          ? paramResult.range
                                          : typeof paramResult.range ===
                                            "object"
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
                                          return (
                                            numValue < min || numValue > max
                                          );
                                        }
                                        return false;
                                      })();

                                      return (
                                        <TableRow
                                          key={`${testId}-${paramName}`}
                                        >
                                          <TableCell className="w-[35%]">
                                            <div className="text-muted-foreground">
                                              {paramName}
                                            </div>
                                          </TableCell>
                                          <TableCell
                                            className={`w-[20%] ${
                                              isOutOfRange ? "font-bold" : ""
                                            }`}
                                          >
                                            {paramResult.value}
                                          </TableCell>
                                          <TableCell className="w-[25%] text-muted-foreground">
                                            {rangeStr}
                                          </TableCell>
                                          <TableCell className="w-[20%]">
                                            {paramResult.unit || "-"}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    }
                                  )}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Test Comment */}
                            {test.comment && test.comment.trim() !== "" && (
                              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4">
                                <h3 className="text-sm sm:text-base font-semibold mb-2">
                                  Comments
                                </h3>
                                <p className="text-xs sm:text-sm whitespace-pre-wrap text-muted-foreground">
                                  {test.comment}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* Footer Section with Lab Info */}
                  <div className="border-2 border-gray-300 rounded-lg p-3 sm:p-4">
                    <div className="text-center space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <p className="font-semibold text-xs sm:text-sm">
                        {toTitleCase(selectedReport.lab?.labName) ||
                          "PATHOLOGY LABORATORY"}
                      </p>
                      {selectedReport.lab?.labAddress && (
                        <p>{selectedReport.lab.labAddress}</p>
                      )}
                      {selectedReport.lab?.labContacts &&
                        selectedReport.lab.labContacts.length > 0 && (
                          <p>{selectedReport.lab.labContacts.join(" | ")}</p>
                        )}
                    </div>
                  </div>
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
        </DrawerContent>
      </Drawer>
    </div>
  );
}
