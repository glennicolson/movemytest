import { prisma } from "@/lib/db/prisma";
import { hasMatchExpired } from "./business-days";
import { aggregatePassRates, getCentreLocality, getPassRateForCentre, REGION_DISPLAY_META } from "./locality";

function enrichCentre<T extends { id: string; name: string; slug: string; region: string; postcode: string | null; activeSwapCount?: number; addressLine1?: string | null; latitude?: number | null; longitude?: number | null }>(centre: T) {
  const locality = getCentreLocality(centre.name, centre.region);
  const passRate = getPassRateForCentre(centre.slug, centre.name);
  return { ...centre, locality, passRate };
}

function haversineDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusMiles = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function normalizeNearbyDistanceMiles(
  storedDistance: unknown,
  centre: { latitude: unknown; longitude: unknown },
  neighbour: { latitude: unknown; longitude: unknown },
) {
  const parsedStoredDistance = storedDistance == null ? null : Number(storedDistance);
  if (parsedStoredDistance !== null && Number.isFinite(parsedStoredDistance) && parsedStoredDistance > 0) {
    return Math.round(parsedStoredDistance * 10) / 10;
  }

  const centreLatitude = centre.latitude == null ? null : Number(centre.latitude);
  const centreLongitude = centre.longitude == null ? null : Number(centre.longitude);
  const neighbourLatitude = neighbour.latitude == null ? null : Number(neighbour.latitude);
  const neighbourLongitude = neighbour.longitude == null ? null : Number(neighbour.longitude);

  if (
    centreLatitude == null ||
    centreLongitude == null ||
    neighbourLatitude == null ||
    neighbourLongitude == null ||
    !Number.isFinite(centreLatitude) ||
    !Number.isFinite(centreLongitude) ||
    !Number.isFinite(neighbourLatitude) ||
    !Number.isFinite(neighbourLongitude)
  ) {
    return null;
  }

  return Math.round(haversineDistanceMiles(centreLatitude, centreLongitude, neighbourLatitude, neighbourLongitude) * 10) / 10;
}

export async function getActiveTestCentres() {
  return prisma.testCentre.findMany({
    where: { latitude: { not: null } },
    orderBy: [{ region: "asc" }, { name: "asc" }],
  });
}

export async function getMoveMyTestDirectorySummary() {
  const [centres, groupedListings] = await Promise.all([
    prisma.testCentre.findMany({
      where: { latitude: { not: null } },
      orderBy: [{ region: "asc" }, { name: "asc" }],
    }),
    prisma.listing.groupBy({
      by: ["currentCentreId"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }).catch(() => []),
  ]);

  const counts = new Map(groupedListings.map((row) => [row.currentCentreId, row._count._all]));
  const centresWithCounts = centres.map((centre) => enrichCentre({ ...centre, activeSwapCount: counts.get(centre.id) ?? 0 }));
  const regions = Array.from(new Map(centresWithCounts.map((centre) => [centre.region ?? "unknown", centre.region ?? "Unknown Region"])).entries())
    .map(([slug, name]) => {
      const regionCentres = centresWithCounts.filter((centre) => (centre.region ?? "unknown") === slug);
      const countySummaries = Array.from(new Map(regionCentres.map((centre) => [centre.locality.countySlug, centre.locality])).values())
        .map((locality) => {
          const countyCentres = regionCentres.filter((centre) => centre.locality.countySlug === locality.countySlug);
          return {
            ...locality,
            centreCount: countyCentres.length,
            activeSwapCount: countyCentres.reduce((sum, centre) => sum + centre.activeSwapCount, 0),
            aggregatePassRate: aggregatePassRates(countyCentres),
          };
        })
        .sort((a, b) => (b.countyPopulation ?? 0) - (a.countyPopulation ?? 0) || a.county.localeCompare(b.county));
      return {
        slug,
        name,
        centreCount: regionCentres.length,
        activeSwapCount: regionCentres.reduce((sum, centre) => sum + centre.activeSwapCount, 0),
        aggregatePassRate: aggregatePassRates(regionCentres),
        countySummaries,
        displayMeta: REGION_DISPLAY_META[slug],
      };
    })
    .sort((a, b) => (a.displayMeta?.populationRank ?? 999) - (b.displayMeta?.populationRank ?? 999) || a.name.localeCompare(b.name));

  return { centres: centresWithCounts, regions };
}

export async function getRegionOrCentreBySlug(rawSlug: string) {
  const slug = decodeURIComponent(rawSlug);
  const summary = await getMoveMyTestDirectorySummary();
  const region = summary.regions.find((item) => item.slug === slug);
  if (region) {
    return {
      kind: "region" as const,
      region,
      centres: summary.centres.filter((centre) => (centre.region ?? "unknown") === slug),
    };
  }

  const centre = summary.centres.find((item) => item.slug === slug);
  if (centre) {
    // Compute nearby centres by distance (up to 25 miles, max 8)
    const nearby = summary.centres
      .filter((c) => c.id !== centre.id && c.latitude != null && c.longitude != null && centre.latitude != null && centre.longitude != null)
      .map((c) => ({
        ...c,
        distanceMiles: haversineDistanceMiles(
          Number(centre.latitude),
          Number(centre.longitude),
          Number(c.latitude),
          Number(c.longitude),
        ),
      }))
      .filter((c) => c.distanceMiles <= 25)
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .slice(0, 8)
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        distanceMiles: Math.round(c.distanceMiles * 10) / 10,
      }));

    return {
      kind: "centre" as const,
      centre,
      nearby,
    };
  }

  return null;
}

