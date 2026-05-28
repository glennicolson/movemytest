"use client";

import { useEffect, useRef, useState } from "react";
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

function getFormValue(form: HTMLFormElement | null, name: string): string {
  if (!form) return "";
  const el = form.querySelector(`[name="${name}"]`) as HTMLInputElement | null;
  return el?.value ?? "";
}

export function AutoDirectionEditField({
  desiredFromDefault,
  desiredToDefault,
  directionDefault,
}: {
  desiredFromDefault: string;
  desiredToDefault: string;
  directionDefault: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [desiredFrom, setDesiredFrom] = useState(desiredFromDefault);
  const [desiredTo, setDesiredTo] = useState(desiredToDefault);
  const [direction, setDirection] = useState(directionDefault);

  useEffect(() => {
    const form = containerRef.current?.closest("form") as HTMLFormElement | null;
    if (!form) return;

    function recalc() {
      const currentDate = getFormValue(form, "currentDate");
      const currentTime = getFormValue(form, "currentTime");
      const d = calculateDirection(currentDate, currentTime, desiredFrom, desiredTo);
      setDirection(d);
    }

    recalc();
    form.addEventListener("input", recalc);
    return () => form.removeEventListener("input", recalc);
  }, [desiredFrom, desiredTo]);

  return (
    <div ref={containerRef} className="grid gap-4 md:grid-cols-3">
      <label className="space-y-2 text-sm font-medium text-slate-800">
        From date
        <input
          name="desiredDateFrom"
          type="date"
          required
          value={desiredFrom}
          onChange={(e) => setDesiredFrom(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm"
        />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-800">
        To date
        <input
          name="desiredDateTo"
          type="date"
          required
          value={desiredTo}
          onChange={(e) => setDesiredTo(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm"
        />
      </label>
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-800">Direction</p>
        <input type="hidden" name="desiredDirection" value={direction} />
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
          <span className="font-semibold text-[var(--brand)]">{DIRECTION_LABELS[direction as keyof typeof DIRECTION_LABELS]}</span>
          <span className="text-xs text-slate-500">(auto)</span>
        </div>
        <p className="text-xs text-slate-500">Calculated from your current test date vs. desired swap window.</p>
      </div>
    </div>
  );
}
