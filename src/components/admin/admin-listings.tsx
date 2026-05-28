"use client";

import { useState, useMemo } from "react";
import { Search, BookOpenCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "./status-pill";
import type { Listing } from "./types";

function formatDateTime(value?: Date | string | null) {
  if (!value) return "Not set";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "Invalid" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Europe/London" }).format(d);
}

function formatDate(value?: Date | string | null) {
  if (!value) return "Not set";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "Invalid" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d);
}

function humanise(value?: string | null) {
  return value ? value.toLowerCase().replaceAll("_", " ") : "not set";
}

function maskEmail(value?: string | null) {
  if (!value) return "Unknown";
  const [name, domain] = value.split("@");
  if (!domain) return value;
  return `${name.slice(0, 2)}•••@${domain}`;
}

function maskAdi(value?: string | null) {
  if (!value) return "Not provided";
  const normalized = value.trim().replace(/\s+/g, "").toUpperCase();
  if (normalized.length <= 4) return "••••";
  return `${normalized.slice(0, 2)}••••${normalized.slice(-2)}`;
}

export function AdminListings({ listings }: { listings: Listing[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return listings;
    const q = search.toLowerCase();
    return listings.filter(
      (l) =>
        l.account?.email?.toLowerCase().includes(q) ||
        l.currentCentre?.name?.toLowerCase().includes(q) ||
        l.status?.toLowerCase().includes(q)
    );
  }, [listings, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return counts;
  }, [listings]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {humanise(status)}: {count}
          </div>
        ))}
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, centre, or status…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3">Learner</th>
                <th>Current test</th>
                <th>Desired window</th>
                <th>Instructor</th>
                <th>Availability</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((listing) => {
                const instructor = listing.instructorDetails;
                const currentDecision = instructor?.availabilityDecisions?.find(
                  (d) => d.slotType === "CURRENT_TEST" && !d.matchId
                );
                return (
                  <tr key={listing.id} className="border-b align-top last:border-0">
                    <td className="py-4">
                      <p className="font-semibold text-slate-950">
                        {maskEmail(listing.account?.email)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {listing.account?.mobileNumber ?? "No mobile"}
                      </p>
                    </td>
                    <td>
                      <p className="font-medium text-slate-900">{listing.currentCentre?.name}</p>
                      <p className="text-xs text-slate-600">{formatDateTime(listing.currentDateTime)}</p>
                    </td>
                    <td>
                      <p>{humanise(listing.desiredDirection)}</p>
                      <p className="text-xs text-slate-600">
                        {formatDate(listing.desiredDateFrom)} → {formatDate(listing.desiredDateTo)}
                      </p>
                    </td>
                    <td>
                      {instructor ? (
                        <>
                          <p className="font-medium text-slate-900">
                            {instructor.firstName} {instructor.lastName}
                          </p>
                          <p className="text-xs text-slate-600">
                            ADI {maskAdi(instructor.adiNumber)} · {instructor.instructorAccount ? "registered" : "invited"}
                          </p>
                        </>
                      ) : (
                        <span className="text-slate-500">No instructor linked</span>
                      )}
                    </td>
                    <td>
                      {currentDecision ? (
                        <>
                          <StatusPill status={currentDecision.status} />
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(currentDecision.decidedAt)}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500">No current-slot decision</span>
                      )}
                    </td>
                    <td>
                      <StatusPill status={listing.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">No listings match your search.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
