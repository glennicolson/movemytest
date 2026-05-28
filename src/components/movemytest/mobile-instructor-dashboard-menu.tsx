"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, X, Activity, CalendarDays, Compass, GitCompare, HelpCircle, ListChecks, Mail, Map, Shield, UserRound, UsersRound } from "lucide-react";

const menuItems = [
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

export function MobileInstructorDashboardMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Instructor Portal</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Menu</p>
            <div className="mt-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href as `/${string}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                      isActive
                        ? "bg-blue-50 text-[var(--brand-strong)] ring-1 ring-[var(--brand)]/20"
                        : "text-slate-700 hover:bg-slate-50 hover:text-[var(--brand-strong)]"
                    )}
                  >
                    <item.icon className="h-4 w-4 text-[var(--brand)]" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--brand)]/30 transition hover:bg-[var(--brand-strong)] active:scale-95 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
        <span className="hidden sm:inline">Menu</span>
      </button>
    </>
  );
}
