"use client";

import { cn } from "@/lib/utils";

export function StatusPill({ status }: { status: string | null | undefined }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  // Success states
  if (
    [
      "ACTIVE",
      "PROPOSED",
      "AVAILABLE",
      "CLAIMED",
      "SENT",
      "ACCEPTED",
      "COMPLETED",
      "RESOLVED",
    ].includes(normalized)
  ) {
    return (
      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
        {humanise(status)}
      </span>
    );
  }

  // Info/blue states
  if (
    [
      "MATCHED",
      "BOOKING_REFERENCE_CONSENT_REQUESTED",
      "BOOKING_REFERENCE_SHARED",
      "PENDING",
      "IN_PROGRESS",
    ].includes(normalized)
  ) {
    return (
      <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
        {humanise(status)}
      </span>
    );
  }

  // Warning states
  if (["PAUSED", "NEEDS_DISCUSSION", "OPEN", "STALE"].includes(normalized)) {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        {humanise(status)}
      </span>
    );
  }

  // Danger states
  if (
    [
      "EXPIRED",
      "CANCELLED",
      "DECLINED",
      "FAILED",
      "CLOSED",
      "DELETED",
    ].includes(normalized)
  ) {
    return (
      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-800">
        {humanise(status)}
      </span>
    );
  }

  // Default neutral
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
      {humanise(status)}
    </span>
  );
}

function humanise(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}
