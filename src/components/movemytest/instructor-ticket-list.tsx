"use client";

import { useState } from "react";
import { SupportTicketCard } from "@/components/movemytest/support-ticket-card";
import type { ReportWithDetails } from "@/features/movemytest/support-types";

export function InstructorTicketList({ reports }: { reports: any[] }) {
  const openTickets = reports.filter((r: any) => r.status !== "RESOLVED");
  const resolvedTickets = reports.filter((r: any) => r.status === "RESOLVED");
  const [showResolved, setShowResolved] = useState(false);

  if (!reports.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
        No support tickets yet. Use the form above to send your first message.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Open tickets — always visible, newest first */}
      {openTickets.length > 0 && (
        <div className="space-y-4">
          {openTickets.map((report: any) => (
            <SupportTicketCard key={report.id} report={report as ReportWithDetails} />
          ))}
        </div>
      )}

      {/* Resolved tickets — collapsible */}
      {resolvedTickets.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition"
          >
            <span>{showResolved ? "▲ Hide" : "▼ Show"} resolved tickets</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              {resolvedTickets.length}
            </span>
          </button>

          {showResolved && (
            <div className="mt-3 space-y-4">
              {resolvedTickets.map((report: any) => (
                <SupportTicketCard key={report.id} report={report as ReportWithDetails} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
