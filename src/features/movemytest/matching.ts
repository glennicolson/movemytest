import { DVSA_LOCATION_RULE_START, isNiMoveMyTestEnabled } from "./constants";
import { hasAtLeastTenFullWorkingDays } from "./working-days";
import { prisma } from "@/lib/db/prisma";

export type MatchListing = {
  id: string;
  userId: string;
  status: "ACTIVE" | string;
  currentCentreId: string;
  originalCentreId?: string | null;
  currentDateTime: Date;
  testType: string;
  hasRemainingChange: boolean;
  desiredDateFrom: Date;
  desiredDateTo: Date;
  desiredTimePreference: "ANY" | "MORNING" | "AFTERNOON" | "EVENING";
  desiredCentreIds: string[];
  desiredDirection: "EARLIER" | "LATER" | "EITHER";
  jurisdiction: "GB_DVSA" | "NI_DVA";
  country?: string | null;
};

export type MatchCentre = {
  id: string;
  nearestCentreIds: string[];
};

export type MatchEvaluation = {
  eligible: boolean;
  score: number;
  reasons: string[];
};

function asTimePreference(date: Date): "MORNING" | "AFTERNOON" | "EVENING" {
  const hour = date.getUTCHours();
  if (hour < 12) return "MORNING";
  if (hour < 17) return "AFTERNOON";
  return "EVENING";
}

function slotSatisfiesPreferences(receiver: MatchListing, offered: MatchListing) {
  const reasons: string[] = [];
  const offeredTime = offered.currentDateTime.getTime();
  if (offeredTime < receiver.desiredDateFrom.getTime() || offeredTime > receiver.desiredDateTo.getTime()) {
    reasons.push(`${receiver.id}: offered date is outside desired range`);
  }

  if (receiver.desiredCentreIds.length > 0 && !receiver.desiredCentreIds.includes(offered.currentCentreId)) {
    reasons.push(`${receiver.id}: offered centre is not in desired centres`);
  }

  if (receiver.desiredTimePreference !== "ANY" && receiver.desiredTimePreference !== asTimePreference(offered.currentDateTime)) {
    reasons.push(`${receiver.id}: offered time is outside desired time preference`);
  }

  if (receiver.desiredDirection === "EARLIER" && offered.currentDateTime >= receiver.currentDateTime) {
    reasons.push(`${receiver.id}: offered slot is not earlier`);
  }

  if (receiver.desiredDirection === "LATER" && offered.currentDateTime <= receiver.currentDateTime) {
    reasons.push(`${receiver.id}: offered slot is not later`);
  }

  return reasons;
}

function centreRulePasses(learner: MatchListing, offered: MatchListing, centres: Map<string, MatchCentre>, now: Date) {
  if (now < DVSA_LOCATION_RULE_START) return true;
  if (learner.currentCentreId === offered.currentCentreId) return true;
  if (learner.originalCentreId && learner.originalCentreId === offered.currentCentreId) return true;
  const centre = centres.get(learner.currentCentreId);
  return Boolean(centre?.nearestCentreIds.slice(0, 3).includes(offered.currentCentreId));
}

function deadlinePenalty(a: MatchListing, b: MatchListing, now: Date) {
  const earliest = a.currentDateTime < b.currentDateTime ? a.currentDateTime : b.currentDateTime;
  const days = Math.max(0, Math.ceil((earliest.getTime() - now.getTime()) / 86_400_000));
  if (days <= 14) return 25;
  if (days <= 21) return 10;
  return 0;
}

function scoreMatch(a: MatchListing, b: MatchListing, centres: Map<string, MatchCentre>, now: Date) {
  let score = 50;
  if (a.desiredCentreIds.includes(b.currentCentreId)) score += 15;
  if (b.desiredCentreIds.includes(a.currentCentreId)) score += 15;
  if (a.currentCentreId === b.currentCentreId) score += 20;

  const aCentre = centres.get(a.currentCentreId);
  const bCentre = centres.get(b.currentCentreId);
  if (aCentre?.nearestCentreIds.slice(0, 3).includes(b.currentCentreId)) score += 8;
  if (bCentre?.nearestCentreIds.slice(0, 3).includes(a.currentCentreId)) score += 8;

  const dateGap = Math.abs(a.currentDateTime.getTime() - b.currentDateTime.getTime()) / 86_400_000;
  score += Math.max(0, 20 - Math.round(dateGap));
  score -= deadlinePenalty(a, b, now);
  return Math.max(0, Math.min(100, score));
}

