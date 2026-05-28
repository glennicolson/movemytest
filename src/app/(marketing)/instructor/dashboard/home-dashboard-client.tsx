"use client";

import { useState, useMemo } from "react";
import {
  UsersRound,
  BookOpenCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { SegmentControl } from "@/components/instructor/segment-control";
import { InstructorKpiCard } from "@/components/instructor/instructor-kpi-card";
import { TimelineBar } from "@/components/instructor/timeline-bar";
import type { TimelineBlock } from "@/components/instructor/timeline-bar";

type DashboardData = Awaited<ReturnType<typeof import("@/components/movemytest/instructor-dashboard-sections").getInstructorDashboardData>>;

function formatTime(date: Date): { hour: number; minute: number } {
  return { hour: date.getHours(), minute: date.getMinutes() };
}

function formatTimeLabel(date: Date | string | null | undefined): string {
  if (!date) return "Time not set";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid time";
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(d);
}

function formatDateLabel(date: Date | string | null | undefined): string {
  if (!date) return "Date not set";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" }).format(d);
}

function formatRelative(timestamp: Date | string | null | undefined): string {
  if (!timestamp) return "Unknown";
  const t = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (isNaN(t.getTime())) return "Invalid date";
  const diffMs = Date.now() - t.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function InstructorHomeDashboard({ data }: { data: DashboardData }) {
  const [view, setView] = useState<"today" | "seven-days">("today");

  const isDtc = Boolean(data.instructor.crmInstructorProfileId);
  const name = data.instructor.firstName || "there";
  const today = useMemo(() => new Date(), []);

// KPI derivations
  const uniqueLearners = data.learnerCards.length;
  const activeLearners = data.learnerCards.filter((c: any) => c.activeLink && ["ACTIVE", "MATCHED"].includes(c.activeLink.listing.status)).length;
  const urgentCount = data.learnerCards.filter((c: any) => c.priority <= 2).length;
  const activeCallWindows = data.activeCallWindows;
  const openTickets = data.supportSummary.open;

  const weekEnd = useMemo(() => {
    const end = new Date(today);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [today]);

  const nowTime = useMemo(() => formatTime(today), [today]);

  const timelineEvents = useMemo(() => {
    const all = data.calendarEvents;
    const filtered = view === "today"
      ? all.filter((e: any) => {
          const t = new Date(e.start);
          return t.toDateString() === today.toDateString();
        })
      : all.filter((e: any) => {
          const t = new Date(e.start);
          return t >= today && t <= weekEnd;
        });

    const todayBlocks: TimelineBlock[] = filtered.map((e: any) => {
      const start = new Date(e.start);
      const end = e.end ? new Date(e.end) : new Date(start.getTime() + 60 * 60 * 1000);
      return {
        id: e.id,
        label: e.title,
        startHour: start.getHours(),
        startMinute: start.getMinutes(),
        endHour: end.getHours(),
        endMinute: end.getMinutes(),
        color: e.type === "test" ? "red" : ("status" in e && typeof e.status === "string" && e.status?.includes("ACCEPTED")) ? "amber" : "green",
      };
    });

    return todayBlocks;
  }, [data.calendarEvents, view, today, weekEnd]);

// Activity feed derived from data
  const activityItems = useMemo(() => {
    const items: { id: string; message: string; timestamp: Date; type: "match" | "listing" | "ticket" | "learner" }[] = [];

// Recent attention items
    data.attentionItems.slice(0, 3).forEach((item: any) => {
      items.push({
        id: `attention-${item.link.id}`,
        message: item.reason,
        timestamp: new Date(item.link.updatedAt),
        type: "match",
      });
    });

// Recent active links
    data.activeLinks.slice(0, 2).forEach((link: any) => {
      items.push({
        id: `link-${link.id}`,
        message: `${link.listing.account?.email ?? "Learner"} — test at ${link.listing.currentCentre.name} (${formatDateLabel(link.listing.currentDateTime)})`,
        timestamp: new Date(link.updatedAt),
        type: "listing",
      });
    });

    return items.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 6);
  }, [data]);

// Upcoming items for the next-7-days view
  const upcomingItems = useMemo(() => {
    if (view !== "seven-days") return [];
    return data.activeLinks
      .filter((link: any) => {
        const t = new Date(link.listing.currentDateTime);
        return !isNaN(t.getTime()) && t >= today && t <= weekEnd;
      })
      .map((link: any) => ({
        id: link.id,
        email: link.listing.account?.email ?? "Learner",
        centre: link.listing.currentCentre.name,
        date: link.listing.currentDateTime,
        status: link.listing.status,
      }));
  }, [data, view, today, weekEnd]);

  return (
    <div className="instructor-portal space-y-6 pb-20">
      {/* Greeting header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
          {isDtc ? "MoveMyTest instructor" : "Independent instructor"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Hi, {name}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }).format(today)}
        </p>
      </div>

      {/* TODAY// NEXT 7 DAYS segment */}
      <SegmentControl
        options={[
          { id: "today", label: "Today", badge: timelineEvents.filter(() => view === "today").length || undefined },
          { id: "seven-days", label: "Next 7 Days" },
        ]}
        active={view}
        onChange={(id: string) => setView(id as "today" | "seven-days")}
      />

      {/* Empty state */}
      {data.learnerCards.length === 0 && (
        <div className="rounded-2xl border border-[var(--instructor-mint)]/50 bg-[var(--instructor-mint)] p-6 text-center">
          <UsersRound className="mx-auto h-10 w-10 text-[var(--brand)] opacity-50" />
          <h3 className="mt-3 text-lg font-semibold text-slate-900">No learners linked yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            Share your ADI number with your learners and ask them to enter it when they create a MoveMyTest listing.
          </p>
        </div>
      )}

      {/* KPI row */}
      {data.learnerCards.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InstructorKpiCard
            label="Linked Learners"
            value={uniqueLearners}
            subtitle={`${activeLearners} active`}
            icon={<UsersRound className="h-5 w-5" />}
            tone="neutral"
          />
          <InstructorKpiCard
            label="Needs Attention"
            value={urgentCount}
            subtitle={urgentCount > 0 ? `${activeCallWindows} in call window` : "All clear"}
            icon={urgentCount > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            tone={urgentCount > 0 ? "warning" : "success"}
          />
          <InstructorKpiCard
            label="Today's Events"
            value={timelineEvents.length}
            subtitle={timelineEvents.length > 0 ? `${timelineEvents.filter(b => b.color === "red").length} tests` : "No events"}
            icon={<BookOpenCheck className="h-5 w-5" />}
            tone="neutral"
          />
          <InstructorKpiCard
            label="Open Tickets"
            value={openTickets}
            subtitle={openTickets > 0 ? "Needs response" : "Nothing open"}
            icon={openTickets > 0 ? <Clock className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            tone={openTickets > 0 ? "danger" : "success"}
          />
        </div>
      )}

      {/* Timeline */}
      {timelineEvents.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            {view === "today" ? "Today's Schedule" : "Week Ahead"}
          </h3>
          <div className="mt-4">
            <TimelineBar
              blocks={timelineEvents}
              currentTime={view === "today" ? nowTime : null}
            />
          </div>
          <ul className="mt-3 space-y-1.5">
            {timelineEvents.map(block => (
              <li key={block.id} className="flex items-center gap-2 text-xs text-slate-600">
                <span className={block.color === "red" ? "inline-block h-2 w-2 rounded-full bg-red-500" : block.color === "amber" ? "inline-block h-2 w-2 rounded-full bg-amber-500" : "inline-block h-2 w-2 rounded-full bg-emerald-500"} />
                {block.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next 7 Days upcoming */}
      {view === "seven-days" && upcomingItems.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Upcoming This Week</h3>
          <ul className="mt-3 divide-y divide-slate-100">
            {upcomingItems.map((item: any) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{item.email}</p>
                  <p className="text-xs text-slate-500">{item.centre} · {formatDateLabel(item.date)} · {formatTimeLabel(item.date)}</p>
                </div>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                  {item.status.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Urgent attention banner */}
      {urgentCount > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold">{urgentCount} learner{urgentCount !== 1 ? "s" : ""} need{urgentCount === 1 ? "s" : ""} your attention</p>
              <ul className="mt-2 space-y-1 text-xs text-red-800">
                {data.attentionItems.filter((i: any) => {
                  const card = data.learnerCards.find((c: any) => c.activeLink?.id === i.link.id);
                  return card && card.priority <= 2;
                }).slice(0, 3).map((item: any) => (
                  <li key={item.link.id} className="flex items-start gap-1.5">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Activity feed */}
      {activityItems.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Recent Activity</h3>
            <span className="text-xs text-slate-400">{activityItems.length} events</span>
          </div>
          <div className="mt-4 space-y-2">
            {activityItems.map(item => {
              const colorMap = { match: "border-l-blue-400 bg-blue-50", listing: "border-l-emerald-400 bg-emerald-50", ticket: "border-l-amber-400 bg-amber-50", learner: "border-l-slate-400 bg-slate-50" };
              return (
                <div key={item.id} className={`rounded-lg border-l-4 ${colorMap[item.type]} px-3 py-2.5`}>
                  <p className="text-xs leading-5 text-slate-700">{item.message}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{formatRelative(item.timestamp)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
