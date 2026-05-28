"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Route } from "next";

export type ActionRailAction = {
  label: string;
  href?: Route<string>;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  icon?: React.ReactNode;
};

export type ActionRailGroup = {
  label?: string;
  actions: ActionRailAction[];
};

function actionButtonClasses(variant: ActionRailAction["variant"]) {
  switch (variant) {
    case "primary":
      return "border-slate-800 bg-slate-800 text-white hover:bg-slate-700 hover:border-slate-700";
    case "danger":
      return "border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300";
    case "secondary":
    default:
      return "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400";
  }
}

function ActionButton({ action }: { action: ActionRailAction }) {
  const classes = cn(
    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
    actionButtonClasses(action.variant ?? "secondary")
  );

  if (action.href && !action.disabled) {
    return (
      <Link href={action.href} className={classes}>
        {action.icon}
        {action.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      className={classes}
    >
      {action.icon}
      {action.label}
    </button>
  );
}

export function ActionRail({
  groups,
  className,
}: {
  groups: ActionRailGroup[];
  className?: string;
}) {
  if (!groups || groups.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {groups.map((group, gi) => (
        <div key={gi} className="flex flex-wrap items-center gap-2">
          {group.label ? (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group.label}</span>
          ) : null}
          {group.actions.map((action, ai) => (
            <ActionButton key={ai} action={action} />
          ))}
          {gi < groups.length - 1 ? (
            <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
