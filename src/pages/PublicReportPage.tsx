import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { getReportById } from "@/utils/firestore/reports";
import { getPatient, type PatientWithId } from "@/utils/firestore/patients";
import { getUser, type User } from "@/utils/firestore/users";
import { toTitleCase, sortParametersByConstantsOrder } from "@/lib/utils";
import { Loader2, FileText } from "lucide-react";
import type { ReportWithId, TestResult } from "@/utils/firestore/reports";

export default function PublicReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportWithId | null>(null);
  const [patient, setPatient] = useState<PatientWithId | null>(null);
  const [lab, setLab] = useState<User | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setError("Report ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getReportById(reportId);

        if (!result || !result.report || !result.userId || !result.patientId) {
          setError("Report not found");
          setLoading(false);
          return;
        }

        // Fetch patient and lab data
        const [patientData, labData] = await Promise.all([
          getPatient(result.userId, result.patientId),
          getUser(result.userId),
        ]);

        if (!patientData) {
          setError("Patient data not found");
          setLoading(false);
          return;
        }

        setReport(result.report);
        setPatient(patientData);
        setLab(labData);
      } catch (err) {
        console.error("Failed to fetch report:", err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
          <p className="text-muted-foreground">
            {error || "The requested report could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const enableHeaderFooter = lab?.enableHeaderFooter ?? true;
  const topMargin = lab?.topMargin ?? 15;
  const bottomMargin = lab?.bottomMargin ?? 15;

  // Format dates
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
    report.registeredDate instanceof Timestamp
      ? report.registeredDate.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) +
        " " +
        report.registeredDate.toDate().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : reportDate;

  const collectedDate =
    report.collectedDate instanceof Timestamp
      ? report.collectedDate.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) +
        " " +
        report.collectedDate.toDate().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : reportDate;

  // Show all tests, even if they have no values (will show "-" for missing parameters)
  const tests = Object.entries(report.tests || {});

  const rangeStr = (paramResult: any) => {
    const range = paramResult.range;
    if (typeof range === "string") return range;
    if (typeof range === "object") {
      return range[patient.gender.toLowerCase()] || range["normal"] || "N/A";
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

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print button - hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <button
          onClick={handlePrint}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg hover:bg-primary/90 transition-colors"
        >
          Print PDF
        </button>
      </div>

      {/* Report Content */}
      <div
        style={{
          maxWidth: "210mm",
          margin: "0 auto",
          fontFamily: "'Open Sans', Arial, sans-serif",
          backgroundColor: "white",
          padding: 0,
        }}
      >
        {tests.map(([testId, test]: [string, TestResult], testIndex) => {
          const isLastTest = testIndex === tests.length - 1;
          const allParams = test.parameters || {};
          const parameters = sortParametersByConstantsOrder(testId, allParams);

          const hasTestComment = test.comment && test.comment.trim() !== "";

          return (
            <div
              key={testId}
              className={`print-page ${isLastTest ? "print-page-last" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 0,
                margin: 0,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {/* Header Section */}
              {enableHeaderFooter && (
                <div
                  className="print-header"
                  style={{
                    width: "100%",
                    border: "1px solid #0d9488",
                    borderBottom: "3px solid #0d9488",
                    padding: "0.5cm",
                    margin: 0,
                    backgroundColor: "#ecfeff",
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                    colorAdjust: "exact",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "start",
                      }}
                    >
                      {lab?.labLogo ? (
                        <img
                          src={lab.labLogo}
                          alt="Lab Logo"
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "80px",
                            height: "80px",
                            borderRadius: "8px",
                            background: "rgba(0,0,0,0.05)",
                            border: "2px solid rgba(0,0,0,0.1)",
                          }}
                        >
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                        textAlign: "left",
                      }}
                    >
                      <h1
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          margin: 0,
                          color: "#0d9488",
                          letterSpacing: "0.5px",
                          textShadow:
                            "2px 1px 0px #000, 0 0 8px rgba(13,148,136,0.3)",
                          fontFamily: "'Open Sans', Arial, sans-serif",
                        }}
                      >
                        {toTitleCase(lab?.labName) || "PATHOLOGY LABORATORY"}
                      </h1>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          margin: "0.25rem 0 0 0",
                          color: "#0891b2",
                          fontFamily: "'Open Sans', Arial, sans-serif",
                        }}
                      >
                        PATHOLOGY LAB
                      </p>
                      {lab?.labAddress && (
                        <p
                          style={{
                            fontSize: "0.65rem",
                            color: "#1e293b",
                            margin: "0.25rem 0 0 0",
                            fontFamily: "'Open Sans', Arial, sans-serif",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              color: "#0891b2",
                            }}
                          >
                            Address:
                          </span>{" "}
                          <span style={{ fontWeight: 700, color: "#1e293b" }}>
                            {lab.labAddress}
                          </span>
                        </p>
                      )}
                      {lab?.labContacts && lab.labContacts.length > 0 && (
                        <p
                          style={{
                            fontSize: "0.65rem",
                            color: "#1e293b",
                            margin: "0.25rem 0 0 0",
                            fontFamily: "'Open Sans', Arial, sans-serif",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              color: "#0891b2",
                            }}
                          >
                            Contact:
                          </span>{" "}
                          <span style={{ fontWeight: 700, color: "#1e293b" }}>
                            {lab.labContacts.join(", ")}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Details Section */}
              <div
                className="print-patient-details"
                style={{
                  width: "100%",
                  border: "1px solid #000",
                  borderTop: "1px solid #ccc",
                  padding: "0.5cm",
                  margin: 0,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "2rem",
                    fontSize: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      <span style={{ color: "#1e293b" }}>Name : </span>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "#1e293b",
                        }}
                      >
                        {patient.title ? patient.title + " " : ""}
                        {toTitleCase(patient.name)}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#1e293b" }}>Age : </span>
                      <span style={{ fontWeight: 500, color: "#1e293b" }}>
                        {patient.age} Years
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#1e293b" }}>Sex : </span>
                      <span
                        style={{
                          fontWeight: 500,
                          textTransform: "capitalize",
                          color: "#1e293b",
                        }}
                      >
                        {patient.gender}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#1e293b" }}>Ref. By : </span>
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>
                        {report.doctor || "SELF"}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      textAlign: "right",
                    }}
                  >
                    <div>
                      <span style={{ color: "#1e293b" }}>Registered: </span>
                      <span style={{ fontWeight: 500, color: "#1e293b" }}>
                        {registeredDate}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#1e293b" }}>Collected : </span>
                      <span style={{ fontWeight: 500, color: "#1e293b" }}>
                        {collectedDate}
                      </span>
                    </div>
                    {report.reportedDate && (
                      <div>
                        <span style={{ color: "#1e293b" }}>Reported : </span>
                        <span style={{ fontWeight: 500, color: "#1e293b" }}>
                          {report.reportedDate instanceof Timestamp
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
                            : new Date(report.reportedDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              ) +
                              " " +
                              new Date(report.reportedDate).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Test Section */}
              <div
                className="print-test"
                style={{
                  flex: 1,
                  width: "100%",
                  border: "1px solid #000",
                  borderTop: "1px solid #ccc",
                  padding: "0.5cm",
                  margin: 0,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      margin: 0,
                      color: "#000000",
                    }}
                  >
                    {test.name}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#1e293b",
                      margin: "0.5rem 0 0 0",
                    }}
                  >
                    {test.category}
                  </p>
                </div>

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #ccc",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "0.5rem",
                          borderBottom: "1px solid #ccc",
                          fontWeight: 600,
                          width: "35%",
                          border: "1px solid #ccc",
                          fontSize: "0.75rem",
                          color: "#000000",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        Test
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "0.5rem",
                          borderBottom: "1px solid #ccc",
                          fontWeight: 600,
                          width: "20%",
                          border: "1px solid #ccc",
                          fontSize: "0.75rem",
                          color: "#000000",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        Result
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "0.5rem",
                          borderBottom: "1px solid #ccc",
                          fontWeight: 600,
                          width: "25%",
                          border: "1px solid #ccc",
                          fontSize: "0.75rem",
                          color: "#000000",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        Ref. Value
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "0.5rem",
                          borderBottom: "1px solid #ccc",
                          fontWeight: 600,
                          width: "20%",
                          border: "1px solid #ccc",
                          fontSize: "0.75rem",
                          color: "#000000",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        Unit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parameters.map(
                      ([paramName, paramResult]: [string, any]) => {
                        const rStr = rangeStr(paramResult);
                        const outOfRange = isOutOfRange(
                          paramResult.value,
                          rStr
                        );
                        return (
                          <tr key={paramName}>
                            <td
                              style={{
                                width: "35%",
                                fontFamily: "'Open Sans', Arial, sans-serif",
                                padding: "0.5rem",
                                textAlign: "left",
                                border: "1px solid #ccc",
                                fontSize: "0.75rem",
                                color: "#1e293b",
                              }}
                            >
                              <div style={{ color: "#1e293b" }}>
                                {paramName}
                              </div>
                            </td>
                            <td
                              style={{
                                fontWeight: outOfRange ? "bold" : "normal",
                                width: "20%",
                                color: "#1e293b",
                                fontFamily: "'Open Sans', Arial, sans-serif",
                                padding: "0.5rem",
                                textAlign: "left",
                                border: "1px solid #ccc",
                                fontSize: "0.75rem",
                              }}
                            >
                              {paramResult.value}
                            </td>
                            <td
                              style={{
                                color: "#1e293b",
                                width: "25%",
                                fontFamily: "'Open Sans', Arial, sans-serif",
                                padding: "0.5rem",
                                textAlign: "left",
                                border: "1px solid #ccc",
                                fontSize: "0.75rem",
                              }}
                            >
                              {rStr}
                            </td>
                            <td
                              style={{
                                width: "20%",
                                color: "#1e293b",
                                fontFamily: "'Open Sans', Arial, sans-serif",
                                padding: "0.5rem",
                                textAlign: "left",
                                border: "1px solid #ccc",
                                fontSize: "0.75rem",
                              }}
                            >
                              {paramResult.unit || "-"}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>

                {hasTestComment && (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      padding: "0.5cm 0",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        paddingBottom: "0.25rem",
                        marginBottom: "0.75rem",
                        color: "#1e293b",
                        fontFamily: "'Open Sans', Arial, sans-serif",
                      }}
                    >
                      Comments
                    </h3>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        whiteSpace: "pre-wrap",
                        color: "#1e293b",
                      }}
                    >
                      {test.comment}
                    </p>
                  </div>
                )}

                {report.verified && lab?.pathologistName && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      marginTop: "1rem",
                      marginRight: "2rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      {lab?.pathologistSignature && (
                        <img
                          src={lab.pathologistSignature}
                          alt="Signature"
                          style={{
                            maxWidth: "150px",
                            maxHeight: "60px",
                            marginBottom: "0.5rem",
                            display: "block",
                          }}
                        />
                      )}
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          margin: "0.25rem 0 0 0",
                          color: "#1e293b",
                        }}
                      >
                        {toTitleCase(lab.pathologistName)}
                      </p>
                      {lab?.pathologistTitle && (
                        <p
                          style={{
                            fontSize: "0.65rem",
                            color: "#1e293b",
                            margin: "0.125rem 0 0 0",
                            fontFamily: "'Open Sans', Arial, sans-serif",
                          }}
                        >
                          {lab.pathologistTitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Section */}
              {enableHeaderFooter && (
                <div
                  className="print-footer"
                  style={{
                    width: "100%",
                    border: "1px solid #0d9488",
                    borderTop: "3px solid #0d9488",
                    padding: "0.5cm",
                    margin: 0,
                    textAlign: "center",
                    fontSize: "0.65rem",
                    color: "#1e293b",
                    backgroundColor: "#f0fdfa",
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                    colorAdjust: "exact",
                    boxSizing: "border-box",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.65rem",
                      color: "#1e293b",
                      margin: 0,
                      padding: 0,
                      textAlign: "center",
                      fontWeight: 500,
                      lineHeight: 1.6,
                      fontFamily: "'Open Sans', Arial, sans-serif",
                    }}
                  >
                    All pathology tests have their technical limitations. The
                    results are for interpretation by the referring physician
                    Any abnormal reading is to be correlated with the patient's
                    condition. Unexpected results need to be re-confirmed by
                    repeat tests. This report is not valid for medico-legal
                    purpose.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: ${
              enableHeaderFooter
                ? "6mm"
                : `${topMargin}mm 6mm ${bottomMargin}mm 6mm`
            };
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
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
          .print-page-last {
            page-break-after: avoid !important;
          }
          .print-header {
            width: 100%;
            border: 1px solid #0d9488;
            border-bottom: 3px solid #0d9488;
            padding: 0.5cm;
            margin: 0;
            background-color: #ecfeff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
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
          .print\\:hidden {
            display: none !important;
          }
        }
        @media screen {
          body {
            margin: 0;
            padding: 0;
            background: #f5f5f5;
          }
          .print-page {
            min-height: auto !important;
            page-break-after: auto !important;
            margin-bottom: 0;
          }
          .print-page:not(:last-child) {
            page-break-after: auto !important;
            margin-bottom: 0;
          }
          .print-page:last-child {
            page-break-after: auto !important;
          }
          .print-page:last-of-type {
            page-break-after: auto !important;
          }
          .print-page-last {
            page-break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
