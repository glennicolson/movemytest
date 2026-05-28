"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, CalendarDays, Compass, GitCompare, HelpCircle, ListChecks, Mail, Map, Shield, UserRound, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const instructorMenu: NavItem[] = [
  { href: "/instructor/dashboard", label: "Overview", icon: Activity, exact: true },
  { href: "/instructor/dashboard/movemytest", label: "MoveMyTest", icon: GitCompare },
  { href: "/instructor/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/instructor/dashboard/action-centre", label: "Action Centre", icon: ListChecks },
  { href: "/instructor/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/instructor/dashboard/linked-learners", label: "Linked Learners", icon: UsersRound },
  { href: "/instructor/dashboard/invite", label: "Invite Learners", icon: Mail },
  { href: "/instructor/dashboard/learner-journey", label: "Learner Journey", icon: Compass },
  { href: "/instructor/dashboard/instructor-journey", label: "Instructor Journey", icon: Map },
  { href: "/instructor/dashboard/security", label: "Security", icon: Shield },
  { href: "/instructor/dashboard/help", label: "Help", icon: HelpCircle },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href as `/${string}`}
      className={cn(
        "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-blue-50 text-[var(--brand-strong)] ring-1 ring-[var(--brand)]/20"
          : "text-slate-700 hover:bg-white hover:text-[var(--brand-strong)]",
      )}
    >
      <item.icon className="h-4 w-4 text-[var(--brand)]" />
      {item.label}
    </Link>
  );
}

export function InstructorDashboardSidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav aria-label="Instructor MoveMyTest dashboard">
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Instructor MoveMyTest</p>
      <div className="mt-3 space-y-1">
        {instructorMenu.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href, item.exact)} />
        ))}
      </div>
    </nav>
  );
}
