import { StatusPill } from "@/components/movemytest/status-pill";
import type { ReportWithDetails } from "@/features/movemytest/support-types";

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "Date not set";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(d);
}

export function SupportTicketCard({ report }: { report: ReportWithDetails }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {report.reason.toLowerCase().replaceAll("_", " ")}
          </p>
          <p className="mt-1 text-xs text-slate-500">{formatDateTime(report.createdAt)}</p>
        </div>
        <StatusPill status={report.status} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-slate-800">Your message:</p>
        <p className="mt-1">{report.detail ?? "No detail provided."}</p>
      </div>
      {report.responses.length > 0 ? (
        <div className="space-y-3">
          {report.responses.map((response) => (
            <div
              key={response.id}
              className={`rounded-2xl border p-4 text-sm leading-6 ${
                response.channel === "PHONE_CALL_NOTE"
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-blue-200 bg-blue-50 text-blue-900"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-semibold">
                  {response.channel === "PORTAL_REPLY"
                    ? "MoveMyTest Portal Reply"
                    : response.channel === "EMAIL_SENT"
                    ? "MoveMyTest Email Response"
                    : "MoveMyTest Phone Note"}
                </p>
                <p className="text-xs text-slate-500">
                  {response.author ? response.author.email : "MoveMyTest Support"} · {formatDateTime(response.createdAt)}
                </p>
              </div>
              <p className="mt-2">{response.message}</p>
            </div>
          ))}
        </div>
      ) : report.status !== "RESOLVED" ? (
        <p className="text-sm text-slate-500">Awaiting DTC response...</p>
      ) : null}
    </div>
  );
}
