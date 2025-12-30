import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarHeader as DashboardSidebarHeader } from "./sidebar-header";
import { SidebarNavigation } from "./sidebar-navigation";
import { UserMenu } from "./user-menu";

export function DashboardSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <DashboardSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}



