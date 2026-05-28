"use client";

import { useEffect, useState } from "react";
import { DIRECTION_LABELS } from "@/features/movemytest/constants";

function calculateDirection(currentDate: string, currentTime: string, desiredFrom: string, desiredTo: string): string {
  if (!currentDate || !desiredFrom || !desiredTo) return "EITHER";
  const current = new Date(`${currentDate}T${currentTime || "00:00"}`).getTime();
  const from = new Date(`${desiredFrom}T00:00`).getTime();
  const to = new Date(`${desiredTo}T23:59`).getTime();
  if (to < current) return "EARLIER";
  if (from > current) return "LATER";
  return "EITHER";
}

export function AutoDirectionField({
  currentDate,
  currentTime,
  desiredFrom,
  desiredTo,
  defaultValue,
}: {
  currentDate?: string;
  currentTime?: string;
  desiredFrom?: string;
  desiredTo?: string;
  defaultValue?: string;
}) {
  const [direction, setDirection] = useState(defaultValue || "EITHER");

  useEffect(() => {
    const d = calculateDirection(currentDate || "", currentTime || "", desiredFrom || "", desiredTo || "");
    setDirection(d);
  }, [currentDate, currentTime, desiredFrom, desiredTo]);

  return (
    <div className="space-y-2">
      <input type="hidden" name="desiredDirection" value={direction} />
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
        <span className="font-semibold text-[var(--brand)]">
          {DIRECTION_LABELS[direction as keyof typeof DIRECTION_LABELS]}
        </span>
        <span className="text-xs text-slate-500">(auto)</span>
      </div>
      <p className="text-xs text-slate-500">
        Calculated from your current test date vs. desired swap window.
      </p>
    </div>
  );
}
