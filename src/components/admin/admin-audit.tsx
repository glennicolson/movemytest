"use client";

import { useState, useMemo } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AuditLog } from "./types";

function formatDateTime(value?: Date | string | null) {
  if (!value) return "Not set";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "Invalid" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(d);
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

function humaniseKey(key: string): string {
  return key
    .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function humaniseValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string") {
    if (/^[A-Z][A-Z_]+$/.test(val)) {
      return val.toLowerCase().replaceAll("_", " ");
    }
    return val;
  }
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function AuditDetail({ detail }: { detail: unknown }) {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return (
      <div className="mt-2 max-h-24 overflow-auto rounded-xl bg-white p-3 text-xs text-slate-600">
        {typeof detail === "string" ? detail : JSON.stringify(detail, null, 2)}
      </div>
    );
  }

  const entries = Object.entries(detail as Record<string, unknown>);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 rounded-xl bg-white p-3 text-xs">
      {entries.map(([key, val]) => (
        <div key={key} className="flex gap-2 py-0.5">
          <span className="min-w-[120px] font-medium text-slate-500">{humaniseKey(key)}</span>
          <span className="break-all text-slate-700">{humaniseValue(val)}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminAudit({ logs }: { logs: AuditLog[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (l) =>
        l.action?.toLowerCase().includes(q) ||
        l.instructorAccount?.firstName?.toLowerCase().includes(q) ||
        l.instructorAccount?.lastName?.toLowerCase().includes(q)
    );
  }, [logs, search]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action or instructor…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      </Card>

      {/* Audit Entries */}
      <div className="space-y-3">
        {filtered.map((log) => (
          <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="font-semibold text-slate-950">{humaniseValue(log.action)}</p>
              <p className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
            </div>
            <p className="mt-1 text-slate-600">
              {log.instructorAccount
                ? `${log.instructorAccount.firstName} ${log.instructorAccount.lastName} · ADI ${maskAdi(log.instructorAccount.adiNumber)}`
                : "Instructor account unavailable"}
            </p>
            {log.listingInstructor?.listing && (
              <p className="mt-1 text-slate-600">
                Learner {maskEmail(log.listingInstructor.listing.account?.email)} ·{" "}
                {log.listingInstructor.listing.currentCentre?.name}
              </p>
            )}
            <AuditDetail detail={log.detail} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No audit entries match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
