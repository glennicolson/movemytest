"use client";

import { useState, useMemo } from "react";
import {
  GitCompare,
  BookOpenCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { SegmentControl } from "@/components/instructor/segment-control";
import { InstructorKpiCard } from "@/components/instructor/instructor-kpi-card";
import { VisibilityBadge } from "@/components/instructor/visibility-badge";

type DashboardData = Awaited<ReturnType<typeof import("@/components/movemytest/instructor-dashboard-sections").getInstructorDashboardData>>;

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Date not set";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(d);
}

function statusTone(status: string) {
  if (["ACTIVE", "PROPOSED", "LEARNER_A_ACCEPTED", "LEARNER_B_ACCEPTED", "BOTH_ACCEPTED"].includes(status))
    return { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500" };
  if (["MATCHED", "BOOKING_REFERENCE_CONSENT_REQUESTED", "BOOKING_REFERENCE_SHARED"].includes(status))
    return { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-800", dot: "bg-blue-500" };
  if (["PAUSED"].includes(status))
    return { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" };
  if (["COMPLETED", "RESOLVED"].includes(status))
    return { border: "border-slate-200", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" };
  return { border: "border-red-200", bg: "bg-red-50", text: "text-red-800", dot: "bg-red-500" };
}

function humanise(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

export function InstructorMoveMyTestSummary({ data }: { data: DashboardData }) {
  const [filter, setFilter] = useState<"all" | "attention" | "matched">("all");

// Derived metrics
  const activeListings = data.activeLinks.filter((l: any) => l.listing.status === "ACTIVE").length;
  const matchedListings = data.activeLinks.filter((l: any) => l.listing.status === "MATCHED").length;
  const pausedListings = data.activeLinks.filter((l: any) => l.listing.status === "PAUSED").length;
  const callWindowMatches = data.activeCallWindows;
  const acceptedMatches = data.acceptedMatches;

// All matches across all learner links
  const allMatchRows = useMemo(() => {
    return data.attentionItems.flatMap((item: any) =>
      item.matches.map((match: any) => ({
        ...match,
        learnerEmail: item.link.listing.account?.email ?? "Unknown",
        learnerCentre: item.link.listing.currentCentre.name,
        learnerDate: item.link.listing.currentDateTime,
        learnerStatus: item.link.listing.status,
        reason: needsAttentionText(item.link, item.matches),
      }))
    );
  }, [data.attentionItems]);

// Filter
  const filteredRows = useMemo(() => {
    switch (filter) {
      case "attention":
        return allMatchRows.filter((r: any) => r.status === "BOOKING_REFERENCE_SHARED" || r.status === "BOTH_ACCEPTED");
      case "matched":
        return allMatchRows.filter((r: any) => ["PROPOSED", "LEARNER_A_ACCEPTED", "LEARNER_B_ACCEPTED", "BOTH_ACCEPTED", "BOOKING_REFERENCE_CONSENT_REQUESTED", "BOOKING_REFERENCE_SHARED"].includes(r.status));
      default:
        return allMatchRows;
    }
  }, [allMatchRows, filter]);

  if (data.learnerCards.length === 0) {
    return (
      <div className="instructor-portal space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">MoveMyTest</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">MoveMyTest Activity</h1>
        </div>
        <div className="rounded-2xl border border-[var(--instructor-mint)]/50 bg-[var(--instructor-mint)] p-8 text-center">
          <GitCompare className="mx-auto h-10 w-10 text-[var(--brand)] opacity-40" />
          <h3 className="mt-3 text-lg font-semibold text-slate-900">No learners linked yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            When learners enter your ADI number in their MoveMyTest listing, their matches and activity will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-portal space-y-6 pb-20">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">MoveMyTest</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">MoveMyTest Activity</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live overview of learner listings, matches, and your availability decisions.
        </p>
      </div>

      {/* KPI Tiles — 2×3 grid on tablet+ */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InstructorKpiCard
          label="Active Listings"
          value={activeListings}
          subtitle={`${matchedListings} matched · ${pausedListings} paused`}
          icon={<BookOpenCheck className="h-5 w-5" />}
          tone={activeListings > 0 ? "info" : "neutral"}
        />
        <InstructorKpiCard
          label="Total Matches"
          value={allMatchRows.length}
          subtitle={`${acceptedMatches} accepted · ${callWindowMatches} in call window`}
          icon={<GitCompare className="h-5 w-5" />}
          tone={allMatchRows.length > 0 ? "info" : "neutral"}
        />
        <InstructorKpiCard
          label="Call Windows"
          value={callWindowMatches}
          subtitle={callWindowMatches > 0 ? "DVSA phone call needed" : "No active call windows"}
          icon={callWindowMatches > 0 ? <PhoneCall className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          tone={callWindowMatches > 0 ? "warning" : "success"}
        />
        <InstructorKpiCard
          label="Linked Learners"
          value={data.learnerCards.length}
          subtitle={`${data.learnerCards.filter((c: any) => c.activeLink).length} with active listings`}
          icon={<Eye className="h-5 w-5" />}
          tone="neutral"
        />
        <InstructorKpiCard
          label="Needs Attention"
          value={data.learnerCards.filter((c: any) => c.priority <= 2).length}
          subtitle={data.learnerCards.filter((c: any) => c.priority <= 2).length > 0 ? "Review required" : "All clear"}
          icon={data.learnerCards.filter((c: any) => c.priority <= 2).length > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          tone={data.learnerCards.filter((c: any) => c.priority <= 2).length > 0 ? "warning" : "success"}
        />
        <InstructorKpiCard
          label="Support Tickets"
          value={data.supportSummary.open}
          subtitle={data.supportSummary.open > 0 ? `${data.supportSummary.awaitingResponse} awaiting response` : "None open"}
          icon={data.supportSummary.open > 0 ? <Clock className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          tone={data.supportSummary.open > 0 ? "danger" : "success"}
        />
      </div>

      {/* Quick link tiles */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/instructor/dashboard/linked-learners"
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[var(--brand)] hover:bg-[var(--instructor-mint)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10">
              <Eye className="h-5 w-5 text-[var(--brand)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Linked Learners</p>
              <p className="text-xs text-slate-500">{data.learnerCards.length} learners · manage availability decisions</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>
        <Link
          href="/instructor/dashboard/action-centre"
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[var(--brand)] hover:bg-[var(--instructor-mint)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10">
              <AlertTriangle className="h-5 w-5 text-[var(--brand)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Action Centre</p>
              <p className="text-xs text-slate-500">{data.supportSummary.open} open tickets · {callWindowMatches} call windows</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>

      {/* Match activity tiles */}
      {filteredRows.length > 0 && (
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Match Activity</h3>
            <SegmentControl
              options={[
                { id: "all", label: "All" },
                { id: "attention", label: "Attention", badge: allMatchRows.filter((r: any) => r.status === "BOOKING_REFERENCE_SHARED" || r.status === "BOTH_ACCEPTED").length },
                { id: "matched", label: "Matched" },
              ]}
              active={filter}
              onChange={f => setFilter(f as "all" | "attention" | "matched")}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="mt-4 space-y-3">
            {filteredRows.map((match: any) => {
              const tones = statusTone(match.status);
              const isCallWindow = match.status === "BOOKING_REFERENCE_SHARED";
              const isAccepted = ["BOTH_ACCEPTED", "BOOKING_REFERENCE_CONSENT_REQUESTED"].includes(match.status);
              return (
                <div
                  key={match.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {match.learnerEmail} → {match.otherCentre}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Current: {match.learnerCentre} · {formatDate(match.otherDateTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${tones.border} ${tones.bg} ${tones.text}`}>
                        {humanise(match.status)}
                      </span>
                      {isCallWindow && <VisibilityBadge variant="shared" label="CALL WINDOW" />}
                    </div>
                  </div>
                  {isCallWindow && (
                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
                      <PhoneCall className="mr-1.5 inline-block h-3.5 w-3.5" />
                      Both learners should call {isCallWindow ? "DVSA" : "DVSA"} to complete the swap. Confirm availability before the call.
                    </div>
                  )}
                  {isAccepted && !isCallWindow && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                      <Clock className="mr-1.5 inline-block h-3.5 w-3.5" />
                      Make your availability decision before the learner moves to the DVSA call stage.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No matches state */}
      {allMatchRows.length === 0 && data.learnerCards.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <GitCompare className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-lg font-semibold text-slate-900">No matches yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            When your learners get match proposals, they&apos;ll appear here with your availability decisions.
          </p>
        </div>
      )}

      {/* Privacy & compliance tile */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Privacy & Compliance</h3>
            <p className="mt-1 text-xs text-slate-600">
              You see only the aggregate activity for your linked learners. DVSA booking references are never visible to you — learners manage those themselves during the official phone swap. MoveMyTest does not access, change, or cancel any GOV.UK booking.
            </p>
            <Link
              href="/instructor/dashboard/security"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] hover:underline"
            >
              Security settings <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function needsAttentionText(link: Awaited<ReturnType<typeof import("@/components/movemytest/instructor-dashboard-sections").getInstructorDashboardData>>["links"][number], matches: Awaited<ReturnType<typeof import("@/components/movemytest/instructor-dashboard-sections").getInstructorDashboardData>>["allMatches"]): string {
  const callWindow = matches.find((m: any) => m.status === "BOOKING_REFERENCE_SHARED" && !m.completedAt);
  if (callWindow) return "Learner has an active DVSA call window.";
  const accepted = matches.find((m: any) => ["BOTH_ACCEPTED", "BOOKING_REFERENCE_CONSENT_REQUESTED"].includes(m.status));
  if (accepted) return "Learner has accepted a match. Confirm your availability.";
  if (link.listing.status === "PAUSED") return "Listing is paused.";
  if (["ACTIVE", "MATCHED"].includes(link.listing.status) && matches.length === 0) return "Active learner — no matches yet.";
  return "";
}
