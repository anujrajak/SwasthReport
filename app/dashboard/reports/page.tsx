"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAllReports, getReport, type ReportWithPatientInfo, type ReportWithId, type TestResult } from "@/utils/firestore/reports";
import { getPatient, type PatientWithId } from "@/utils/firestore/patients";
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
import { FileText, Users, ChevronLeftIcon, ChevronRightIcon, Eye, Loader2, Activity, Printer } from "lucide-react";
import { Timestamp } from "firebase/firestore";

export default function ReportsPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ReportWithPatientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastReport, setLastReport] = useState<{
    patientId: string;
    reportDate: Timestamp;
    reportId: string;
  } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageHistory, setPageHistory] = useState<
    {
      patientId: string;
      reportDate: Timestamp;
      reportId: string;
    }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    report: ReportWithId | null;
    patient: PatientWithId | null;
    lab: User | null;
  } | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setLoading(false);
      return;
    }

    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid]);

  const fetchReports = async (
    lastReportData?: {
      patientId: string;
      reportDate: Timestamp;
      reportId: string;
    } | null,
    resetHistory = false
  ) => {
    if (!firebaseUser?.uid) return;

    try {
      setLoading(true);
      const result = await getAllReports(firebaseUser.uid, 50, lastReportData || undefined);
      console.log("Fetched reports:", result.reports.length, result);
      setReports(result.reports);
      setLastReport(result.lastReport);
      setHasMore(result.hasMore);

      if (resetHistory) {
        setPageHistory([]);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = async () => {
    if (!lastReport || !hasMore) return;

    // Save current lastReport to history for back navigation
    setPageHistory((prev) => [...prev, lastReport]);
    setCurrentPage((prev) => prev + 1);
    await fetchReports(lastReport, false);
  };

  const handlePreviousPage = async () => {
    if (currentPage === 1) return; // Prevent going below page 1

    const newHistory = [...pageHistory];
    newHistory.pop(); // Remove current page's lastReport from history
    setPageHistory(newHistory);
    setCurrentPage((prev) => prev - 1);

    // Fetch with the previous page's lastReport
    const previousLastReport =
      newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
    await fetchReports(previousLastReport, false);
  };

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

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Reports</h1>
        <p className="text-muted-foreground">
          View all pathology reports created in your lab
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            All pathology reports sorted by date (newest first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                No reports have been created yet.
              </p>
              <Button onClick={() => router.push("/dashboard/make-report")}>
                Create Report
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Comments</TableHead>
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
                      <TableRow
                        key={`${report.patientId}-${report.id}`}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(
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
                        <TableCell>{report.patientName}</TableCell>
                        <TableCell>{report.doctor}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{testCount} test(s)</span>
                            <span className="text-xs text-muted-foreground">
                              {testNames.length > 50
                                ? `${testNames.substring(0, 50)}...`
                                : testNames}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.comments ? (
                            <span className="text-sm">
                              {report.comments.length > 50
                                ? `${report.comments.substring(0, 50)}...`
                                : report.comments}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
              {reports.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {reports.length} report{reports.length !== 1 ? "s" : ""}
                    {hasMore && " (more available)"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="gap-1 px-2.5 sm:pl-2.5"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      <span className="hidden sm:block">Previous</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled
                      className="pointer-events-none"
                    >
                      {currentPage}
                    </Button>
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={handleNextPage}
                      disabled={!hasMore}
                      className="gap-1 px-2.5 sm:pr-2.5"
                    >
                      <span className="hidden sm:block">Next</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle>Pathology Report</DrawerTitle>
                <DrawerDescription>View complete report details</DrawerDescription>
              </div>
              {selectedReport?.report && selectedReport?.patient && (
                <Button
                  onClick={() => {
                    if (!selectedReport?.report || !selectedReport?.patient) return;
                    
                    const tests = Object.entries(selectedReport.report.tests || {});
                    const lab = selectedReport.lab;
                    const patient = selectedReport.patient;
                    const report = selectedReport.report;
                    
                    const reportDate = report.date instanceof Timestamp
                      ? report.date.toDate().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : new Date(report.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });

                    // Generate HTML for each test (one per page)
                    const testPages = tests.map(([testId, test]: [string, TestResult]) => {
                      const parameters = Object.entries(test.parameters || {})
                        .filter(([_, paramResult]) => {
                          return paramResult.value !== null && 
                                 paramResult.value !== undefined && 
                                 paramResult.value !== "";
                        });

                      const rangeStr = (paramResult: any) => {
                        const range = paramResult.range;
                        if (typeof range === "string") return range;
                        if (typeof range === "object") {
                          return range[patient.gender.toLowerCase()] ||
                                 range["normal"] ||
                                 "N/A";
                        }
                        return "N/A";
                      };

                      const isOutOfRange = (value: any, rangeStr: string) => {
                        const numValue = typeof value === "string" ? parseFloat(value) : value;
                        if (typeof numValue !== "number" || isNaN(numValue)) return false;
                        const rangeMatch = rangeStr.match(/(\d+\.?\d*)\s*[-–—]\s*(\d+\.?\d*)/);
                        if (rangeMatch) {
                          const min = parseFloat(rangeMatch[1]);
                          const max = parseFloat(rangeMatch[2]);
                          return numValue < min || numValue > max;
                        }
                        return false;
                      };

                      const paramsRows = parameters.map(([paramName, paramResult]: [string, any]) => {
                        const rStr = rangeStr(paramResult);
                        const outOfRange = isOutOfRange(paramResult.value, rStr);
                        return `
                          <tr>
                            <td style="font-weight: 500; width: 33.33%;">${paramName}</td>
                            <td style="${outOfRange ? 'font-weight: bold;' : ''} width: 33.33%;">${paramResult.value} ${paramResult.unit}</td>
                            <td style="color: #666; width: 33.33%;">${rStr}</td>
                          </tr>
                        `;
                      }).join('');

                      return `
                        <div class="print-page">
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
                                  <h1 style="font-size: 1.875rem; font-weight: bold; margin: 0;">${lab?.labName || "PATHOLOGY LABORATORY"}</h1>
                                  <p style="font-size: 0.875rem; color: #666; margin: 0.5rem 0 0 0;">PATHOLOGY REPORT</p>
                                  ${lab?.labAddress ? `<p style="font-size: 0.75rem; color: #666; margin: 0.75rem 0 0 0;">${lab.labAddress}</p>` : ''}
                                  ${lab?.labContacts && lab.labContacts.length > 0 ? `<p style="font-size: 0.75rem; color: #666; margin: 0.5rem 0 0 0;">${lab.labContacts.join(" | ")}</p>` : ''}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="print-patient-details">
                            <h2 style="font-size: 1.125rem; font-weight: 600; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; margin-bottom: 0.75rem;">Patient & Report Details</h2>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem;">
                              <div><span style="color: #666;">Name:</span> <span style="font-weight: 600;">${patient.name}</span></div>
                              <div><span style="color: #666;">Age:</span> <span style="font-weight: 600;">${patient.age} years</span></div>
                              <div><span style="color: #666;">Gender:</span> <span style="font-weight: 600; text-transform: capitalize;">${patient.gender}</span></div>
                              <div><span style="color: #666;">Phone:</span> <span style="font-weight: 600;">${patient.phone}</span></div>
                              ${patient.email ? `<div><span style="color: #666;">Email:</span> <span style="font-weight: 600;">${patient.email}</span></div>` : ''}
                              <div><span style="color: #666;">Report Date:</span> <span style="font-weight: 600;">${reportDate}</span></div>
                              <div><span style="color: #666;">Doctor:</span> <span style="font-weight: 600;">${report.doctor}</span></div>
                            </div>
                          </div>
                          <div class="print-test">
                            <h2 style="font-size: 1.125rem; font-weight: 600; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; margin-bottom: 1rem;">Test Results</h2>
                            <div style="border: 1px solid #ccc; border-radius: 8px; padding: 1rem;">
                              <div>
                                <h3 style="font-weight: 600; font-size: 1rem; margin: 0;">${test.name}</h3>
                                <p style="font-size: 0.75rem; color: #666; margin: 0.25rem 0 0 0;">${test.category}</p>
                              </div>
                              <table style="width: 100%; border-collapse: collapse; margin-top: 0.75rem;">
                                <thead>
                                  <tr>
                                    <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ccc; width: 33.33%;">Parameter</th>
                                    <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ccc; width: 33.33%;">Result</th>
                                    <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ccc; width: 33.33%;">Reference Range</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${paramsRows}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div class="print-footer">
                            <p style="font-weight: 600; margin: 0;">${lab?.labName || "PATHOLOGY LABORATORY"}</p>
                            ${lab?.labAddress ? `<p style="margin: 0.25rem 0 0 0;">${lab.labAddress}</p>` : ''}
                            ${lab?.labContacts && lab.labContacts.length > 0 ? `<p style="margin: 0.25rem 0 0 0;">${lab.labContacts.join(" | ")}</p>` : ''}
                          </div>
                        </div>
                      `;
                    }).join('');

                    // Add comments page if exists
                    let commentsPage = '';
                    if (report.comments) {
                      commentsPage = `
                        <div class="print-page">
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
                                  <h1 style="font-size: 1.875rem; font-weight: bold; margin: 0;">${lab?.labName || "PATHOLOGY LABORATORY"}</h1>
                                  <p style="font-size: 0.875rem; color: #666; margin: 0.5rem 0 0 0;">PATHOLOGY REPORT</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="print-patient-details">
                            <h2 style="font-size: 1.125rem; font-weight: 600; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; margin-bottom: 0.75rem;">Patient & Report Details</h2>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem;">
                              <div><span style="color: #666;">Name:</span> <span style="font-weight: 600;">${patient.name}</span></div>
                              <div><span style="color: #666;">Age:</span> <span style="font-weight: 600;">${patient.age} years</span></div>
                            </div>
                          </div>
                          <div style="margin-bottom: 2rem;">
                            <h2 style="font-size: 1.125rem; font-weight: 600; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; margin-bottom: 0.75rem;">Comments</h2>
                            <p style="font-size: 0.875rem; white-space: pre-wrap;">${report.comments}</p>
                          </div>
                          <div class="print-footer">
                            <p style="font-weight: 600; margin: 0;">${lab?.labName || "PATHOLOGY LABORATORY"}</p>
                            ${lab?.labAddress ? `<p style="margin: 0.25rem 0 0 0;">${lab.labAddress}</p>` : ''}
                            ${lab?.labContacts && lab.labContacts.length > 0 ? `<p style="margin: 0.25rem 0 0 0;">${lab.labContacts.join(" | ")}</p>` : ''}
                          </div>
                        </div>
                      `;
                    }

                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Pathology Report</title>
                            <style>
                              @page {
                                size: A4;
                                margin: 2.54cm;
                              }
                              body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 0;
                              }
                              .print-page {
                                page-break-after: always;
                                min-height: calc(100vh - 5.08cm);
                                display: flex;
                                flex-direction: column;
                                padding: 0;
                              }
                              .print-page:last-child {
                                page-break-after: auto;
                              }
                              .print-header {
                                border-bottom: 2px solid #000;
                                padding-bottom: 1.5cm;
                                margin-bottom: 1.5cm;
                              }
                              .print-footer {
                                border-top: 1px solid #ccc;
                                padding-top: 1cm;
                                margin-top: auto;
                                text-align: center;
                                font-size: 10px;
                                color: #666;
                              }
                              .print-patient-details {
                                margin-bottom: 1.5cm;
                              }
                              .print-test {
                                flex: 1;
                              }
                              table {
                                width: 100%;
                                border-collapse: collapse;
                              }
                              th, td {
                                padding: 0.5rem;
                                text-align: left;
                              }
                              thead th {
                                border-bottom: 1px solid #ccc;
                              }
                            </style>
                          </head>
                          <body>
                            ${testPages}${commentsPage}
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
          <div className="overflow-y-auto" style={{ padding: '2.54cm 2.54cm' }}>
            {loadingReport ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedReport?.report && selectedReport?.patient ? (
              <>
                {/* Printable version with page breaks */}
                <div className="hidden print:block">
                  {Object.entries(selectedReport.report.tests || {}).map(
                    ([testId, test]: [string, TestResult], index) => (
                      <div key={testId} className="print-page">
                        {/* Header Section with Lab Info */}
                        <div className="print-header">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-start">
                              <div className="flex items-center justify-center w-20 h-20 rounded-lg bg-primary/10 border-2 border-primary/20">
                                <Activity className="h-12 w-12 text-primary" />
                              </div>
                            </div>
                            <div className="flex items-center justify-end text-right space-y-2">
                              <div>
                                <h1 className="text-3xl font-bold">
                                  {selectedReport.lab?.labName || "PATHOLOGY LABORATORY"}
                                </h1>
                                <p className="text-sm text-muted-foreground">PATHOLOGY REPORT</p>
                                {selectedReport.lab?.labAddress && (
                                  <div className="mt-3 text-xs text-muted-foreground">
                                    <p>{selectedReport.lab.labAddress}</p>
                                  </div>
                                )}
                                {selectedReport.lab?.labContacts && selectedReport.lab.labContacts.length > 0 && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <p>{selectedReport.lab.labContacts.join(" | ")}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Patient & Report Details Section */}
                        <div className="print-patient-details">
                          <h2 className="text-lg font-semibold border-b pb-1 mb-3">
                            Patient & Report Details
                          </h2>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Name:</span>
                              <span className="ml-2 font-semibold">{selectedReport.patient.name}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Age:</span>
                              <span className="ml-2 font-semibold">{selectedReport.patient.age} years</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Gender:</span>
                              <span className="ml-2 font-semibold capitalize">{selectedReport.patient.gender}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="ml-2 font-semibold">{selectedReport.patient.phone}</span>
                            </div>
                            {selectedReport.patient.email && (
                              <div>
                                <span className="text-muted-foreground">Email:</span>
                                <span className="ml-2 font-semibold">{selectedReport.patient.email}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Report Date:</span>
                              <span className="ml-2 font-semibold">
                                {selectedReport.report.date instanceof Timestamp
                                  ? selectedReport.report.date.toDate().toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : new Date(selectedReport.report.date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Doctor:</span>
                              <span className="ml-2 font-semibold">{selectedReport.report.doctor}</span>
                            </div>
                          </div>
                        </div>

                        {/* Test Results Section - One test per page */}
                        <div className="print-test">
                          <h2 className="text-lg font-semibold border-b pb-1 mb-4">
                            Test Results
                          </h2>
                          <div className="border rounded-lg p-4 space-y-3">
                            <div>
                              <h3 className="font-semibold text-base">{test.name}</h3>
                              <p className="text-xs text-muted-foreground">{test.category}</p>
                            </div>
                            <div className="overflow-x-auto">
                              <Table className="table-fixed w-full">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-1/3">Parameter</TableHead>
                                    <TableHead className="w-1/3">Result</TableHead>
                                    <TableHead className="w-1/3">Reference Range</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Object.entries(test.parameters || {})
                                    .filter(([_, paramResult]) => {
                                      return paramResult.value !== null && 
                                             paramResult.value !== undefined && 
                                             paramResult.value !== "";
                                    })
                                    .map(([paramName, paramResult]) => {
                                      const rangeStr =
                                        typeof paramResult.range === "string"
                                          ? paramResult.range
                                          : typeof paramResult.range === "object"
                                          ? paramResult.range[selectedReport.patient.gender.toLowerCase()] ||
                                            paramResult.range["normal"] ||
                                            "N/A"
                                          : "N/A";

                                      const isOutOfRange = (() => {
                                        const value = paramResult.value;
                                        const numValue = typeof value === "string" ? parseFloat(value) : value;
                                        if (typeof numValue !== "number" || isNaN(numValue)) return false;
                                        const rangeMatch = rangeStr.match(/(\d+\.?\d*)\s*[-–—]\s*(\d+\.?\d*)/);
                                        if (rangeMatch) {
                                          const min = parseFloat(rangeMatch[1]);
                                          const max = parseFloat(rangeMatch[2]);
                                          return numValue < min || numValue > max;
                                        }
                                        return false;
                                      })();

                                      return (
                                        <TableRow key={paramName}>
                                          <TableCell className="font-medium w-1/3">
                                            {paramName}
                                          </TableCell>
                                          <TableCell className={isOutOfRange ? "font-bold w-1/3" : "w-1/3"}>
                                            {paramResult.value} {paramResult.unit}
                                          </TableCell>
                                          <TableCell className="text-muted-foreground w-1/3">
                                            {rangeStr}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>

                        {/* Footer Section with Lab Info */}
                        <div className="print-footer">
                          <p className="font-semibold">
                            {selectedReport.lab?.labName || "PATHOLOGY LABORATORY"}
                          </p>
                          {selectedReport.lab?.labAddress && (
                            <p>{selectedReport.lab.labAddress}</p>
                          )}
                          {selectedReport.lab?.labContacts && selectedReport.lab.labContacts.length > 0 && (
                            <p>{selectedReport.lab.labContacts.join(" | ")}</p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                  {/* Comments on last page if exists */}
                  {selectedReport.report.comments && (
                    <div className="print-page">
                      <div className="print-header">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center justify-start">
                            <div className="flex items-center justify-center w-20 h-20 rounded-lg bg-primary/10 border-2 border-primary/20">
                              <Activity className="h-12 w-12 text-primary" />
                            </div>
                          </div>
                          <div className="flex items-center justify-end text-right space-y-2">
                            <div>
                              <h1 className="text-3xl font-bold">
                                {selectedReport.lab?.labName || "PATHOLOGY LABORATORY"}
                              </h1>
                              <p className="text-sm text-muted-foreground">PATHOLOGY REPORT</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="print-patient-details">
                        <h2 className="text-lg font-semibold border-b pb-1 mb-3">
                          Patient & Report Details
                        </h2>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <span className="ml-2 font-semibold">{selectedReport.patient.name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Age:</span>
                            <span className="ml-2 font-semibold">{selectedReport.patient.age} years</span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-8 space-y-2">
                        <h2 className="text-lg font-semibold border-b pb-1 mb-3">
                          Comments
                        </h2>
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedReport.report.comments}
                        </p>
                      </div>
                      <div className="print-footer">
                        <p className="font-semibold">
                          {selectedReport.lab?.labName || "PATHOLOGY LABORATORY"}
                        </p>
                        {selectedReport.lab?.labAddress && (
                          <p>{selectedReport.lab.labAddress}</p>
                        )}
                        {selectedReport.lab?.labContacts && selectedReport.lab.labContacts.length > 0 && (
                          <p>{selectedReport.lab.labContacts.join(" | ")}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Screen version */}
                <div className="space-y-0 print:hidden" style={{ maxWidth: '210mm', margin: '0 auto' }}>
                  {/* Header Section with Lab Info */}
                  <div className="border-b-2 border-gray-800 pb-6 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-start">
                        <div className="flex items-center justify-center w-20 h-20 rounded-lg bg-primary/10 border-2 border-primary/20">
                          <Activity className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      <div className="flex items-center justify-end text-right space-y-2">
                        <div>
                          <h1 className="text-3xl font-bold">
                            {selectedReport.lab?.labName || "PATHOLOGY LABORATORY"}
                          </h1>
                          <p className="text-sm text-muted-foreground">PATHOLOGY REPORT</p>
                          {selectedReport.lab?.labAddress && (
                            <div className="mt-3 text-xs text-muted-foreground">
                              <p>{selectedReport.lab.labAddress}</p>
                            </div>
                          )}
                          {selectedReport.lab?.labContacts && selectedReport.lab.labContacts.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p>{selectedReport.lab.labContacts.join(" | ")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                {/* Patient & Report Details Section */}
                <div className="mb-8 space-y-2">
                  <h2 className="text-lg font-semibold border-b pb-1 mb-3">
                    Patient & Report Details
                  </h2>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-semibold">{selectedReport.patient.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <span className="ml-2 font-semibold">{selectedReport.patient.age} years</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="ml-2 font-semibold capitalize">{selectedReport.patient.gender}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="ml-2 font-semibold">{selectedReport.patient.phone}</span>
                    </div>
                    {selectedReport.patient.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2 font-semibold">{selectedReport.patient.email}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Report Date:</span>
                      <span className="ml-2 font-semibold">
                        {selectedReport.report.date instanceof Timestamp
                          ? selectedReport.report.date.toDate().toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : new Date(selectedReport.report.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Doctor:</span>
                      <span className="ml-2 font-semibold">{selectedReport.report.doctor}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Test Results Section */}
                <div className="mb-8 space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-1 mb-4">
                    Test Results
                  </h2>
                  {Object.entries(selectedReport.report.tests || {}).map(
                    ([testId, test]: [string, TestResult]) => (
                      <div key={testId} className="border rounded-lg p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-base">{test.name}</h3>
                          <p className="text-xs text-muted-foreground">{test.category}</p>
                        </div>
                        <div className="overflow-x-auto">
                          <Table className="table-fixed w-full">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/3">Parameter</TableHead>
                                <TableHead className="w-1/3">Result</TableHead>
                                <TableHead className="w-1/3">Reference Range</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(test.parameters || {})
                                .filter(([_, paramResult]) => {
                                  // Filter out parameters without results
                                  return paramResult.value !== null && 
                                         paramResult.value !== undefined && 
                                         paramResult.value !== "";
                                })
                                .map(([paramName, paramResult]) => {
                                  const rangeStr =
                                    typeof paramResult.range === "string"
                                      ? paramResult.range
                                      : typeof paramResult.range === "object"
                                      ? paramResult.range[selectedReport.patient.gender.toLowerCase()] ||
                                        paramResult.range["normal"] ||
                                        "N/A"
                                      : "N/A";

                                  // Check if value is outside range
                                  const isOutOfRange = (() => {
                                    const value = paramResult.value;
                                    // Convert to number if it's a string
                                    const numValue = typeof value === "string" ? parseFloat(value) : value;
                                    
                                    // Skip if value is not a valid number
                                    if (typeof numValue !== "number" || isNaN(numValue)) return false;
                                    
                                    // Parse range string (e.g., "10 - 140" or "70-100")
                                    const rangeMatch = rangeStr.match(/(\d+\.?\d*)\s*[-–—]\s*(\d+\.?\d*)/);
                                    if (rangeMatch) {
                                      const min = parseFloat(rangeMatch[1]);
                                      const max = parseFloat(rangeMatch[2]);
                                      return numValue < min || numValue > max;
                                    }
                                    
                                    // If range doesn't match numeric pattern, assume it's in range
                                    return false;
                                  })();

                                  return (
                                    <TableRow key={paramName}>
                                      <TableCell className="font-medium w-1/3">
                                        {paramName}
                                      </TableCell>
                                      <TableCell className={isOutOfRange ? "font-bold w-1/3" : "w-1/3"}>
                                        {paramResult.value} {paramResult.unit}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground w-1/3">
                                        {rangeStr}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Comments */}
                {selectedReport.report.comments && (
                  <>
                    <Separator className="my-8" />
                    <div className="mb-8 space-y-2">
                      <h2 className="text-lg font-semibold border-b pb-1 mb-3">
                        Comments
                      </h2>
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedReport.report.comments}
                      </p>
                    </div>
                  </>
                )}

                {/* Footer Section with Lab Info */}
                <div className="border-t border-gray-300 pt-6 mt-8">
                  <div className="text-center space-y-1 text-xs text-muted-foreground">
                    <p className="font-semibold">
                      {selectedReport.lab?.labName || "PATHOLOGY LABORATORY"}
                    </p>
                    {selectedReport.lab?.labAddress && (
                      <p>{selectedReport.lab.labAddress}</p>
                    )}
                    {selectedReport.lab?.labContacts && selectedReport.lab.labContacts.length > 0 && (
                      <p>{selectedReport.lab.labContacts.join(" | ")}</p>
                    )}
                  </div>
                </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No report data available</p>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

