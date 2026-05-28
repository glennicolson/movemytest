"use client";

import { useState, useMemo } from "react";
import { Search, GitCompare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "./status-pill";
import type { Match } from "./types";

function formatDateTime(value?: Date | string | null) {
  if (!value) return "Not set";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "Invalid" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(d);
}

function maskEmail(value?: string | null) {
  if (!value) return "Unknown";
  const [name, domain] = value.split("@");
  if (!domain) return value;
  return `${name.slice(0, 2)}•••@${domain}`;
}

export function AdminMatches({ matches }: { matches: Match[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return matches;
    const q = search.toLowerCase();
    return matches.filter(
      (m) =>
        m.listingA?.currentCentre?.name?.toLowerCase().includes(q) ||
        m.listingB?.currentCentre?.name?.toLowerCase().includes(q) ||
        m.listingA?.account?.email?.toLowerCase().includes(q) ||
        m.listingB?.account?.email?.toLowerCase().includes(q) ||
        m.status?.toLowerCase().includes(q)
    );
  }, [matches, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    matches.forEach((m) => {
      counts[m.status] = (counts[m.status] || 0) + 1;
    });
    return counts;
  }, [matches]);

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {status.toLowerCase().replaceAll("_", " ")}: {count}
          </div>
        ))}
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by centre, email, or status…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      </Card>

      {/* Match Cards */}
      <div className="space-y-4">
        {filtered.map((match) => (
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
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Learner A</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{maskEmail(match.listingA?.account?.email)}</p>
                <p className="text-xs text-slate-600">{formatDateTime(match.listingA?.currentDateTime)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Learner B</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{maskEmail(match.listingB?.account?.email)}</p>
                <p className="text-xs text-slate-600">{formatDateTime(match.listingB?.currentDateTime)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Call window</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {match.callWindowExpiresAt ? `Expires ${formatDateTime(match.callWindowExpiresAt)}` : "Not active"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Booking refs</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {(match.secrets ?? []).filter((s) => !s.deletedAt).length} encrypted ref(s)
                </p>
              </div>
            </div>

            {(match.instructorAvailabilityDecisions ?? []).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(match.instructorAvailabilityDecisions ?? []).map((d) => (
                  <span key={d.id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {d.instructorAccount ? `${d.instructorAccount.firstName} ${d.instructorAccount.lastName}` : "Instructor"}: {d.status.toLowerCase().replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No matches match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
