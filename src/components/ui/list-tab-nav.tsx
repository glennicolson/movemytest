"use client";

import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";

type Tab = { key: string; label: string; count?: number };

export function ListTabNav({ tabs, basePath }: { tabs: Tab[]; basePath: string }) {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") ?? "active";

  return (
    <nav className="flex gap-1 border-b border-slate-200">
      {tabs.map((tab) => {
        const isActive = currentView === tab.key;
        const href = (tab.key === "active" ? basePath : `${basePath}?view=${tab.key}`) as Route;
        return (
          <Link
            key={tab.key}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-[var(--brand)] text-[var(--brand)]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isActive ? "bg-[var(--brand)]/10 text-[var(--brand)]" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}