/**
 * Repair MMT matches that were created against a DTC shadow listing but were
 * not pushed back to DTC as match.proposed/internal match records.
 *
 * Dry run:
 *   node src/scripts/repair-unlinked-dtc-matches.js
 *
 * Apply:
 *   node src/scripts/repair-unlinked-dtc-matches.js --live
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DTC_API_URL = process.env.DTC_API_URL || "https://www.thedtc.co.uk/api/internal";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const isLive = process.argv.includes("--live");

function asIso(value) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function buildPayload(match, mmtListing, dtcListing) {
  const dtcListingId = dtcListing.dtcListingId || dtcListing.id;

  return {
    matchId: match.id,
    sourcePlatform: "MMT",
    targetPlatform: "DTC",
    sourceListingId: mmtListing.id,
    targetListingId: dtcListingId,
    score: match.score || 0,
    proposedAt: asIso(match.createdAt),
    expiresAt: asIso(match.expiresAt),
    sourceUser: {
      platform: "MMT",
      listingId: mmtListing.id,
      testCentre: mmtListing.currentCentreId,
      testDate: asIso(mmtListing.currentDateTime),
      testType: mmtListing.testType,
      desiredDateFrom: asIso(mmtListing.desiredDateFrom),
      desiredDateTo: asIso(mmtListing.desiredDateTo),
      desiredDirection: mmtListing.desiredDirection,
    },
    targetUser: {
      platform: "DTC",
      listingId: dtcListingId,
      testCentre: dtcListing.currentCentreId,
      testDate: asIso(dtcListing.currentDateTime),
      testType: dtcListing.testType,
      desiredDateFrom: asIso(dtcListing.desiredDateFrom),
      desiredDateTo: asIso(dtcListing.desiredDateTo),
      desiredDirection: dtcListing.desiredDirection,
    },
  };
}

async function sendToDtc(payload) {
  const response = await fetch(`${DTC_API_URL}/matches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": INTERNAL_API_KEY,
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || `HTTP ${response.status}`);
  }
  return body;
}

async function main() {
  if (isLive && !INTERNAL_API_KEY) {
    throw new Error("INTERNAL_API_KEY is required for --live");
  }

  const matches = await prisma.match.findMany({
    where: {
      dtcMatchId: null,
      status: { in: ["PROPOSED", "LEARNER_A_ACCEPTED", "LEARNER_B_ACCEPTED"] },
      OR: [
        { listingA: { source: "DTC" }, listingB: { source: "MMT" } },
        { listingA: { source: "MMT" }, listingB: { source: "DTC" } },
      ],
    },
    include: { listingA: true, listingB: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  console.log(`[Repair] Found ${matches.length} unlinked DTC cross-platform match(es). live=${isLive}`);

  let repaired = 0;
  for (const match of matches) {
    const listingAIsDtc = match.listingA.source === "DTC";
    const dtcListing = listingAIsDtc ? match.listingA : match.listingB;
    const mmtListing = listingAIsDtc ? match.listingB : match.listingA;
    const payload = buildPayload(match, mmtListing, dtcListing);

    console.log(`[Repair] ${match.id}: MMT listing ${mmtListing.id} -> DTC listing ${payload.targetListingId}`);
    if (!isLive) continue;

    const result = await sendToDtc(payload);
    if (result?.matchId) {
      await prisma.match.update({
        where: { id: match.id },
        data: { dtcMatchId: result.matchId },
      });
      repaired++;
      console.log(`[Repair] Linked ${match.id} -> DTC ${result.matchId}`);
    } else {
      console.log(`[Repair] DTC accepted ${match.id}, but did not return matchId`);
    }
  }

  console.log(`[Repair] Complete. repaired=${repaired}`);
}

main()
  .catch((error) => {
    console.error("[Repair] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
