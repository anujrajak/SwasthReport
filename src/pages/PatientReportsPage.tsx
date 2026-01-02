import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getPatient, type PatientWithId } from "@/utils/firestore/patients";
import {
  getReports,
  getReport,
  verifyReport,
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
import { Badge } from "@/components/ui/badge";
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
  Plus,
  CheckCircle,
  Clock,
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

  const handleVerifyReport = async () => {
    if (
      !firebaseUser?.uid ||
      !patientId ||
      !selectedReport?.report ||
      !selectedReport?.patient
    ) {
      return;
    }

    const toastId = toast.loading("Verifying report...");

    try {
      await verifyReport(firebaseUser.uid, patientId, selectedReport.report.id);

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

      toast.success("Report verified successfully", { id: toastId });
    } catch (error) {
      console.error("Failed to verify report:", error);
      toast.error("Failed to verify report. Please try again.", {
        id: toastId,
      });
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                All pathology reports for{" "}
                {toTitleCase(patientName) || "this patient"}
              </CardDescription>
            </div>
            <Button
              onClick={() =>
                router(`/dashboard/make-report?patientId=${patientId}`)
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </div>
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
                  <TableHead>Status</TableHead>
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
                        {report.verified === true ? (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
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
                <>
                  {!selectedReport.report.verified ? (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={handleVerifyReport}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Report
                    </Button>
                  ) : (
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
                        const enableHeaderFooter =
                          lab?.enableHeaderFooter ?? true;
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
                            : new Date(report.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              ) +
                              " " +
                              new Date(report.date).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              );

                        const registeredDate =
                          report.registeredDate instanceof Timestamp
                            ? report.registeredDate
                                .toDate()
                                .toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }) +
                              " " +
                              report.registeredDate
                                .toDate()
                                .toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                            : report.createdAt instanceof Timestamp
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

                        const collectedDate =
                          report.collectedDate instanceof Timestamp
                            ? report.collectedDate
                                .toDate()
                                .toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }) +
                              " " +
                              report.collectedDate
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
                              };

                              const paramsRows = parameters
                                .map(
                                  ([paramName, paramResult]: [string, any]) => {
                                    const rStr = rangeStr(paramResult);
                                    const outOfRange = isOutOfRange(
                                      paramResult.value,
                                      rStr
                                    );
                                    return `
                          <tr>
                            <td style="width: 35%;"><div style="color: #1e293b;">${paramName}</div></td>
                            <td style="${
                              outOfRange ? "font-weight: bold;" : ""
                            } width: 20%;">${paramResult.value}</td>
                            <td style="color: #1e293b; width: 25%;">${rStr}</td>
                            <td style="width: 20%;">${
                              paramResult.unit || "-"
                            }</td>
                          </tr>
                        `;
                                  }
                                )
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
                          <div class="print-header" style="background-color: #ecfeff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;">
                            <div style="display: flex; gap: 1rem; align-items: center;">
                              <div style="display: flex; align-items: center; justify-content: start;">
                                ${
                                  lab?.labLogo
                                    ? `<img src="${lab.labLogo}" alt="Lab Logo" style="max-width: 100px; max-height: 100px; object-fit: contain;" />`
                                    : `<div style="display: flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 8px; background: rgba(0,0,0,0.05); border: 2px solid rgba(0,0,0,0.1);">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                        </svg>
                                      </div>`
                                }
                              </div>
                              <div style="display: flex; flex-direction: column; align-items: start; text-align: left;">
                                <h1 style="font-size: 1.5rem; font-weight: 700; margin: 0; color: #0d9488; letter-spacing: 0.5px; text-shadow: 2px 1px 0px #000, 0 0 8px rgba(13,148,136,0.3); font-family: 'Open Sans', Arial, sans-serif;">${
                                  toTitleCase(lab?.labName) ||
                                  "PATHOLOGY LABORATORY"
                                }</h1>
                                ${
                                  lab?.labAddress
                                    ? `<p style="font-size: 0.65rem; color: #1e293b; margin: 0.25rem 0 0 0; font-family: 'Open Sans', Arial, sans-serif;"><span style="font-weight: 700; color: #0891b2;">Address:</span> <span style="font-weight: 700; color: #1e293b;">${lab.labAddress}</span></p>`
                                    : ""
                                }
                                ${
                                  lab?.labContacts && lab.labContacts.length > 0
                                    ? `<p style="font-size: 0.65rem; color: #1e293b; margin: 0.25rem 0 0 0; font-family: 'Open Sans', Arial, sans-serif;"><span style="font-weight: 700; color: #0891b2;">Contact:</span> <span style="font-weight: 700; color: #1e293b;">${lab.labContacts.join(
                                        ", "
                                      )}</span></p>`
                                    : ""
                                }
                              </div>
                            </div>
                          </div>
                          `
                              : ""
                          }
                          <div class="print-patient-details">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; font-size: 0.75rem; margin-bottom: 0.5rem;">
                              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <div><span style="color: #1e293b;">Name : </span><span style="font-weight: 600; font-size: 0.875rem;">${
                                  patient.title ? patient.title + " " : ""
                                }${toTitleCase(patient.name)}</span></div>
                                <div><span style="color: #1e293b;">Age : </span><span style="font-weight: 500;">${
                                  patient.age
                                } Years</span></div>
                                <div><span style="color: #1e293b;">Sex : </span><span style="font-weight: 500; text-transform: capitalize;">${
                                  patient.gender
                                }</span></div>
                                <div><span style="color: #1e293b;">Ref. By : </span><span style="font-weight: 600;">${
                                  report.doctor || "SELF"
                                }</span></div>
                            </div>
                              <div style="display: flex; flex-direction: column; gap: 0.5rem; text-align: right;">
                                <div><span style="color: #1e293b;">Registered: </span><span style="font-weight: 500;">${registeredDate}</span></div>
                                <div><span style="color: #1e293b;">Collected : </span><span style="font-weight: 500;">${collectedDate}</span></div>
                                ${
                                  report.reportedDate
                                    ? `<div><span style="color: #1e293b;">Reported : </span><span style="font-weight: 500; color: #1e293b;">${
                                        report.reportedDate instanceof Timestamp
                                          ? report.reportedDate
                                              .toDate()
                                              .toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                              }) +
                                            " " +
                                            report.reportedDate
                                              .toDate()
                                              .toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                              })
                                          : new Date(
                                              report.reportedDate
                                            ).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            }) +
                                            " " +
                                            new Date(
                                              report.reportedDate
                                            ).toLocaleTimeString("en-US", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                            })
                                      }</span></div>`
                                    : ""
                                }
                          </div>
                              </div>
                          </div>
                          <div class="print-test">
                            <div style="text-align: center; margin-bottom: 1rem;">
                              <h2 style="font-size: 1rem; font-weight: 600; margin: 0;">${
                                test.name
                              }</h2>
                              <p style="font-size: 0.75rem; color: #1e293b; margin: 0.5rem 0 0 0;">${
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
                                      <h3 style="font-size: 0.875rem; font-weight: 600; padding-bottom: 0.25rem; margin-bottom: 0.75rem; color: #1e293b; font-family: 'Open Sans', Arial, sans-serif;">Comments</h3>
                                      <p style="font-size: 0.75rem; white-space: pre-wrap; color: #1e293b; font-family: 'Open Sans', Arial, sans-serif;">${test.comment}</p>
                                    </div>`
                                  : ""
                              }
                              ${
                                report.verified && lab?.pathologistName
                                  ? `<div style="display: flex; justify-content: flex-end; align-items: flex-end; margin-top: 1rem; margin-right: 2rem; margin-bottom: 0.5rem;">
                                      <div style="text-align: right;">
                                        ${
                                          lab?.pathologistSignature
                                            ? `<img src="${lab.pathologistSignature}" alt="Signature" style="max-width: 150px; max-height: 60px; margin-bottom: 0.5rem; display: block;" />`
                                            : ""
                                        }
                                        <p style="font-weight: 700; font-size: 0.75rem; margin: 0.25rem 0 0 0; color: #1e293b;">
                                          ${toTitleCase(lab.pathologistName)}
                                        </p>
                                        ${
                                          lab?.pathologistTitle
                                            ? `<p style="font-size: 0.65rem; color: #1e293b; margin: 0.125rem 0 0 0; font-family: 'Open Sans', Arial, sans-serif;">
                                                ${lab.pathologistTitle}
                                              </p>`
                                            : ""
                                        }
                                      </div>
                                    </div>`
                                  : ""
                              }
                          </div>
                          ${
                            enableHeaderFooter
                              ? `
                          <div class="print-footer" style="background-color: #f0fdfa !important;">
                            <p style="font-size: 0.65rem; color: #1e293b; margin: 0; padding: 0; text-align: center; font-weight: 500; line-height: 1.6; font-family: 'Open Sans', Arial, sans-serif;">
                              All pathology tests have their technical limitations. The results are for interpretation by the referring physician Any abnormal reading is to be correlated with the patient's condition. Unexpected results need to be re-confirmed by repeat tests. This report is not valid for medico-legal purpose.
                            </p>
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
                                    ? "margin: 3mm 6mm 3mm 6mm;"
                                    : `margin: ${topMargin}mm 6mm ${bottomMargin}mm 6mm;`
                                }
                              }
                              @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
                              * {
                                font-family: 'Open Sans', Arial, sans-serif !important;
                              }
                              body {
                                font-family: 'Open Sans', Arial, sans-serif !important;
                                font-size: 0.75rem;
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
                                border: 1px solid #0d9488;
                                border-bottom: 3px solid #0d9488;
                                padding: 0.5cm;
                                margin: 0;
                                background-color: #ecfeff;
                                box-sizing: border-box;
                              }
                              .print-footer {
                                width: 100%;
                                border: 1px solid #0d9488;
                                border-top: 3px solid #0d9488;
                                padding: 0.5cm;
                                margin: 0;
                                text-align: center;
                                font-size: 0.65rem;
                                color: #1e293b;
                                background-color: #f0fdfa !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                                color-adjust: exact;
                                box-sizing: border-box;
                              }
                              .print-patient-details {
                                width: 100%;
                                border: 1px solid #000;
                                border-top: 1px solid #ccc;
                                padding: 0.5cm;
                                margin: 0;
                                box-sizing: border-box;
                              }
                              .print-test {
                                flex: 1;
                                width: 100%;
                                border: 1px solid #000;
                                border-top: 1px solid #ccc;
                                padding: 0.5cm;
                                margin: 0;
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
                                font-size: 0.75rem;
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
                </>
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
        </DrawerContent>
      </Drawer>
    </div>
  );
}
