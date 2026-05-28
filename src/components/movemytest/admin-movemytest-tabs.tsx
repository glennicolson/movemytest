"use client";

import { useState, useMemo, useCallback, type ReactNode } from "react";
import { AdminPillNav, type AdminTab } from "@/components/movemytest/admin-pill-nav";
import { AdminMoveMyTestOverview } from "@/components/movemytest/admin-movemytest-overview";
import { PopulatingSearch } from "@/components/movemytest/populating-search";
import { StatusPill } from "@/components/movemytest/status-pill";
import {
  AlertTriangle,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  EyeOff,
  GitCompare,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  UsersRound,
  UserRoundCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AdminTicketManagement } from "@/components/movemytest/admin-ticket-management";
import type {
  LearnerAccount,
  AdminListing,
  AdminMatch,
  AdminReport,
  AdminInstructor,
  AdminAuditLog,
  AdminEmail,
  AdminNote,
  AdminCentre,
} from "@/features/movemytest/admin-types";

// ---- helpers (mirror server-side formatting) ----

function safeDate(value?: Date | string | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateTime(value?: Date | string | null) {
  const d = safeDate(value);
  if (!d) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(d);
}

function formatDate(value?: Date | string | null) {
  const d = safeDate(value);
  if (!d) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Europe/London",
  }).format(d);
}

function humanise(value?: string | null) {
  return value ? value.toLowerCase().replaceAll("_", " ") : "not set";
}

function maskAdi(value?: string | null) {
  if (!value) return "Not provided";
  const normalized = value.trim().replace(/\s+/g, "").toUpperCase();
  if (normalized.length <= 4) return "••••";
  return `${normalized.slice(0, 2)}••••${normalized.slice(-2)}`;
}

function maskEmail(value?: string | null) {
  if (!value) return "Unknown";
  const [name, domain] = value.split("@");
  if (!domain) return value;
  return `${name.slice(0, 2)}•••@${domain}`;
}

function statusTone(status?: string | null) {
  if (!status) return "border-slate-200 bg-slate-50 text-slate-700";
  if (
    [
      "ACTIVE", "PROPOSED", "LEARNER_A_ACCEPTED", "LEARNER_B_ACCEPTED",
      "BOTH_ACCEPTED", "AVAILABLE", "CLAIMED", "SENT",
    ].includes(status)
  )
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (
    ["MATCHED", "BOOKING_REFERENCE_CONSENT_REQUESTED", "BOOKING_REFERENCE_SHARED", "PENDING"].includes(status)
  )
    return "border-blue-200 bg-blue-50 text-blue-800";
  if (["PAUSED", "NEEDS_DISCUSSION", "OPEN"].includes(status))
    return "border-amber-200 bg-amber-50 text-amber-800";
  if (["COMPLETED", "RESOLVED"].includes(status))
    return "border-slate-200 bg-slate-100 text-slate-800";
  return "border-red-200 bg-red-50 text-red-800";
}

// ---- sub-components ----

// sub-components for other tabs

