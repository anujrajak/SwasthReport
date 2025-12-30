
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getPatients } from "@/utils/firestore/patients";
import { getAllReports } from "@/utils/firestore/reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, Calendar } from "lucide-react";

export default function DashboardPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalReports: 0,
    loading: true,
  });

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
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setStats({ totalPatients: 0, totalReports: 0, loading: false });
      }
    };

    fetchDashboardData();
  }, [firebaseUser?.uid]);

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
    </div>
  );
}
