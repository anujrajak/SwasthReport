import { useLocation, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardLayout() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <AuthGuard>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {!isDashboard && <DashboardBreadcrumb />}
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}

