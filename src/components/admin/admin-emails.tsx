"use client";

import { useState, useMemo } from "react";
import { Search, Mail, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "./status-pill";
import type { Email } from "./types";

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

function humanise(value?: string | null) {
  return value ? value.toLowerCase().replaceAll("_", " ") : "not set";
}

export function AdminEmails({ emails }: { emails: Email[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return emails;
    const q = search.toLowerCase();
    return emails.filter(
      (e) =>
        e.recipient?.toLowerCase().includes(q) ||
        e.kind?.toLowerCase().includes(q) ||
        e.status?.toLowerCase().includes(q)
    );
  }, [emails, search]);

  const sent = filtered.filter((e) => e.status === "SENT");
  const pending = filtered.filter((e) => e.status === "PENDING");
  const failed = filtered.filter((e) => e.status === "FAILED");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Total Emails</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{emails.length}</p>
            </div>
            <Mail className="h-6 w-6 text-slate-400" />
          </div>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Sent</p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">{sent.length}</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Pending</p>
              <p className="mt-2 text-3xl font-bold text-blue-900">{pending.length}</p>
            </div>
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-600">Failed</p>
              <p className="mt-2 text-3xl font-bold text-red-900">{failed.length}</p>
            </div>
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient, kind, or status…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      </Card>

      {/* Failed Emails */}
      {failed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-red-900">Failed Emails ({failed.length})</h3>
          {failed.map((email) => (
            <article key={email.id} className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-red-950">{humanise(email.kind)}</h4>
                  <p className="mt-1 text-red-800">{maskEmail(email.recipient)} · {humanise(email.recipientRole)}</p>
                </div>
                <StatusPill status={email.status} />
              </div>
              <div className="mt-3 grid gap-2 text-xs text-red-700 sm:grid-cols-3">
                <p>Scheduled: <span className="font-semibold text-red-900">{formatDateTime(email.scheduledFor)}</span></p>
                <p>Retries: <span className="font-semibold text-red-900">{email.retryCount}/{email.maxRetries}</span></p>
                <p>Updated: <span className="font-semibold text-red-900">{formatDateTime(email.updatedAt)}</span></p>
              </div>
              {email.error && (
                <p className="mt-3 rounded-xl border border-red-200 bg-white p-3 text-xs text-red-700">{email.error}</p>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Pending Emails */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-blue-900">Pending Emails ({pending.length})</h3>
          {pending.map((email) => (
            <article key={email.id} className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-blue-950">{humanise(email.kind)}</h4>
                  <p className="mt-1 text-blue-800">{maskEmail(email.recipient)} · {humanise(email.recipientRole)}</p>
                </div>
                <StatusPill status={email.status} />
              </div>
              <div className="mt-3 grid gap-2 text-xs text-blue-700 sm:grid-cols-3">
                <p>Scheduled: <span className="font-semibold text-blue-900">{formatDateTime(email.scheduledFor)}</span></p>
                <p>Retries: <span className="font-semibold text-blue-900">{email.retryCount}/{email.maxRetries}</span></p>
                <p>Updated: <span className="font-semibold text-blue-900">{formatDateTime(email.updatedAt)}</span></p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Sent Emails */}
      {sent.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-emerald-900">Sent Emails ({sent.length})</h3>
          {sent.slice(0, 20).map((email) => (
            <article key={email.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-emerald-950">{humanise(email.kind)}</h4>
                  <p className="mt-1 text-emerald-800">{maskEmail(email.recipient)} · {humanise(email.recipientRole)}</p>
                </div>
                <StatusPill status={email.status} />
              </div>
              <div className="mt-3 grid gap-2 text-xs text-emerald-700 sm:grid-cols-2">
                <p>Sent: <span className="font-semibold text-emerald-900">{formatDateTime(email.sentAt)}</span></p>
                <p>Scheduled: <span className="font-semibold text-emerald-900">{formatDateTime(email.scheduledFor)}</span></p>
              </div>
            </article>
          ))}
          {sent.length > 20 && (
            <p className="text-center text-sm text-slate-500">+{sent.length - 20} more sent emails</p>
          )}
        </div>
      )}

      {emails.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">No emails in the queue yet.</p>
        </div>
      )}
    </div>
  );
}
