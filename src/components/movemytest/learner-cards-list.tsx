// @ts-nocheck

"use client";

import { useState } from "react";
import { StatusPill } from "@/components/movemytest/status-pill";
import { DIRECTION_LABELS } from "@/features/movemytest/constants";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Europe/London" }).format(value);
}

function humanise(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

function availabilityTone(status?: string) {
  if (status === "AVAILABLE") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "UNAVAILABLE") return "border-red-200 bg-red-50 text-red-800";
  if (status === "NEEDS_DISCUSSION") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function latestAvailability(
  decisions: any[],
  slotType: "CURRENT_TEST" | "PROPOSED_SWAP",
  matchId?: string
) {
  return decisions.find(
    (d) => d.slotType === slotType && (slotType === "CURRENT_TEST" ? !d.matchId : d.matchId === matchId)
  );
}

function desiredCentreIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function AvailabilityBadge({ label, decision }: { label: string; decision?: any }) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${availabilityTone(decision?.status)}`}>
      {label ? <p className="uppercase tracking-[0.14em] opacity-80">{label}</p> : null}
      <p className="mt-1 capitalize">{decision ? humanise(decision.status) : "No decision recorded"}</p>
      {decision?.decidedAt ? <p className="mt-1 font-normal opacity-80">Recorded {formatDateTime(decision.decidedAt)}</p> : null}
      {decision?.note ? <p className="mt-1 font-normal opacity-90">"{decision.note}"</p> : null}
    </div>
  );
}

import { recordMoveMyTestInstructorAvailabilityAction } from "@/features/movemytest/instructor-actions";

function AvailabilityForm({
  listingInstructorId,
  matchId,
  slotType,
  compact = false,
}: {
  listingInstructorId: string;
  matchId?: string;
  slotType: "CURRENT_TEST" | "PROPOSED_SWAP";
  compact?: boolean;
}) {
  return (
    <form action={recordMoveMyTestInstructorAvailabilityAction} className={`mt-3 grid gap-3 ${compact ? "" : "lg:grid-cols-[1fr_auto] lg:items-end"}`}>
      <input type="hidden" name="listingInstructorId" value={listingInstructorId} />
      <input type="hidden" name="slotType" value={slotType} />
      {matchId ? <input type="hidden" name="matchId" value={matchId} /> : null}
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Decision
          <select name="status" defaultValue="AVAILABLE" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-900">
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
            <option value="NEEDS_DISCUSSION">Needs discussion</option>
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Optional note
          <input name="note" maxLength={1000} placeholder="e.g. Can do this slot" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-900" />
        </label>
      </div>
      <button className="w-full rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto">Save</button>
    </form>
  );
}

const priorityConfig: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: "Action needed", color: "text-red-800", bg: "bg-red-50 border-red-200" },
  1: { label: "Call window active", color: "text-amber-800", bg: "bg-amber-50 border-amber-200" },
  2: { label: "Match accepted", color: "text-orange-800", bg: "bg-orange-50 border-orange-200" },
  3: { label: "Match proposed", color: "text-blue-800", bg: "bg-blue-50 border-blue-200" },
  4: { label: "Active", color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
  5: { label: "Paused", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
  6: { label: "History only", color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
};

export function LearnerCardsList({ data }: { data: any }) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleHistory = (id: string) => {
    setShowHistory((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {data.learnerCards.map((card) => {
        const config = priorityConfig[card.priority] ?? priorityConfig[6];
        const isExpanded = expandedCards.has(card.learnerId);
        const historyVisible = showHistory.has(card.learnerId);
        const link = card.activeLink;
        const hasSelfCertified = card.activeMatches.some((m) => m.instructorSelfCertified);

        return (
          <article key={card.learnerId} className={`rounded-2xl border ${config.bg} overflow-hidden transition`}>
            {/* Compact header */}
            <div
              className="cursor-pointer p-4 hover:bg-white/50 transition"
              onClick={() => toggleExpand(card.learnerId)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color} bg-white/80 ring-1 ring-slate-200`}>
                      {config.label}
                    </span>
                    {hasSelfCertified && (
                      <span className="text-xs text-emerald-700">✓ Spoke to instructor</span>
                    )}
                  </div>
                  <p className="mt-1.5 font-semibold text-slate-950 truncate">{card.email}</p>
                  {link ? (
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-600">
                      <span>
                        Test: {link.listing.currentCentre.name} · {formatDateTime(link.listing.currentDateTime)}
                      </span>
                      <span>
                        {DIRECTION_LABELS[link.listing.desiredDirection]} · {formatDate(link.listing.desiredDateFrom)} – {formatDate(link.listing.desiredDateTo)}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">No active listing</p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {card.activeMatches.length} match{card.activeMatches.length !== 1 ? "es" : ""}
                  </span>
                  {card.historyLinks.length > 0 && (
                    <span className="text-xs text-slate-400">{card.historyLinks.length} old</span>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded detail */}
            {isExpanded && link && (
              <div className="border-t border-slate-200 bg-white p-4 space-y-4">
                {/* Desired centres */}
                {(() => {
                  const centreNames = desiredCentreIds(link.listing.desiredCentreIds)
                    .map((id) => data.desiredCentreMap.get(id))
                    .filter(Boolean);
                  if (!centreNames.length) return null;
                  return (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
                        Desired centres
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {centreNames.map((c) => (
                          <span
                            key={c!.id}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-700"
                          >
                            {c!.name}
                            {c!.postcode ? ` · ${c!.postcode}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Current test availability */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">Current test availability</p>
                    <AvailabilityBadge label="" decision={latestAvailability(link.availabilityDecisions, "CURRENT_TEST")} />
                  </div>
                  <AvailabilityForm listingInstructorId={link.id} slotType="CURRENT_TEST" />
                </div>

                {/* Matches */}
                {card.activeMatches.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Matches ({card.activeMatches.length})
                    </p>
                    {card.activeMatches.map((match) => (
                      <div key={match.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-950 truncate">{match.otherCentre}</p>
                            <p className="text-xs text-slate-600">
                              {formatDateTime(match.otherDateTime)} · Score {match.score}/100
                            </p>
                            {match.instructorSelfCertified && (
                              <p className="text-xs text-emerald-700 mt-0.5">
                                Learner confirmed they spoke to you ✓
                              </p>
                            )}
                          </div>
                          <StatusPill status={match.status} />
                        </div>
                        <AvailabilityForm
                          listingInstructorId={link.id}
                          matchId={match.id}
                          slotType="PROPOSED_SWAP"
                          compact
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* History */}
                {card.historyLinks.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHistory(card.learnerId);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      {historyVisible ? "▲ Hide" : "▼ Show"} history ({card.historyLinks.length} previous listing
                      {card.historyLinks.length !== 1 ? "s" : ""})
                    </button>
                    {historyVisible && (
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {card.historyLinks.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-1.5 text-xs"
                          >
                            <span className="text-slate-600">
                              {h.listing.currentCentre.name} · {formatDate(h.listing.currentDateTime)}
                            </span>
                            <StatusPill status={h.listing.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
