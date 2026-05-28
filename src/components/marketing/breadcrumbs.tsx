"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import type { Route } from "next";

// Route label map for breadcrumbs
const ROUTE_LABELS: Record<string, string> = {
  "driving-lessons": "Driving Lessons",
  prices: "Prices",
  areas: "Areas",
  faq: "FAQ",
  "meet-the-team": "Meet the Team",
  "become-an-instructor": "Become an Instructor",
  blog: "Blog",
  "blog-admin": "Blog Admin",
  about: "About",
  contact: "Contact",
  reviews: "Reviews",
  "ready_to_pass": "Ready to Pass",
  "resource-hub": "Resource Hub",
  "learner-help": "Learner Help",
  "theory-test-help": "Theory Test Help",
  "driving-test-help": "Driving Test Help",
  "learner-basics": "Learner Basics",
  news: "News & Updates",
  cookies: "Cookies",
  privacy: "Privacy",
  terms: "Terms",
  safeguarding: "Safeguarding",
  login: "Login",
  "learner-login": "Learner Login",
  "instructor-login": "Instructor Login",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  "activate-account": "Activate Account",
  register: "Register",
};

interface BreadcrumbItem {
  label: string;
  href: Route;
  isCurrent: boolean;
}

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/") return [];

  const parts = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];
  let currentPath = "";

  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const isCurrent = index === parts.length - 1;

// Look up label from map, fallback to slug with dashes replaced
    let label = ROUTE_LABELS[part];
    if (!label) {
// For blog slugs and other dynamic routes, just use the slug with dashes as spaces
      label = part
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    items.push({
      label,
      href: currentPath as Route,
      isCurrent,
    });
  });

  return items;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const items = buildBreadcrumbs(pathname);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-white/10 bg-black"
    >
      <div className="mx-auto max-w-6xl px-6 py-3">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white transition-colors hover:text-zinc-300 font-medium"
            >
              <Home size={16} className="text-white" />
              <span className="sr-only">Home</span>
            </Link>
          </li>

          {items.map((item) => (
            <li key={item.href} className="flex items-center gap-2">
              <ChevronRight
                size={16}
                className="text-white"
                aria-hidden="true"
              />
              {item.isCurrent ? (
                <span
                  className="text-white font-bold"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-white transition-colors hover:text-white/80 font-medium"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
