"use client";

import { cn } from "@/lib/utils";

export type AdminTab =
  | "dashboard"
  | "support-centre"
  | "email-log"
  | "matches-call-state"
  | "learner-accounts"
  | "learner-listings"
  | "independent-instructors"
  | "privacy-watch"
  | "audit-trail"
  | "centre-freshness";

const TABS: { id: AdminTab; label: string; badge?: string }[] = [
  { id: "dashboard", label: "Overview" },
  { id: "support-centre", label: "Support Centre" },
  { id: "email-log", label: "Email Operations" },
  { id: "learner-accounts", label: "Learner Accounts" },
  { id: "learner-listings", label: "Learner Listings" },
  { id: "matches-call-state", label: "Matches & DVSA Calls" },
  { id: "independent-instructors", label: "Instructors" },
  { id: "privacy-watch", label: "Privacy & Risk" },
  { id: "audit-trail", label: "Audit Trail" },
  { id: "centre-freshness", label: "Centre Freshness" },
];

export function AdminPillNav({
  active,
  onChange,
}: {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
}) {
  return (
    <nav className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            active === tab.id
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900",
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
