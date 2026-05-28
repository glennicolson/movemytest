"use client";

import { useState, useMemo } from "react";
import { UsersRound, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "./status-pill";
import type { Learner } from "./types";

function formatDate(value?: Date | string | null) {
  if (!value) return "Not set";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "Invalid" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d);
}

function maskEmail(value?: string | null) {
  if (!value) return "Unknown";
  const [name, domain] = value.split("@");
  if (!domain) return value;
  return `${name.slice(0, 2)}•••@${domain}`;
}

export function AdminLearners({ learners }: { learners: Learner[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return learners;
    const q = search.toLowerCase();
    return learners.filter(
      (l) =>
        l.email?.toLowerCase().includes(q) ||
        l.mobileNumber?.includes(q) ||
        l.listings?.some((li) => li.currentCentre?.name?.toLowerCase().includes(q))
    );
  }, [learners, search]);

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
            placeholder="Search by email, mobile, or centre…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      </Card>

      {/* Learner Grid */}
      <div className="grid gap-4 xl:grid-cols-3">
        {filtered.map((learner) => {
          const activeListing = learner.listings?.find((l) =>
            ["ACTIVE", "MATCHED", "PAUSED"].includes(l.status)
          );
          return (
            <article key={learner.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{maskEmail(learner.email)}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {learner.mobileNumber ?? "No mobile"} · joined {formatDate(learner.createdAt)}
                  </p>
                </div>
                <StatusPill status={learner.status} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Listings</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{(learner.listings ?? []).length}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {activeListing ? `${activeListing.status} at ${activeListing.currentCentre?.name}` : "No active listing"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Reports</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{(learner.reports ?? []).length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Setup</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {learner.accountSetupCompletedAt ? "Complete" : "Incomplete"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                <p>Last login: <span className="font-semibold text-slate-900">{learner.lastLoginAt ? formatDate(learner.lastLoginAt) : "Never"}</span></p>
                <p>Mobile consent: <span className="font-semibold text-slate-900">{learner.mobileContactConsentAt ? "Yes" : "No"}</span></p>
                <p>Email verified: <span className="font-semibold text-slate-900">{learner.emailVerifiedAt ? "Yes" : "No"}</span></p>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No learners match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
