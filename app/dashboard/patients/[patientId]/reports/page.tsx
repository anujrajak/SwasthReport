"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getPatient } from "@/utils/firestore/patients";
import { getReports, type ReportWithId } from "@/utils/firestore/reports";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Users } from "lucide-react";
import { Timestamp } from "firebase/firestore";

export default function PatientReportsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const patientId = params.patientId as string;
  const [reports, setReports] = useState<ReportWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState<string>("");

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
        <p className="text-muted-foreground">
          Please log in to view reports
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/patients")}
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
            All pathology reports for {patientName || "this patient"}
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
                onClick={() => router.push(`/dashboard/make-report?patientId=${patientId}`)}
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
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  const reportDate = report.date instanceof Timestamp
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

