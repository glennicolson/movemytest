"use client";

import { useState, useMemo } from "react";
import { Search, UserRoundCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "./status-pill";
import type { Instructor } from "./types";

function formatDate(value?: Date | string | null) {
  if (!value) return "Not set";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "Invalid" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d);
}

function maskAdi(value?: string | null) {
  if (!value) return "Not provided";
  const normalized = value.trim().replace(/\s+/g, "").toUpperCase();
  if (normalized.length <= 4) return "••••";
  return `${normalized.slice(0, 2)}••••${normalized.slice(-2)}`;
}

export function AdminInstructors({ instructors }: { instructors: Instructor[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return instructors;
    const q = search.toLowerCase();
    return instructors.filter(
      (i) =>
        `${i.firstName} ${i.lastName}`.toLowerCase().includes(q) ||
        i.adiNumber?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q)
    );
  }, [instructors, search]);

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
            placeholder="Search by name, ADI, or email…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      </Card>

      {/* Instructor Grid */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((instructor) => (
          <article key={instructor.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-950">
                  {instructor.firstName} {instructor.lastName}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  ADI {maskAdi(instructor.adiNumber)}
                </p>
              </div>
              <StatusPill status={instructor.status} />
            </div>
            <p className="mt-1 text-xs text-slate-600 truncate">
              {instructor.email ?? "No email"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-white px-2 py-0.5 border">
                {instructor.listingLinks?.length ?? 0} learners
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 border">
                Last login: {instructor.lastLoginAt ? formatDate(instructor.lastLoginAt) : "Never"}
              </span>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No instructors match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