function RiskTile({
  label,
  value,
  description,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  description: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const toneMap: Record<string, { border: string; bg: string; labelClass: string; valueClass: string }> = {
    neutral: { border: "border-slate-200", bg: "bg-white", labelClass: "text-slate-500", valueClass: "text-slate-950" },
    success: { border: "border-emerald-200", bg: "bg-emerald-50", labelClass: "text-emerald-600", valueClass: "text-emerald-900" },
    warning: { border: "border-amber-200", bg: "bg-amber-50", labelClass: "text-amber-600", valueClass: "text-amber-900" },
    danger: { border: "border-red-200", bg: "bg-red-50", labelClass: "text-red-600", valueClass: "text-red-900" },
    info: { border: "border-blue-200", bg: "bg-blue-50", labelClass: "text-blue-600", valueClass: "text-blue-900" },
  };
  const t = toneMap[tone] ?? toneMap.neutral;
  return (
    <div className={`rounded-2xl border ${t.border} ${t.bg} p-4`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${t.labelClass}`}>{label}</p>
      <p className={`mt-2 text-xl font-bold ${t.valueClass}`}>{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: number;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  icon: ReactNode;
}) {
  const toneMap: Record<string, { border: string; bg: string; labelClass: string; valueClass: string }> = {
    neutral: { border: "border-slate-200", bg: "bg-white", labelClass: "text-slate-500", valueClass: "text-slate-950" },
    success: { border: "border-emerald-200", bg: "bg-emerald-50", labelClass: "text-emerald-600", valueClass: "text-emerald-900" },
    warning: { border: "border-amber-200", bg: "bg-amber-50", labelClass: "text-amber-600", valueClass: "text-amber-900" },
    danger: { border: "border-red-200", bg: "bg-red-50", labelClass: "text-red-600", valueClass: "text-red-900" },
    info: { border: "border-blue-200", bg: "bg-blue-50", labelClass: "text-blue-600", valueClass: "text-blue-900" },
  };
  const t = toneMap[tone] ?? toneMap.neutral;
  return (
    <div className={`rounded-2xl border ${t.border} ${t.bg} p-4 shadow-sm`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${t.labelClass}`}>{label}</p>
        <span className={t.labelClass}>{icon}</span>
      </div>
      <p className={`mt-2 text-3xl font-bold ${t.valueClass}`}>{value}</p>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  severity = "neutral",
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  severity?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const severityMap: Record<string, { border: string; headerBg: string; titleClass: string }> = {
    neutral: { border: "border-slate-200", headerBg: "bg-white", titleClass: "text-slate-900" },
    success: { border: "border-emerald-200", headerBg: "bg-emerald-50", titleClass: "text-emerald-900" },
    warning: { border: "border-amber-200", headerBg: "bg-amber-50", titleClass: "text-amber-900" },
    danger: { border: "border-red-200", headerBg: "bg-red-50", titleClass: "text-red-900" },
    info: { border: "border-blue-200", headerBg: "bg-blue-50", titleClass: "text-blue-900" },
  };
  const s = severityMap[severity] ?? severityMap.neutral;
  return (
    <div className={`rounded-2xl border ${s.border} bg-white shadow-sm overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-3 px-5 py-4 ${s.headerBg} transition-colors hover:opacity-90`}
      >
        <h3 className={`text-sm font-semibold ${s.titleClass}`}>{title}</h3>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

function InfoTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{value}</p>
    </div>
  );
}

function humaniseAuditValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string") {
// Detect uppercase enum-like values and make them readable
    if (/^[A-Z][A-Z_]+$/.test(val)) {
      return val.toLowerCase().replaceAll("_", " ");
    }
    return val;
  }
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function humaniseAuditKey(key: string): string {
// Handle camelCase keys like "slotType" → "Slot Type"
  return key
    .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function AuditDetail({ detail }: { detail: unknown }) {
  if (!detail) return null;
  if (typeof detail === "object" && detail !== null && !Array.isArray(detail)) {
    const entries = Object.entries(detail as Record<string, unknown>);
    if (entries.length === 0) return null;
    return (
      <div className="mt-2 rounded-xl bg-white p-3 text-xs">
        {entries.map(([key, val]) => (
          <div key={key} className="flex gap-2 py-0.5">
            <span className="font-medium text-slate-500 min-w-[120px]">
              {humaniseAuditKey(key)}
            </span>
            <span className="text-slate-700 break-all">
              {humaniseAuditValue(val)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-2 max-h-24 overflow-auto rounded-xl bg-white p-3 text-xs text-slate-600">
      {typeof detail === "string" ? detail : JSON.stringify(detail, null, 2)}
    </div>
  );
}

// ---- main exported component ----

export function AdminMoveMyTestTabs({
  listingCounts,
  matchCounts,
  openReportCount,
  pendingEmailCount,
  learnerAccountCount,
  instructorAccountCount,
  learnerAccounts: rawLearners,
  listings: rawListings,
  matches: rawMatches,
  reports: rawReports,
  instructors: rawInstructors,
  auditLogs: rawAuditLogs,
  emailQueue: rawEmails,
  adminNotes: rawNotes,
  centres: rawCentres,
  sensitiveRefsHeld,
  activeInstructorDecisions,
  callWindowMatches,
  niDvaFlag,
}: {
  listingCounts: { status: string; _count: { _all: number } }[];
  matchCounts: { status: string; _count: { _all: number } }[];
  openReportCount: number;
  pendingEmailCount: number;
  learnerAccountCount: number;
  instructorAccountCount: number;
  learnerAccounts: LearnerAccount[];
  listings: AdminListing[];
  matches: AdminMatch[];
  reports: AdminReport[];
  instructors: AdminInstructor[];
  auditLogs: AdminAuditLog[];
  emailQueue: AdminEmail[];
  adminNotes: AdminNote[];
  centres: AdminCentre[];
  sensitiveRefsHeld: number;
  activeInstructorDecisions: number;
  callWindowMatches: number;
  niDvaFlag: string;
}) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const handleNavigateTab = useCallback((t: AdminTab) => setTab(t), []);

// search states
  const [learnerSearch, setLearnerSearch] = useState("");
  const [listingSearch, setListingSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [matchSearch, setMatchSearch] = useState("");

  const listingsTotal = listingCounts.reduce((sum, row) => sum + row._count._all, 0);
  const matchesTotal = matchCounts.reduce((sum, row) => sum + row._count._all, 0);
  const activeListings = listingCounts.find((r) => r.status === "ACTIVE")?._count._all ?? 0;
  const proposedMatches = matchCounts.find((r) => r.status === "PROPOSED")?._count._all ?? 0;
  const sentEmails = rawEmails.filter((email) => email.status === "SENT");
  const pendingEmails = rawEmails.filter((email) => email.status === "PENDING");
  const failedEmails = rawEmails.filter((email) => email.status === "FAILED");

// filtered data
  const filteredLearners = useMemo(() => {
    if (!learnerSearch) return rawLearners;
    const q = learnerSearch.toLowerCase();
    return rawLearners.filter(
      (l) =>
        l.email?.toLowerCase().includes(q) ||
        l.mobileNumber?.includes(q) ||
        l.listings?.some((li) => li.currentCentre?.name?.toLowerCase().includes(q)),
    );
  }, [rawLearners, learnerSearch]);

  const filteredListings = useMemo(() => {
    if (!listingSearch) return rawListings;
    const q = listingSearch.toLowerCase();
    return rawListings.filter(
      (l) =>
        (l.movemytestAccount?.email ?? l.user?.email)?.toLowerCase().includes(q) ||
        l.currentCentre?.name?.toLowerCase().includes(q) ||
        l.status?.toLowerCase().includes(q),
    );
  }, [rawListings, listingSearch]);

  const filteredInstructors = useMemo(() => {
    if (!instructorSearch) return rawInstructors;
    const q = instructorSearch.toLowerCase();
    return rawInstructors.filter(
      (i) =>
        `${i.firstName} ${i.lastName}`.toLowerCase().includes(q) ||
        i.adiNumber?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q),
    );
  }, [rawInstructors, instructorSearch]);

  const filteredMatches = useMemo(() => {
    if (!matchSearch) return rawMatches;
    const q = matchSearch.toLowerCase();
    return rawMatches.filter(
      (m) =>
        m.listingA?.currentCentre?.name?.toLowerCase().includes(q) ||
        m.listingB?.currentCentre?.name?.toLowerCase().includes(q) ||
        m.listingA?.movemytestAccount?.email?.toLowerCase().includes(q) ||
        m.listingB?.movemytestAccount?.email?.toLowerCase().includes(q) ||
        m.status?.toLowerCase().includes(q),
    );
  }, [rawMatches, matchSearch]);

  return (
    <div className="space-y-6">
      <AdminPillNav active={tab} onChange={setTab} />

      {/* ---- DASHBOARD// OVERVIEW ---- */}
      {tab === "dashboard" && (
        <AdminMoveMyTestOverview
          learnerAccountCount={learnerAccountCount}
          instructorAccountCount={instructorAccountCount}
          listingsTotal={listingsTotal}
          activeListings={activeListings}
          matchesTotal={matchesTotal}
          callWindowMatches={callWindowMatches}
          openReportCount={openReportCount}
          pendingEmailCount={pendingEmailCount}
          failedEmailCount={failedEmails.length}
          proposedMatches={proposedMatches}
          unassignedInstructorDecisions={activeInstructorDecisions}
          sensitiveRefsHeld={sensitiveRefsHeld}
          reports={rawReports}
          emailQueue={rawEmails}
          matches={rawMatches}
          adminNotes={rawNotes}
          onNavigateTab={handleNavigateTab}
        />
      )}

      {/* ---- EMAIL OPERATIONS ---- */}
      {tab === "email-log" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Emails" value={rawEmails.length} tone="neutral" icon={<Mail className="h-5 w-5" />} />
            <SummaryCard label="Sent" value={sentEmails.length} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
            <SummaryCard label="Pending" value={pendingEmails.length} tone={pendingEmails.length > 10 ? "warning" : "neutral"} icon={<Clock className="h-5 w-5" />} />
            <SummaryCard label="Failed" value={failedEmails.length} tone={failedEmails.length > 0 ? "danger" : "success"} icon={<XCircle className="h-5 w-5" />} />
          </div>

          {/* Failed Emails Section */}
          {failedEmails.length > 0 && (
            <CollapsibleSection title={`Failed Emails (${failedEmails.length})`} defaultOpen={true} severity="danger">
              <div className="space-y-3">
                {failedEmails.map((email) => (
                  <article key={email.id} className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-red-950">{humanise(email.kind)}</h3>
                        <p className="mt-1 text-red-800">{maskEmail(email.recipient)} · {humanise(email.recipientRole)}</p>
                      </div>
                      <StatusPill status={email.status} />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-red-700 sm:grid-cols-2 xl:grid-cols-4">
                      <p>Scheduled: <span className="font-semibold text-red-900">{formatDateTime(email.scheduledFor)}</span></p>
                      <p>Retries: <span className="font-semibold text-red-900">{email.retryCount}/{email.maxRetries}</span></p>
                      <p>Updated: <span className="font-semibold text-red-900">{formatDateTime(email.updatedAt)}</span></p>
                    </div>
                    <p className="mt-3 rounded-xl border border-red-200 bg-white p-3 text-xs text-red-700">{email.error}</p>
                  </article>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Pending Emails Section */}
          {pendingEmails.length > 0 && (
            <CollapsibleSection title={`Pending Emails (${pendingEmails.length})`} defaultOpen={pendingEmails.length <= 5} severity="info">
              <div className="space-y-3">
                {pendingEmails.map((email) => (
                  <article key={email.id} className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-blue-950">{humanise(email.kind)}</h3>
                        <p className="mt-1 text-blue-800">{maskEmail(email.recipient)} · {humanise(email.recipientRole)}</p>
                      </div>
                      <StatusPill status={email.status} />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-blue-700 sm:grid-cols-2 xl:grid-cols-4">
                      <p>Scheduled: <span className="font-semibold text-blue-900">{formatDateTime(email.scheduledFor)}</span></p>
                      <p>Retries: <span className="font-semibold text-blue-900">{email.retryCount}/{email.maxRetries}</span></p>
                      <p>Updated: <span className="font-semibold text-blue-900">{formatDateTime(email.updatedAt)}</span></p>
                    </div>
                  </article>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Sent Emails Section */}
          {sentEmails.length > 0 && (
            <CollapsibleSection title={`Sent Emails (${sentEmails.length})`} defaultOpen={false} severity="success">
              <div className="space-y-3">
                {sentEmails.map((email) => (
                  <article key={email.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-emerald-950">{humanise(email.kind)}</h3>
                        <p className="mt-1 text-emerald-800">{maskEmail(email.recipient)} · {humanise(email.recipientRole)}</p>
                      </div>
                      <StatusPill status={email.status} />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-emerald-700 sm:grid-cols-2 xl:grid-cols-4">
                      <p>Sent: <span className="font-semibold text-emerald-900">{formatDateTime(email.sentAt)}</span></p>
                      <p>Scheduled: <span className="font-semibold text-emerald-900">{formatDateTime(email.scheduledFor)}</span></p>
                    </div>
                  </article>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {rawEmails.length === 0 && (
            <EmptyState message="No MoveMyTest emails have been queued yet." />
          )}
        </div>
      )}

      {/* ---- SUPPORT CENTRE ---- */}
      {tab === "support-centre" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Tickets" value={rawReports.length} tone="neutral" icon={<MessageSquare className="h-5 w-5" />} />
            <SummaryCard label="Open" value={openReportCount} tone={openReportCount > 0 ? "warning" : "success"} icon={<AlertTriangle className="h-5 w-5" />} />
            <SummaryCard label="In Progress" value={rawReports.filter((r) => r.status === "IN_PROGRESS").length} tone="info" icon={<Clock className="h-5 w-5" />} />
            <SummaryCard label="Resolved" value={rawReports.filter((r) => r.status === "RESOLVED").length} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
          </div>

          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Support command centre</CardTitle>
                <CardDescription>Manage learner support tickets, reply, update status, and close resolved issues.</CardDescription>
              </div>
              <StatusPill status={openReportCount ? "OPEN" : "RESOLVED"} />
            </div>
            <div className="mt-5">
              <AdminTicketManagement reports={rawReports as unknown as Parameters<typeof AdminTicketManagement>[0]["reports"]} />
            </div>
          </Card>
        </div>
      )}

      {/* ---- PRIVACY & RISK WATCH ---- */}
      {tab === "privacy-watch" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Encrypted Refs" value={sensitiveRefsHeld} tone={sensitiveRefsHeld > 0 ? "warning" : "success"} icon={<ShieldCheck className="h-5 w-5" />} />
            <SummaryCard label="Instructor Decisions" value={activeInstructorDecisions} tone={activeInstructorDecisions > 0 ? "warning" : "success"} icon={<UserRoundCheck className="h-5 w-5" />} />
            <SummaryCard label="Call Windows" value={callWindowMatches} tone={callWindowMatches > 0 ? "warning" : "success"} icon={<Phone className="h-5 w-5" />} />
            <SummaryCard label="NI/DVA Flag" value={niDvaFlag === "Enabled" ? 1 : 0} tone={niDvaFlag === "Enabled" ? "info" : "neutral"} icon={<ShieldCheck className="h-5 w-5" />} />
          </div>

          <CollapsibleSection title="Privacy Checks" defaultOpen={true} severity="neutral">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <RiskTile label="Encrypted booking refs held" value={sensitiveRefsHeld} description="Count only — values remain hidden." tone={sensitiveRefsHeld > 0 ? "warning" : "success"} />
              <RiskTile label="Instructor decisions" value={activeInstructorDecisions} description="Latest decision records loaded on recent listings." tone={activeInstructorDecisions > 0 ? "warning" : "success"} />
              <RiskTile label="Active DVSA call windows" value={callWindowMatches} description="Learners may need immediate support." tone={callWindowMatches > 0 ? "warning" : "success"} />
              <RiskTile label="NI/DVA live swap flag" value={niDvaFlag} description="Feature flag state." tone="info" />
            </div>
          </CollapsibleSection>

          {sensitiveRefsHeld > 0 && (
            <CollapsibleSection title={`Encrypted References (${sensitiveRefsHeld})`} defaultOpen={true} severity="warning">
              <p className="text-sm text-slate-600">
                There are {sensitiveRefsHeld} encrypted booking references currently held in the system. These are never decrypted in the admin portal.
              </p>
            </CollapsibleSection>
          )}
        </div>
      )}

      {/* ---- LEARNER ACCOUNTS ---- */}
      {tab === "learner-accounts" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Learners" value={rawLearners.length} tone="neutral" icon={<UsersRound className="h-5 w-5" />} />
            <SummaryCard label="CRM Linked" value={rawLearners.filter((l) => l.crmUserId).length} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
            <SummaryCard label="Standalone" value={rawLearners.filter((l) => !l.crmUserId).length} tone="info" icon={<UserX className="h-5 w-5" />} />
            <SummaryCard label="With Listings" value={rawLearners.filter((l) => (l.listings?.length ?? 0) > 0).length} tone="neutral" icon={<BookOpenCheck className="h-5 w-5" />} />
          </div>

          <CollapsibleSection title="Search & Filter" defaultOpen={true} severity="neutral">
            <PopulatingSearch value={learnerSearch} onChange={setLearnerSearch} placeholder="Search by email, mobile, or centre…" />
          </CollapsibleSection>

          <CollapsibleSection title={`Learner Directory (${filteredLearners.length})`} defaultOpen={true} severity="neutral">
            <div className="grid gap-4 xl:grid-cols-3">
              {filteredLearners.map((learner) => {
                const activeListing = learner.listings?.find((l) => ["ACTIVE", "MATCHED", "PAUSED"].includes(l.status));
                const activeSecrets = (learner.bookingReferenceSecrets ?? []).filter((s) => !s.deletedAt);
                const crmLearner = learner.crmUser?.learnerProfile;
                return (
                  <article key={learner.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">{maskEmail(learner.email)}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {learner.mobileNumber ?? "No mobile"} · joined {formatDate(learner.createdAt)}
                        </p>
                      </div>
                      <StatusPill status={learner.status} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <RiskTile label="Listings" value={(learner.listings ?? []).length} description={activeListing ? `${humanise(activeListing.status)} at ${activeListing.currentCentre?.name}` : "No active listing"} />
                      <RiskTile label="Reports" value={(learner.reports ?? []).length} description={(learner.reports ?? [])[0] ? `Latest ${humanise((learner.reports ?? [])[0].status)}` : "No reports"} />
                      <RiskTile label="Booking refs" value={activeSecrets.length} description="Encrypted metadata only" />
                    </div>
                    <div className="mt-3 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                      <p>CRM: <span className="font-semibold text-slate-900">{learner.crmUserId ? `Linked · ${crmLearner?.assignedInstructor ? `${crmLearner.assignedInstructor.user.firstName} ${crmLearner.assignedInstructor.user.lastName}` : "No instructor"}` : "Standalone"}</span></p>
                      <p>Setup: <span className="font-semibold text-slate-900">{learner.accountSetupCompletedAt ? formatDate(learner.accountSetupCompletedAt) : "Incomplete"}</span></p>
                      <p>Last login: <span className="font-semibold text-slate-900">{learner.lastLoginAt ? formatDate(learner.lastLoginAt) : "Never"}</span></p>
                      <p>Mobile consent: <span className="font-semibold text-slate-900">{learner.mobileContactConsentAt ? "Yes" : "No"}</span></p>
                    </div>
                  </article>
                );
              })}
              {filteredLearners.length === 0 && (
                <EmptyState message="No learners match your search." />
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* ---- LEARNER LISTINGS ---- */}
      {tab === "learner-listings" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Listings" value={rawListings.length} tone="neutral" icon={<BookOpenCheck className="h-5 w-5" />} />
            <SummaryCard label="Active" value={rawListings.filter((l) => l.status === "ACTIVE").length} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
            <SummaryCard label="Paused" value={rawListings.filter((l) => l.status === "PAUSED").length} tone="warning" icon={<Clock className="h-5 w-5" />} />
            <SummaryCard label="Matched" value={rawListings.filter((l) => l.status === "MATCHED").length} tone="info" icon={<GitCompare className="h-5 w-5" />} />
          </div>

          <CollapsibleSection title="Search & Filter" defaultOpen={true} severity="neutral">
            <PopulatingSearch value={listingSearch} onChange={setListingSearch} placeholder="Search by email, centre, or status…" />
          </CollapsibleSection>

          <CollapsibleSection title={`Listings (${filteredListings.length})`} defaultOpen={true} severity="neutral">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-[0.14em] text-slate-500">
                    <th className="py-3">Learner</th>
                    <th>Current test</th>
                    <th>Desired window</th>
                    <th>Instructor</th>
                    <th>Availability</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((listing) => {
                    const instructor = listing.instructorDetails;
                    const currentDecision = instructor?.availabilityDecisions?.find(
                      (d) => d.slotType === "CURRENT_TEST" && !d.matchId,
                    );
                    return (
                      <tr key={listing.id} className="border-b align-top last:border-0">
                        <td className="py-4">
                          <p className="font-semibold text-slate-950">
                            {maskEmail(listing.movemytestAccount?.email ?? listing.user?.email)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {listing.movemytestAccount?.mobileNumber ?? "No mobile"}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-600">
                            {listing.movemytestAccount?.crmUserId || listing.userId
                              ? "DTC CRM-linked"
                              : "Standalone MoveMyTest"}
                          </p>
                        </td>
                        <td>
                          <p className="font-medium text-slate-900">{listing.currentCentre?.name}</p>
                          <p className="text-xs text-slate-600">{formatDateTime(listing.currentDateTime)}</p>
                        </td>
                        <td>
                          <p>{humanise(listing.desiredDirection)}</p>
                          <p className="text-xs text-slate-600">
                            {formatDate(listing.desiredDateFrom)} → {formatDate(listing.desiredDateTo)}
                          </p>
                        </td>
                        <td>
                          {instructor ? (
                            <>
                              <p className="font-medium text-slate-900">
                                {instructor.firstName} {instructor.lastName}
                              </p>
                              <p className="text-xs text-slate-600">
                                ADI {maskAdi(instructor.adiNumber)} ·{" "}
                                {instructor.instructorAccount ? "registered" : "invited/manual"}
                              </p>
                            </>
                          ) : (
                            <span className="text-slate-500">No instructor linked</span>
                          )}
                        </td>
                        <td>
                          {currentDecision ? (
                            <>
                              <StatusPill status={currentDecision.status} />
                              <p className="mt-1 text-xs text-slate-500">
                                {formatDateTime(currentDecision.decidedAt)}
                              </p>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500">No current-slot decision</span>
                          )}
                        </td>
                        <td>
                          <StatusPill status={listing.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredListings.length === 0 && (
                <EmptyState message="No listings match your search." />
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* ---- INDEPENDENT INSTRUCTORS ---- */}
      {tab === "independent-instructors" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Instructors" value={rawInstructors.length} tone="neutral" icon={<UserRoundCheck className="h-5 w-5" />} />
            <SummaryCard label="CRM Linked" value={rawInstructors.filter((i) => i.crmInstructorProfile).length} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
            <SummaryCard label="Standalone" value={rawInstructors.filter((i) => !i.crmInstructorProfile).length} tone="info" icon={<UserX className="h-5 w-5" />} />
            <SummaryCard label="Active Links" value={rawInstructors.reduce((sum, i) => sum + (i.listingLinks?.length ?? 0), 0)} tone="neutral" icon={<UsersRound className="h-5 w-5" />} />
          </div>

          <CollapsibleSection title="Search & Filter" defaultOpen={true} severity="neutral">
            <PopulatingSearch value={instructorSearch} onChange={setInstructorSearch} placeholder="Search by name, ADI, or email…" />
          </CollapsibleSection>

          <CollapsibleSection title={`Instructor Directory (${filteredInstructors.length})`} defaultOpen={true} severity="neutral">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredInstructors.map((instructor) => (
                <article key={instructor.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-950">
                        {instructor.firstName} {instructor.lastName}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        ADI {maskAdi(instructor.adiNumber)}
                      </p>
                    </div>
                    <StatusPill status={instructor.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600 truncate">
                    {maskEmail(instructor.email)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-white px-2 py-0.5 border">
                      {instructor.listingLinks?.length ?? 0} learners
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 border">
                      Last login: {instructor.lastLoginAt ? formatDate(instructor.lastLoginAt) : "Never"}
                    </span>
                  </div>
                  {instructor.crmInstructorProfile ? (
                    <p className="mt-1.5 text-xs font-semibold text-slate-500">
                      DTC CRM-linked
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-500">Standalone</p>
                  )}
                </article>
              ))}
              {filteredInstructors.length === 0 && (
                <EmptyState message="No instructors match your search." />
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* ---- MATCHES & DVSA CALL STATE ---- */}
      {tab === "matches-call-state" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Matches" value={rawMatches.length} tone="neutral" icon={<GitCompare className="h-5 w-5" />} />
            <SummaryCard label="Proposed" value={rawMatches.filter((m) => m.status === "PROPOSED").length} tone="info" icon={<Clock className="h-5 w-5" />} />
            <SummaryCard label="Call Windows" value={callWindowMatches} tone={callWindowMatches > 0 ? "warning" : "success"} icon={<Phone className="h-5 w-5" />} />
            <SummaryCard label="Completed" value={rawMatches.filter((m) => m.status === "COMPLETED").length} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
          </div>

          <CollapsibleSection title="Search & Filter" defaultOpen={true} severity="neutral">
            <PopulatingSearch value={matchSearch} onChange={setMatchSearch} placeholder="Search by centre, email, or status…" />
          </CollapsibleSection>

          <CollapsibleSection title={`Matches (${filteredMatches.length})`} defaultOpen={true} severity="neutral">
            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <article key={match.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {match.listingA?.currentCentre?.name} ↔ {match.listingB?.currentCentre?.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Score {match.score}/100 · updated {formatDateTime(match.updatedAt)}
                      </p>
                    </div>
                    <StatusPill status={match.status} />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <InfoTile
                      label="Learner A"
                      value={`${maskEmail(match.listingA?.movemytestAccount?.email)} · ${formatDateTime(match.listingA?.currentDateTime)}`}
                    />
                    <InfoTile
                      label="Learner B"
                      value={`${maskEmail(match.listingB?.movemytestAccount?.email)} · ${formatDateTime(match.listingB?.currentDateTime)}`}
                    />
                    <InfoTile
                      label="Call window"
                      value={match.callWindowExpiresAt ? `Expires ${formatDateTime(match.callWindowExpiresAt)}` : "Not active"}
                    />
                    <InfoTile
                      label="Booking refs"
                      value={`${(match.secrets ?? []).filter((s) => !s.deletedAt).length} encrypted ref(s)`}
                      icon={<EyeOff className="h-4 w-4" />}
                    />
                  </div>
                  {(match.instructorAvailabilityDecisions ?? []).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(match.instructorAvailabilityDecisions ?? []).map((d) => (
                        <span
                          key={d.id}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(d.status)}`}
                        >
                          {d.instructorAccount
                            ? `${d.instructorAccount.firstName} ${d.instructorAccount.lastName}`
                            : "Instructor"}
                          : {humanise(d.status)}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
              {filteredMatches.length === 0 && (
                <EmptyState message="No matches match your search." />
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* ---- AUDIT TRAIL ---- */}
      {tab === "audit-trail" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Entries" value={rawAuditLogs.length} tone="neutral" icon={<ShieldCheck className="h-5 w-5" />} />
            <SummaryCard label="Instructor Actions" value={rawAuditLogs.filter((l) => l.instructorAccount).length} tone="info" icon={<UserRoundCheck className="h-5 w-5" />} />
            <SummaryCard label="Learner Links" value={rawAuditLogs.filter((l) => l.listingInstructor?.listing).length} tone="info" icon={<UsersRound className="h-5 w-5" />} />
            <SummaryCard label="Today" value={rawAuditLogs.filter((l) => {
              const d = new Date(l.createdAt);
              const today = new Date();
              return d.toDateString() === today.toDateString();
            }).length} tone="neutral" icon={<CalendarClock className="h-5 w-5" />} />
          </div>

          <CollapsibleSection title={`Audit Log (${rawAuditLogs.length} entries)`} defaultOpen={true} severity="neutral">
            <div className="space-y-3">
              {rawAuditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="font-semibold text-slate-950">{humanise(log.action)}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
                  </div>
                  <p className="mt-1 text-slate-600">
                    {log.instructorAccount
                      ? `${log.instructorAccount.firstName} ${log.instructorAccount.lastName} · ADI ${maskAdi(log.instructorAccount.adiNumber)}`
                      : "Instructor account unavailable"}
                  </p>
                  {log.listingInstructor?.listing ? (
                    <p className="mt-1 text-slate-600">
                      Learner {maskEmail(log.listingInstructor.listing.movemytestAccount?.email)} ·{" "}
                      {log.listingInstructor.listing.currentCentre?.name}
                    </p>
                  ) : null}
                  <AuditDetail detail={log.detail} />
                </div>
              ))}
              {rawAuditLogs.length === 0 && (
                <EmptyState message="No audit entries found." />
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* ---- CENTRE FRESHNESS ---- */}
      {tab === "centre-freshness" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Centres" value={rawCentres.length} tone="neutral" icon={<MapPin className="h-5 w-5" />} />
            <SummaryCard
              label="Fresh (<7 days)"
              value={rawCentres.filter((c) => {
                if (!c.sourceLastCheckedAt) return false;
                const days = (Date.now() - new Date(c.sourceLastCheckedAt).getTime()) / (1000 * 60 * 60 * 24);
                return days < 7;
              }).length}
              tone="success"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <SummaryCard
              label="Stale (>=7 days)"
              value={rawCentres.filter((c) => {
                if (!c.sourceLastCheckedAt) return true;
                const days = (Date.now() - new Date(c.sourceLastCheckedAt).getTime()) / (1000 * 60 * 60 * 24);
                return days >= 7;
              }).length}
              tone="warning"
              icon={<Clock className="h-5 w-5" />}
            />
            <SummaryCard label="Unchecked" value={rawCentres.filter((c) => !c.sourceLastCheckedAt).length} tone="danger" icon={<AlertTriangle className="h-5 w-5" />} />
          </div>

          <CollapsibleSection title={`Centre Directory (${rawCentres.length})`} defaultOpen={true} severity="neutral">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {rawCentres.map((centre) => {
                const isFresh = centre.sourceLastCheckedAt
                  ? (Date.now() - new Date(centre.sourceLastCheckedAt).getTime()) / (1000 * 60 * 60 * 24) < 7
                  : false;
                return (
                  <InfoTile
                    key={centre.id}
                    label={"Centre"}
                    value={`${centre.name} · checked ${formatDate(centre.sourceLastCheckedAt)}`}
                    icon={isFresh ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                  />
                );
              })}
            </div>
            {rawCentres.length === 0 && (
              <EmptyState message="No centre data loaded." />
            )}
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
