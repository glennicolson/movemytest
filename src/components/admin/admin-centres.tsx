"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Centre } from "./types";

function formatDate(value?: Date | string | null) {
  if (!value) return "Never";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "Invalid" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d);
}

function getFreshnessStatus(centre: Centre) {
  if (!centre.sourceLastCheckedAt) {
    return { label: "Never checked", tone: "danger", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> };
  }
  const days = (Date.now() - new Date(centre.sourceLastCheckedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 7) {
    return { label: "Fresh", tone: "success", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> };
  }
  if (days < 30) {
    return { label: "Stale", tone: "warning", icon: <Clock className="h-4 w-4 text-amber-500" /> };
  }
  return { label: "Very stale", tone: "danger", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> };
}

export function AdminCentres({ centres }: { centres: Centre[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return centres;
    const q = search.toLowerCase();
    return centres.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.region?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q)
    );
  }, [centres, search]);

  const freshnessStats = useMemo(() => {
    let fresh = 0;
    let stale = 0;
    let unchecked = 0;
    centres.forEach((c) => {
      if (!c.sourceLastCheckedAt) {
        unchecked++;
      } else {
        const days = (Date.now() - new Date(c.sourceLastCheckedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (days < 7) fresh++;
        else stale++;
      }
    });
    return { fresh, stale, unchecked };
  }, [centres]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-200 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Fresh (&lt;7 days)</p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">{freshnessStats.fresh}</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">Stale (≥7 days)</p>
              <p className="mt-2 text-3xl font-bold text-amber-900">{freshnessStats.stale}</p>
            </div>
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-600">Never checked</p>
              <p className="mt-2 text-3xl font-bold text-red-900">{freshnessStats.unchecked}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-500" />
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
            placeholder="Search by name, region, or slug…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      </Card>

      {/* Centre Grid */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((centre) => {
          const freshness = getFreshnessStatus(centre);
          return (
            <div key={centre.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {freshness.icon}
                {centre.sourceAgency ?? "DVSA"}
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{centre.name}</p>
              <p className="text-xs text-slate-600">{centre.region ?? "Unknown region"}</p>
              <p className="mt-2 text-xs text-slate-500">Last checked: {formatDate(centre.sourceLastCheckedAt)}</p>
              <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                freshness.tone === "success" ? "bg-emerald-100 text-emerald-800" :
                freshness.tone === "warning" ? "bg-amber-100 text-amber-800" :
                "bg-red-100 text-red-800"
              }`}>
                {freshness.label}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No centres match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
