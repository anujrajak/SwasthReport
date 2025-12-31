import { LayoutDashboard, Users, FileText } from "lucide-react";
import { PiHospitalFill } from "react-icons/pi";
import { TbReportMedical } from "react-icons/tb";
import { MdSupportAgent } from "react-icons/md";

export const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Patients",
    icon: Users,
    url: "/dashboard/patients",
  },
  {
    title: "Make Report",
    icon: TbReportMedical,
    url: "/dashboard/make-report",
  },
  {
    title: "Reports",
    icon: FileText,
    url: "/dashboard/reports",
  },
  {
    title: "Lab Details",
    icon: PiHospitalFill,
    url: "/dashboard/lab-details",
  },
  {
    title: "Support",
    icon: MdSupportAgent,
    url: "/dashboard/support",
  },
];
