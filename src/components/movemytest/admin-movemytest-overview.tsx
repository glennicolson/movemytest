"use client";

import { useMemo, useCallback } from "react";
import {
  UsersRound,
  UserRoundCheck,
  BookOpenCheck,
  CalendarClock,
  AlertTriangle,
  Mail,
  PhoneCall,
  UserX,
  TrendingUp,
  LifeBuoy,
  MailWarning,
  GitCompare,
  ShieldCheck,
} from "lucide-react";
import { AdminMetricCard } from "./admin-metric-card";
import { UrgentAttentionBanner, type UrgentItem } from "./urgent-attention-banner";
import { OperationalFeed, type FeedItem } from "./operational-feed";
import { QuickActionCard } from "./quick-action-card";
import type {
  AdminEmail,
  AdminReport,
  AdminMatch,
  AdminNote,
} from "@/features/movemytest/admin-types";
import type { AdminTab } from "./admin-pill-nav";

export interface AdminMoveMyTestOverviewProps {
// KPI data
  learnerAccountCount: number;
  instructorAccountCount: number;
  listingsTotal: number;
  activeListings: number;
  matchesTotal: number;
  callWindowMatches: number;
  openReportCount: number;
  pendingEmailCount: number;
  failedEmailCount: number;
  proposedMatches: number;
  unassignedInstructorDecisions: number;
  sensitiveRefsHeld: number;
// Raw arrays for deriving insights
  reports: AdminReport[];
  emailQueue: AdminEmail[];
  matches: AdminMatch[];
  adminNotes: AdminNote[];
// Callback to switch tabs
  onNavigateTab: (tab: AdminTab) => void;
}

export function AdminMoveMyTestOverview({
  learnerAccountCount,
  instructorAccountCount,
  listingsTotal,
  activeListings,
  matchesTotal,
  callWindowMatches,
  openReportCount,
  pendingEmailCount,
  failedEmailCount,
  proposedMatches,
  unassignedInstructorDecisions,
  sensitiveRefsHeld,
  reports,
  emailQueue,
  matches,
  adminNotes,
  onNavigateTab,
}: AdminMoveMyTestOverviewProps) {
// ── Urgent attention items ──
  const urgentItems: UrgentItem[] = useMemo(() => {
    const items: UrgentItem[] = [];

    if (failedEmailCount > 0) {
      items.push({
        id: "failed-emails",
        message: `${failedEmailCount} email${failedEmailCount !== 1 ? "s" : ""} failed to deliver. Delivery issues may block learner notifications.`,
        severity: "urgent",
        actionLabel: "View email log →",
        actionOnClick: () => onNavigateTab("email-log"),
      });
    }

    if (openReportCount > 0) {
      const severity = openReportCount >= 5 ? "urgent" : "warning";
      items.push({
        id: "open-reports",
        message: `${openReportCount} support ticket${openReportCount !== 1 ? "s" : ""} awaiting response.`,
        severity,
        actionLabel: "Go to Support Centre →",
        actionOnClick: () => onNavigateTab("support-centre"),
      });
    }

    if (callWindowMatches > 0) {
      items.push({
        id: "call-windows",
        message: `${callWindowMatches} match${callWindowMatches !== 1 ? "es" : ""} in DVSA call window. Learners may need immediate guidance.`,
        severity: "warning",
        actionLabel: "View matches →",
        actionOnClick: () => onNavigateTab("matches-call-state"),
      });
    }

    if (unassignedInstructorDecisions > 0) {
      items.push({
        id: "instructor-decisions",
        message: `${unassignedInstructorDecisions} listing${unassignedInstructorDecisions !== 1 ? "s" : ""} awaiting instructor availability confirmation.`,
        severity: "warning",
        actionLabel: "View listings →",
        actionOnClick: () => onNavigateTab("learner-listings"),
      });
    }

    if (pendingEmailCount > 10) {
      items.push({
        id: "pending-emails",
        message: `${pendingEmailCount} emails in the queue — above normal threshold.`,
        severity: "warning",
        actionLabel: "View queue →",
        actionOnClick: () => onNavigateTab("email-log"),
      });
    }

    return items;
  }, [
    failedEmailCount,
    openReportCount,
    callWindowMatches,
    unassignedInstructorDecisions,
    pendingEmailCount,
    onNavigateTab,
  ]);

// ── Operational feed items ──
  const feedItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];

// Recent admin notes
    adminNotes.slice(0, 3).forEach((note) => {
      items.push({
        id: `note-${note.id}`,
        message: `Admin note on ${note.entityType.toLowerCase()}: ${note.note.slice(0, 100)}${note.note.length > 100 ? "…" : ""}`,
        severity: "info",
        timestamp: formatDateTime(note.createdAt),
      });
    });

// Failed emails
    emailQueue
      .filter((e) => e.status === "FAILED")
      .slice(0, 3)
      .forEach((email) => {
        items.push({
          id: `email-fail-${email.id}`,
          message: `Email to ${email.recipient} failed: ${email.error || "Unknown error"}`,
          severity: "error",
          timestamp: formatDateTime(email.updatedAt),
        });
      });

// Sent emails
    emailQueue
      .filter((e) => e.status === "SENT")
      .slice(0, 2)
      .forEach((email) => {
        items.push({
          id: `email-sent-${email.id}`,
          message: `${email.kind} email sent to ${email.recipient}`,
          severity: "success",
          timestamp: formatDateTime(email.sentAt || email.updatedAt),
        });
      });

// Recent reports
    reports
      .filter((r) => r.status === "OPEN")
      .slice(0, 2)
      .forEach((report) => {
        items.push({
          id: `report-${report.id}`,
          message: `Support ticket: ${report.reason} — ${report.reporter?.email || report.reporterMoveMyTestAccount?.email || "Unknown reporter"}`,
          severity: "warning",
          timestamp: formatDateTime(report.createdAt),
        });
      });

