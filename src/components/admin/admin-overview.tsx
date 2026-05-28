"use client";

import {
  UsersRound,
  UserRoundCheck,
  BookOpenCheck,
  GitCompare,
  AlertTriangle,
  Mail,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AdminDashboardData } from "./types";

function MetricCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  icon: React.ReactNode;
}) {
  const toneMap = {
    neutral: "border-slate-200 bg-white",
    success: "border-emerald-200 bg-emerald-50",
    warning: "border-amber-200 bg-amber-50",
    danger: "border-red-200 bg-red-50",
    info: "border-blue-200 bg-blue-50",
  };
  const textMap = {
    neutral: "text-slate-900",
    success: "text-emerald-900",
    warning: "text-amber-900",
    danger: "text-red-900",
    info: "text-blue-900",
  };

  return (
    <Card className={toneMap[tone]}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${textMap[tone]}`}>{value}</p>
        </div>
        <div className="text-slate-400">{icon}</div>
      </div>
    </Card>
  );
}

export function AdminOverview({
  data,
  onNavigateTab,
}: {
  data: AdminDashboardData;
  onNavigateTab: (tab: string) => void;
}) {
  const activeListings =
    data.listingCounts.find((r) => r.status === "ACTIVE")?._count._all ?? 0;
  const proposedMatches =
    data.matchCounts.find((r) => r.status === "PROPOSED")?._count._all ?? 0;
  const completedMatches =
    data.matchCounts.find((r) => r.status === "COMPLETED")?._count._all ?? 0;

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Learners"
          value={data.learnerAccountCount}
          tone="neutral"
          icon={<UsersRound className="h-6 w-6" />}
        />
        <MetricCard
          label="Active Listings"
          value={activeListings}
          tone={activeListings > 0 ? "success" : "neutral"}
          icon={<BookOpenCheck className="h-6 w-6" />}
        />
        <MetricCard
          label="Proposed Matches"
          value={proposedMatches}
          tone={proposedMatches > 0 ? "info" : "neutral"}
          icon={<GitCompare className="h-6 w-6" />}
        />
        <MetricCard
          label="Instructors"
          value={data.instructorAccountCount}
          tone="neutral"
          icon={<UserRoundCheck className="h-6 w-6" />}
        />

        <MetricCard
          label="Open Reports"
          value={data.openReportCount}
          tone={data.openReportCount > 0 ? "warning" : "success"}
          icon={<AlertTriangle className="h-6 w-6" />}
        />
        <MetricCard
          label="Pending Emails"
          value={data.pendingEmailCount}
          tone={data.pendingEmailCount > 10 ? "warning" : "neutral"}
          icon={<Mail className="h-6 w-6" />}
        />
        <MetricCard
          label="Completed Swaps"
          value={completedMatches}
          tone={completedMatches > 0 ? "success" : "neutral"}
          icon={<CheckCircle2 className="h-6 w-6" />}
        />
        <MetricCard
          label="Total Matches"
          value={data.matches.length}
          tone="neutral"
          icon={<Clock className="h-6 w-6" />}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => onNavigateTab("support")}
          className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-400 hover:shadow-md"
        >
          <h3 className="font-semibold text-slate-900">Support Centre</h3>
          <p className="mt-1 text-sm text-slate-600">
            {data.openReportCount} open ticket{data.openReportCount !== 1 ? "s" : ""} need
            attention
          </p>
        </button>

        <button
          onClick={() => onNavigateTab("emails")}
          className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md"
        >
          <h3 className="font-semibold text-slate-900">Email Queue</h3>
          <p className="mt-1 text-sm text-slate-600">
            {data.pendingEmailCount} email{data.pendingEmailCount !== 1 ? "s" : ""} pending
            delivery
          </p>
        </button>

        <button
          onClick={() => onNavigateTab("matches")}
          className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md"
        >
          <h3 className="font-semibold text-slate-900">Active Matches</h3>
          <p className="mt-1 text-sm text-slate-600">
            {proposedMatches} proposed match{proposedMatches !== 1 ? "es" : ""} waiting for
            acceptance
          </p>
        </button>
      </div>
    </div>
  );
}