export async function getLearnerMoveMyTestDashboard(accountId: string) {
  const now = new Date();

// Safety net: if a MATCHED listing has only COMPLETED matches, mark it COMPLETED
  const staleMatchedListings = await prisma.listing.findMany({
    where: { accountId, status: "MATCHED" },
    select: { id: true },
  });
  if (staleMatchedListings.length) {
    const staleIds = staleMatchedListings.map(l => l.id);
    const matchesForStale = await prisma.match.findMany({
      where: {
        status: "COMPLETED",
        OR: [{ listingAId: { in: staleIds } }, { listingBId: { in: staleIds } }],
      },
      select: { listingAId: true, listingBId: true },
    });
    const completedListingIds = new Set<string>();
    for (const m of matchesForStale) {
      completedListingIds.add(m.listingAId);
      completedListingIds.add(m.listingBId);
    }
    const idsToComplete = staleIds.filter(id => completedListingIds.has(id));
    if (idsToComplete.length) {
      await prisma.listing.updateMany({
        where: { id: { in: idsToComplete } },
        data: { status: "COMPLETED" },
      });
    }
  }

  await prisma.listing.updateMany({
    where: { accountId, status: { in: ["ACTIVE", "PAUSED", "MATCHED"] }, currentDateTime: { lt: now } },
    data: { status: "EXPIRED" },
  });
  await prisma.match.updateMany({
    where: {
      status: "BOOKING_REFERENCE_SHARED",
      callWindowExpiresAt: { lt: now },
      learnerACompletedAt: null,
      learnerBCompletedAt: null,
      OR: [{ listingA: { accountId } }, { listingB: { accountId } }],
    },
    data: { status: "EXPIRED", cancelledAt: now, cancelReason: "DVSA call window expired before either learner marked the match complete." },
  });
// Lazy expiry: expire any PROPOSED matches past their 2-business-day deadline
// Primary: matches with expiresAt field set (new matches)
  await prisma.match.updateMany({
    where: {
      status: "PROPOSED",
      expiresAt: { lt: now },
      OR: [{ listingA: { accountId } }, { listingB: { accountId } }],
    },
    data: { status: "EXPIRED", cancelledAt: now, cancelReason: "Match expired after 2 business days with no acceptance." },
  });
// Fallback: old PROPOSED matches without expiresAt — check createdAt against 2 business days
  const oldProposedMatches = await prisma.match.findMany({
    where: {
      status: "PROPOSED",
      OR: [{ listingA: { accountId } }, { listingB: { accountId } }],
    },
    select: { id: true, createdAt: true, expiresAt: true },
  });
  const expiredOldIds = oldProposedMatches
    .filter((m) => m.expiresAt === null && hasMatchExpired(m.createdAt))
    .map((m) => m.id);
  if (expiredOldIds.length > 0) {
    await prisma.match.updateMany({
      where: { id: { in: expiredOldIds } },
      data: { status: "EXPIRED", cancelledAt: now, cancelReason: "Match expired after 2 business days with no acceptance." },
    });
  }
  await prisma.match.updateMany({
    where: {
      archivedAt: null,
      OR: [
        { listingA: { accountId, currentDateTime: { lt: now } } },
        { listingB: { accountId, currentDateTime: { lt: now } } },
      ],
    },
    data: { archivedAt: now },
  });

  const listing = await prisma.listing.findFirst({
    where: { accountId, status: { in: ["ACTIVE", "PAUSED", "MATCHED", "COMPLETED"] } },
    orderBy: { createdAt: "desc" },
    include: {
      account: { select: { email: true, mobileNumber: true, marketingConsentAt: true, accountSetupCompletedAt: true } },
      currentCentre: true,
      originalCentre: true,
      instructorDetails: { include: { availabilityDecisions: { orderBy: { decidedAt: "desc" }, take: 20 } } },
      listingAMatches: {
        where: {
          status: { notIn: ["DECLINED", "EXPIRED", "REPORTED", "COMPLETED"] },
          listingB: { status: { not: "DELETED" } },
        },
        include: { listingB: { include: { currentCentre: true } }, secrets: true },
        orderBy: { createdAt: "desc" },
      },
      listingBMatches: {
        where: {
          status: { notIn: ["DECLINED", "EXPIRED", "REPORTED", "COMPLETED"] },
          listingA: { status: { not: "DELETED" } },
        },
        include: { listingA: { include: { currentCentre: true } }, secrets: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!listing) return { listing: null, desiredCentres: [], matches: [], history: [] };

  const desiredCentreIds = Array.isArray(listing.desiredCentreIds)
    ? listing.desiredCentreIds.filter((item): item is string => typeof item === "string")
    : [];
  const desiredCentres = desiredCentreIds.length
    ? await prisma.testCentre.findMany({
        where: { id: { in: desiredCentreIds } },
        orderBy: [{ region: "asc" }, { name: "asc" }],
        select: { id: true, name: true, region: true, postcode: true },
      })
    : [];

  const matches = [
    ...listing.listingAMatches.map((match) => ({ match, otherListing: match.listingB, otherCentre: match.listingB.currentCentre })),
    ...listing.listingBMatches.map((match) => ({ match, otherListing: match.listingA, otherCentre: match.listingA.currentCentre })),
  ];

  const history = await prisma.listing.findMany({
    where: { accountId },
    include: { currentCentre: true, originalCentre: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return { listing, desiredCentres, matches, history };
}

export async function getPrivateMatch(matchId: string, accountId: string) {
  const now = new Date();
// Allow viewing DECLINED/EXPIRED matches for audit/context, but filter them from active lists
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ listingA: { accountId } }, { listingB: { accountId } }],
      listingA: { status: { not: "DELETED" } },
      listingB: { status: { not: "DELETED" } },
    },
    include: {
      listingA: { include: { currentCentre: true, originalCentre: true, account: { select: { id: true, email: true, mobileNumber: true } } } },
      listingB: { include: { currentCentre: true, originalCentre: true, account: { select: { id: true, email: true, mobileNumber: true } } } },
      events: { orderBy: { createdAt: "desc" }, take: 20 },
      secrets: true,
    },
  });
  if (match && match.status === "PROPOSED") {
    const isExpired = match.expiresAt
      ? match.expiresAt < now
      : hasMatchExpired(match.createdAt);
    if (isExpired) {
      await prisma.match.update({
        where: { id: match.id },
        data: { status: "EXPIRED", cancelledAt: now, cancelReason: "Match expired after 2 business days with no acceptance." },
      });
      return null;
    }
  }
  return match;
}
