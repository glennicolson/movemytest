"use client";

import { useState, useMemo } from "react";
import { Search, MessageSquare, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "./status-pill";
import type { Report } from "./types";

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

export function AdminSupport({ reports }: { reports: Report[] }) {
  const [search, setSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = useMemo(() => {
    if (!search) return reports;
    const q = search.toLowerCase();
    return reports.filter(
      (r) =>
        r.reason?.toLowerCase().includes(q) ||
        r.detail?.toLowerCase().includes(q) ||
        r.reporterAccount?.email?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
    );
  }, [reports, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [reports]);

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
            placeholder="Search by reason, detail, or email…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      </Card>

      {/* Reports */}
      <div className="space-y-4">
        {filtered.map((report) => (
          <article key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950">{report.reason}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {maskEmail(report.reporterAccount?.email)} · {formatDateTime(report.createdAt)}
                </p>
              </div>
              <StatusPill status={report.status} />
            </div>

            {report.detail && (
              <p className="mt-3 text-sm text-slate-700 bg-white rounded-xl border border-slate-200 p-3">
                {report.detail}
              </p>
            )}

            {report.listing?.currentCentre && (
              <p className="mt-2 text-xs text-slate-600">
                Related listing: {report.listing.currentCentre.name}
              </p>
            )}

            {/* Responses */}
            {report.responses && report.responses.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Responses</h4>
                {report.responses.map((response) => (
                  <div key={response.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold text-slate-900">{response.channel}</span>
                      <span className="text-xs text-slate-500">{formatDateTime(response.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-slate-700">{response.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Section */}
            {report.status === "OPEN" && (
              <div className="mt-4">
                {replyingTo === report.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response…"
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                      >
                        Send Response
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(report.id)}
                    className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
                  >
                    Reply
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No reports match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
