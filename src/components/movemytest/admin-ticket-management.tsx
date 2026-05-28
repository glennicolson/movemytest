"use client";

import { useState, useTransition } from "react";
import {
  adminReplyToReportAction,
  adminUpdateReportStatusAction,
  adminCloseReportAction,
} from "@/features/movemytest/support-actions";
import { StatusPill } from "@/components/movemytest/status-pill";
import type { ReportWithDetails } from "@/features/movemytest/support-types";

function safeDate(value?: Date | string | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateTime(value?: Date | string | null) {
  const d = safeDate(value);
  if (!d) return "Unknown date";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(d);
}

function reporterLabel(report: ReportWithDetails) {
  const isInstructor = report.reason.startsWith("INSTRUCTOR_");
  if (isInstructor) {
// Instructor email stored in mobileNumber field, name in detail
    const detailMatch = report.detail?.match(/From: (.+?) \(ADI/);
    return detailMatch ? detailMatch[1] : (report.mobileNumber ?? "Instructor");
  }
  return maskEmail(report.reporterMoveMyTestAccount?.email ?? report.reporterMoveMyTestAccount?.email ?? null);
}

function maskEmail(value?: string | null) {
  if (!value) return "Unknown";
  const [name, domain] = value.split("@");
  if (!domain) return value;
  return `${name.slice(0, 2)}•••@${domain}`;
}

function reporterRole(report: ReportWithDetails) {
  return report.reason.startsWith("INSTRUCTOR_") ? "Instructor" : "Learner";
}

export function AdminTicketManagement({ reports }: { reports: ReportWithDetails[] }) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className={`rounded-2xl border bg-white shadow-sm transition ${
            selectedTicket === report.id ? "border-[var(--brand)] ring-1 ring-[var(--brand)]/20" : "border-slate-200"
          }`}
        >
          <div
            className="cursor-pointer p-4"
            onClick={() => setSelectedTicket(selectedTicket === report.id ? null : report.id)}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {report.reason.toLowerCase().replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {reporterRole(report)}: {reporterLabel(report)} ·{" "}
                  {report.mobileNumber ?? "No mobile"} · {formatDateTime(report.createdAt)}
                </p>
              </div>
              <StatusPill status={report.status} />
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {report.detail}
            </div>
            {report.responses.length > 0 ? (
              <p className="mt-2 text-xs text-slate-500">{report.responses.length} response(s) · click to manage</p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">No responses yet · click to reply</p>
            )}
          </div>

          {selectedTicket === report.id && (
            <div className="border-t border-slate-200 p-4">
              <div className="space-y-3">
                {report.responses.map((response) => (
                  <div
                    key={response.id}
                    className={`rounded-xl border p-3 text-sm ${
                      response.channel === "PHONE_CALL_NOTE"
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : "border-blue-200 bg-blue-50 text-blue-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">
                        {response.channel === "PORTAL_REPLY"
                          ? "Portal Reply"
                          : response.channel === "EMAIL_SENT"
                          ? "Email Sent"
                          : "Phone Note"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {response.user ? `${response.user.firstName} ${response.user.lastName}` : "DTC Support"} ·{" "}
                        {formatDateTime(response.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1">{response.message}</p>
                  </div>
                ))}
              </div>

              {report.status !== "RESOLVED" && (
                <div className="mt-4 space-y-4">
                  <AdminReplyForm reportId={report.id} isInstructor={report.reason.startsWith("INSTRUCTOR_")} />
                  <div className="flex flex-wrap gap-2">
                    <StatusChangeForm reportId={report.id} currentStatus={report.status} />
                    <CloseTicketForm reportId={report.id} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AdminReplyForm({ reportId, isInstructor }: { reportId: string; isInstructor: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState("PORTAL_REPLY");

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await adminReplyToReportAction(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send reply");
      }
    });
  };

  const recipientLabel = isInstructor ? "instructor" : "learner";

  return (
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="reportId" value={reportId} />
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-slate-800">Reply to {recipientLabel}:</p>
        <select
          name="channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="PORTAL_REPLY">Portal reply (visible in {recipientLabel} dashboard)</option>
          <option value="EMAIL_SENT">Portal reply + send email</option>
          <option value="PHONE_CALL_NOTE">Phone call note (internal only)</option>
        </select>
      </div>
      <textarea
        name="message"
        required
        className="min-h-24 w-full rounded-xl border border-slate-300 p-3 text-sm"
        placeholder={`Type your response to the ${recipientLabel}...`}
      />
      {error && (
        <p className="text-sm text-red-700">{error}</p>
      )}
      <button
        disabled={pending}
        className="rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-strong)] disabled:opacity-60"
      >
        {pending ? "Sending..." : channel === "EMAIL_SENT" ? "Send reply + email" : "Send reply"}
      </button>
    </form>
  );
}

function StatusChangeForm({
  reportId,
  currentStatus,
}: {
  reportId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();

  const statuses = [
    { value: "OPEN", label: "Open" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "AWAITING_LEARNER", label: "Awaiting Learner" },
  ];

  return (
    <form
      action={(formData: FormData) => {
        startTransition(() => adminUpdateReportStatusAction(formData));
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="reportId" value={reportId} />
      <select name="status" defaultValue={currentStatus} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button
        disabled={pending}
        className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:border-[var(--brand)] disabled:opacity-60"
      >
        {pending ? "Updating..." : "Update status"}
      </button>
    </form>
  );
}

function CloseTicketForm({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData: FormData) => {
        startTransition(() => adminCloseReportAction(formData));
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="reportId" value={reportId} />
      <input
        type="text"
        name="closeReason"
        placeholder="Close reason (optional)"
        className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
      />
      <button
        disabled={pending}
        className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
      >
        {pending ? "Closing..." : "Close ticket"}
      </button>
    </form>
  );
}
