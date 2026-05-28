"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Disclosure({
  title,
  description,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("rounded-2xl border border-[var(--border)] bg-white shadow-sm", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <div>
          <div className="text-lg font-semibold text-slate-900">{title}</div>
          {description ? <div className="mt-1 text-sm text-slate-600">{description}</div> : null}
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? <div className="border-t border-slate-200 px-6 py-5">{children}</div> : null}
    </div>
  );
}
