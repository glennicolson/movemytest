"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";

// CRM route label map
const ROUTE_LABELS: Record<string, string> = {
// CRM staff routes
  dashboard: "Dashboard",
  schedule: "Schedule",
  security: "Security",
  access: "Access Management",
  "marketing-content": "CMS",
  "page-builder": "Page Builder",
  seo: "SEO & Analytics",
  reviews: "Reviews",
  "test-swap": "Test Swap",
  leads: "Leads",
  learners: "Learners",
  instructors: "Instructors",
  users: "Users",
  reports: "Reports",
  communications: "Communications",
  "blog-admin": "Blog Admin",
// Instructor portal routes
  instructor: "Instructor",
  pupils: "Learners",
  lessons: "Schedule",
  progress: "Progress",
  finance: "Finance",
  profile: "My Profile",
};

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

function buildCrmBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);

// Detect if this is the instructor portal
  const isInstructor = parts[0] === "instructor";
  const dashboardRoot = isInstructor ? "/instructor/dashboard" : "/dashboard";

// If we're at the root dashboard, no breadcrumbs needed
  if (pathname === dashboardRoot || pathname === "/instructor") return [];

  const items: BreadcrumbItem[] = [];

// Build breadcrumb path
  parts.forEach((part, index) => {
    const isCurrent = index === parts.length - 1;

// Look up label from map
    let label = ROUTE_LABELS[part];
    if (!label) {
// For dynamic segments like IDs, use "Details"
      label = "Details";
    }

// Fix href: for instructor portal, first segment links to dashboard not /instructor
    let href: string;
    if (isInstructor && index === 0) {
      href = "/instructor/dashboard";
    } else {
      href = "/" + parts.slice(0, index + 1).join("/");
    }

    items.push({
      label,
      href,
      isCurrent,
    });
  });

  return items;
}

export function CrmBreadcrumbs() {
  const pathname = usePathname();
  const items = buildCrmBreadcrumbs(pathname);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-2.5">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <BackButton />

          <ol className="flex flex-wrap items-center gap-1.5 text-sm">
            {items.map((item, index) => (
              <li key={item.href} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight size={14} className="text-slate-400" />
                )}
                {item.isCurrent ? (
                  <span className="font-semibold text-slate-900" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href as Route}
                    className="text-slate-500 transition-colors hover:text-slate-700 hover:underline"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}

function BackButton() {
  const pathname = usePathname();

  const parts = pathname.split("/").filter(Boolean);
  const isInstructor = parts[0] === "instructor";
  const dashboardRoot = isInstructor ? "/instructor/dashboard" : "/dashboard";

  let parentPath = dashboardRoot;

  if (parts.length > 1) {
// Go up one level
    parentPath = "/" + parts.slice(0, -1).join("/");
  } else if (parts.length === 1 && parts[0] !== dashboardRoot.replace("/", "")) {
    parentPath = dashboardRoot;
  }

  return (
    <Link
      href={parentPath as Route}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      title="Go back"
    >
      <ArrowLeft size={14} />
      Back
    </Link>
  );
}
