import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { getPatient } from "@/utils/firestore/patients";
import { toTitleCase } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive: boolean;
}

// Map of route segments to display labels
const routeLabels: Record<string, string> = {
  patients: "Patients",
  reports: "Reports",
  "lab-details": "Lab Details",
  "make-report": "Make Report",
};

// Check if a segment looks like an ID (long alphanumeric string)
function isLikelyId(segment: string): boolean {
  // IDs are typically 20+ characters of alphanumeric strings
  return /^[a-zA-Z0-9]{20,}$/.test(segment);
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Dashboard
  breadcrumbs.push({
    label: "Dashboard",
    href: "/dashboard",
    isActive: pathname === "/dashboard",
  });

  // Generate breadcrumbs from path segments
  if (pathSegments.length > 1) {
    // Skip the first segment (dashboard) and build paths
    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const href = "/" + pathSegments.slice(0, i + 1).join("/");
      const isLast = i === pathSegments.length - 1;

      // Skip IDs - they will be replaced with actual names
      if (isLikelyId(segment)) {
        continue;
      }

      // Use mapped label or capitalize and format segment name
      const label =
        routeLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

      breadcrumbs.push({
        label,
        href: isLast ? undefined : href, // Last item has no href
        isActive: isLast,
      });
    }
  }

  return breadcrumbs;
}

export function DashboardBreadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { user: firebaseUser } = useAuth();
  const [patientName, setPatientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Extract patient ID from pathname if present
  const pathSegments = pathname.split("/").filter(Boolean);
  const patientIdIndex = pathSegments.findIndex(
    (seg, index) => seg === "patients" && pathSegments[index + 1] && isLikelyId(pathSegments[index + 1])
  );
  const patientId =
    patientIdIndex !== -1 ? pathSegments[patientIdIndex + 1] : null;

  useEffect(() => {
    if (patientId && firebaseUser?.uid) {
      setLoading(true);
      getPatient(firebaseUser.uid, patientId)
        .then((patient) => {
          if (patient) {
            setPatientName(patient.name);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch patient name:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPatientName(null);
    }
  }, [patientId, firebaseUser?.uid]);

  const breadcrumbs = generateBreadcrumbs(pathname);

  // Check if we're on a reports page
  const isReportsPage = pathname.endsWith("/reports") && patientId;

  // Remove "Reports" breadcrumb if we're on the reports page
  if (isReportsPage) {
    const reportsIndex = breadcrumbs.findIndex(
      (crumb) => crumb.label === "Reports"
    );
    if (reportsIndex !== -1) {
      breadcrumbs.splice(reportsIndex, 1);
    }
  }

  // Insert patient name breadcrumb if we have a patient ID in the path
  if (patientId && patientIdIndex !== -1) {
    const patientsIndex = breadcrumbs.findIndex(
      (crumb) => crumb.label === "Patients"
    );
    if (patientsIndex !== -1) {
      // Insert patient name after "Patients"
      const patientBreadcrumb: BreadcrumbItem = {
        label: loading ? "Loading..." : toTitleCase(patientName) || "Patient",
        href: isReportsPage ? undefined : `/dashboard/patients/${patientId}`, // No href if on reports page
        isActive: isReportsPage || pathname === `/dashboard/patients/${patientId}`, // Active if on reports page
      };
      breadcrumbs.splice(patientsIndex + 1, 0, patientBreadcrumb);
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href || crumb.label}>
            <BreadcrumbItem>
              {crumb.isActive ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  asChild={false}
                  onClick={() => crumb.href && navigate(crumb.href)}
                  style={{ cursor: crumb.href ? 'pointer' : 'default' }}
                >
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