export function evaluatePotentialMatch(a: MatchListing, b: MatchListing, centres: Map<string, MatchCentre>, now = new Date()): MatchEvaluation {
  const reasons: string[] = [];

  if (a.id === b.id) reasons.push("same listing");
  if (a.userId === b.userId) reasons.push("same learner");
  if (a.status !== "ACTIVE" || b.status !== "ACTIVE") reasons.push("both listings must be active");
  if (!a.hasRemainingChange || !b.hasRemainingChange) reasons.push("both learners need at least 1 remaining allowed change");
  if (a.testType !== b.testType) reasons.push("test types are not compatible");
  if (a.jurisdiction !== b.jurisdiction) reasons.push("jurisdictions are not compatible");
  if (a.jurisdiction === "NI_DVA" && !isNiMoveMyTestEnabled()) reasons.push("NI/DVA live matching is disabled");

  const earliest = a.currentDateTime < b.currentDateTime ? a.currentDateTime : b.currentDateTime;
  if (!hasAtLeastTenFullWorkingDays(now, earliest, a.jurisdiction, a.country ?? undefined)) {
    reasons.push("earliest test is inside the 10 full working day window");
  }

  reasons.push(...slotSatisfiesPreferences(a, b));
  reasons.push(...slotSatisfiesPreferences(b, a));

  if (!centreRulePasses(a, b, centres, now)) reasons.push("location rule fails for learner A");
  if (!centreRulePasses(b, a, centres, now)) reasons.push("location rule fails for learner B");

  return {
    eligible: reasons.length === 0,
    score: reasons.length === 0 ? scoreMatch(a, b, centres, now) : 0,
    reasons,
  };
}

/**
 * Run matching for a freshly created or updated listing.
 * Finds all other active listings, evaluates each pair, and creates eligible match records.
 */
export async function runMatchingForListing(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId, status: "ACTIVE" },
    include: { account: { select: { email: true } } },
  });
  if (!listing) return;

  const candidates = await prisma.listing.findMany({
    where: {
      id: { not: listingId },
      status: "ACTIVE",
      accountId: { not: listing.accountId },
    },
    include: { account: { select: { email: true } } },
  });

  const centres = await prisma.testCentre.findMany({
    select: { id: true },
  });
  const centreMap = new Map(
    centres.map((c) => [c.id, { id: c.id, nearestCentreIds: [] as string[] }]),
  );

  const now = new Date();
  const myListing: MatchListing = {
    id: listing.id,
    userId: listing.accountId ?? listing.id,
    status: listing.status,
    currentCentreId: listing.currentCentreId,
    originalCentreId: listing.originalCentreId,
    currentDateTime: listing.currentDateTime,
    testType: listing.testType,
    hasRemainingChange: listing.hasRemainingChange,
    desiredDateFrom: listing.desiredDateFrom,
    desiredDateTo: listing.desiredDateTo,
    desiredTimePreference: listing.desiredTimePreference as "ANY" | "MORNING" | "AFTERNOON" | "EVENING",
    desiredCentreIds: Array.isArray(listing.desiredCentreIds) ? listing.desiredCentreIds.filter((item): item is string => typeof item === "string") : [],
    desiredDirection: listing.desiredDirection as "EARLIER" | "LATER" | "EITHER",
    jurisdiction: listing.jurisdiction as "GB_DVSA" | "NI_DVA",
  };

  for (const candidate of candidates) {
    const candidateListing: MatchListing = {
      id: candidate.id,
      userId: candidate.accountId ?? candidate.id,
      status: candidate.status,
      currentCentreId: candidate.currentCentreId,
      originalCentreId: candidate.originalCentreId,
      currentDateTime: candidate.currentDateTime,
      testType: candidate.testType,
      hasRemainingChange: candidate.hasRemainingChange,
      desiredDateFrom: candidate.desiredDateFrom,
      desiredDateTo: candidate.desiredDateTo,
      desiredTimePreference: candidate.desiredTimePreference as "ANY" | "MORNING" | "AFTERNOON" | "EVENING",
      desiredCentreIds: Array.isArray(candidate.desiredCentreIds) ? candidate.desiredCentreIds.filter((item): item is string => typeof item === "string") : [],
      desiredDirection: candidate.desiredDirection as "EARLIER" | "LATER" | "EITHER",
      jurisdiction: candidate.jurisdiction as "GB_DVSA" | "NI_DVA",
    };

    const evaluation = evaluatePotentialMatch(myListing, candidateListing, centreMap, now);

    if (evaluation.eligible) {
// Check if a match already exists between these two listings
      const existing = await prisma.match.findFirst({
        where: {
          OR: [
            { listingAId: listing.id, listingBId: candidate.id },
            { listingAId: candidate.id, listingBId: listing.id },
          ],
        },
      });
      if (existing) continue;

      await prisma.match.create({
        data: {
          listingAId: listing.id,
          listingBId: candidate.id,
          score: evaluation.score,
          status: "PROPOSED",
          qualitySummary: `Match score ${evaluation.score}/100`,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day expiry
        },
      });
    }
  }
}