// Sort by recency (newest first)
    return items.sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });
  }, [adminNotes, emailQueue, reports]);

// ── Severity helpers ──
  const reportSeverity = openReportCount >= 5 ? "urgent" : openReportCount > 0 ? "warning" : "healthy";
  const emailSeverity = failedEmailCount > 0 ? "urgent" : pendingEmailCount > 10 ? "warning" : "healthy";
  const callWindowSeverity = callWindowMatches > 0 ? "info" : "healthy";
  const instructorSeverity = unassignedInstructorDecisions > 0 ? "warning" : "healthy";

  return (
    <div className="space-y-6">
      {/* Urgent Attention Banner */}
      <UrgentAttentionBanner items={urgentItems} />

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Active Listings"
          value={activeListings}
          detail={`${listingsTotal} total listings`}
          icon={<BookOpenCheck className="h-5 w-5" />}
          severity="healthy"
          onClick={() => onNavigateTab("learner-listings")}
        />
        <AdminMetricCard
          label="Open Matches"
          value={matchesTotal}
          detail={`${proposedMatches} proposed · ${callWindowMatches} in call window`}
          icon={<GitCompare className="h-5 w-5" />}
          severity={matchesTotal > 0 ? "info" : "healthy"}
          onClick={() => onNavigateTab("matches-call-state")}
        />
        <AdminMetricCard
          label="Open Support"
          value={openReportCount}
          detail={openReportCount > 0 ? "Requires attention" : "All tickets resolved"}
          icon={<AlertTriangle className="h-5 w-5" />}
          severity={reportSeverity}
          onClick={() => onNavigateTab("support-centre")}
        />
        <AdminMetricCard
          label="Email Health"
          value={pendingEmailCount}
          detail={`${failedEmailCount} failed · ${emailQueue.filter((e) => e.status === "SENT").length} sent recently`}
          icon={<Mail className="h-5 w-5" />}
          severity={emailSeverity}
          onClick={() => onNavigateTab("email-log")}
        />
        <AdminMetricCard
          label="Call Windows"
          value={callWindowMatches}
          detail={callWindowMatches > 0 ? "Learners may need DVSA guidance" : "No active call windows"}
          icon={<PhoneCall className="h-5 w-5" />}
          severity={callWindowSeverity}
          onClick={() => onNavigateTab("matches-call-state")}
        />
        <AdminMetricCard
          label="Instructor Decisions"
          value={unassignedInstructorDecisions}
          detail={
            unassignedInstructorDecisions > 0
              ? "Awaiting availability confirmation"
              : "All instructors confirmed"
          }
          icon={<UserX className="h-5 w-5" />}
          severity={instructorSeverity}
          onClick={() => onNavigateTab("learner-listings")}
        />
        <AdminMetricCard
          label="Learners"
          value={learnerAccountCount}
          detail={`${instructorAccountCount} instructors registered`}
          icon={<UsersRound className="h-5 w-5" />}
          severity="healthy"
          onClick={() => onNavigateTab("learner-accounts")}
        />
        <AdminMetricCard
          label="Sensitive Refs"
          value={sensitiveRefsHeld}
          detail="Encrypted booking references in system"
          icon={<ShieldCheck className="h-5 w-5" />}
          severity={sensitiveRefsHeld > 0 ? "info" : "healthy"}
          onClick={() => onNavigateTab("privacy-watch")}
        />
      </div>

      {/* Operational Feed */}
      {feedItems.length > 0 && (
        <OperationalFeed items={feedItems} maxItems={6} />
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          Quick Actions
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <QuickActionCard
            title="Support Centre"
            summary={`${openReportCount} open ticket${openReportCount !== 1 ? "s" : ""}`}
            icon={<LifeBuoy className="h-5 w-5" />}
            onClick={() => onNavigateTab("support-centre")}
            badge={openReportCount > 0 ? String(openReportCount) : undefined}
            badgeTone={openReportCount >= 5 ? "danger" : openReportCount > 0 ? "warning" : "neutral"}
          />
          <QuickActionCard
            title="Email Operations"
            summary={`${pendingEmailCount} pending · ${failedEmailCount} failed`}
            icon={<MailWarning className="h-5 w-5" />}
            onClick={() => onNavigateTab("email-log")}
            badge={failedEmailCount > 0 ? String(failedEmailCount) : undefined}
            badgeTone={failedEmailCount > 0 ? "danger" : pendingEmailCount > 10 ? "warning" : "neutral"}
          />
          <QuickActionCard
            title="Match Pipeline"
            summary={`${matchesTotal} total · ${callWindowMatches} call windows`}
            icon={<GitCompare className="h-5 w-5" />}
            onClick={() => onNavigateTab("matches-call-state")}
            badge={callWindowMatches > 0 ? String(callWindowMatches) : undefined}
            badgeTone={callWindowMatches > 0 ? "info" : "neutral"}
          />
          <QuickActionCard
            title="Learner Directory"
            summary={`${learnerAccountCount} total learners`}
            icon={<UsersRound className="h-5 w-5" />}
            onClick={() => onNavigateTab("learner-accounts")}
          />
          <QuickActionCard
            title="Privacy Audit"
            summary={`${sensitiveRefsHeld} encrypted refs held`}
            icon={<ShieldCheck className="h-5 w-5" />}
            onClick={() => onNavigateTab("privacy-watch")}
          />
        </div>
      </div>
    </div>
  );
}

// ── helpers ──

function formatDateTime(value?: Date | string | null): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(d);
}
