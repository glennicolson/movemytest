"use client";

import { useEffect, useMemo, useState } from "react";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Expired";
  const totalMinutes = Math.ceil(ms / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

export function CallWindowCountdown({ expiresAt }: { expiresAt: string }) {
  const expiry = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [remainingMs, setRemainingMs] = useState(() => expiry - Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setRemainingMs(expiry - Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, [expiry]);

  return (
    <div className="rounded-2xl border border-amber-300 bg-white p-4 text-amber-950">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Time left to complete the DVSA call</p>
      <p className="mt-2 text-3xl font-bold tabular-nums">{formatRemaining(remainingMs)}</p>
      <p className="mt-1 text-xs leading-5 text-amber-900">This countdown is based on the deadline calculated from DVSA phone opening hours.</p>
    </div>
  );
}
