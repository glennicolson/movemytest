import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/debug/trigger-match
 * 
 * Trigger matching for a specific listing to test webhook firing.
 * Only accessible in development.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ status: "error", error: "listingId required" }, { status: 400 });
    }

    // Get the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ status: "error", error: "Listing not found" }, { status: 404 });
    }

    // Get candidates
    const candidates = await prisma.listing.findMany({
      where: {
        id: { not: listingId },
        status: "ACTIVE",
      },
    });

    // Find matches
    const matches = [];
    for (const candidate of candidates) {
      // Compatibility check:
      // - If listing wants EARLIER and candidate wants LATER: listing.date > candidate.date
      // - If listing wants LATER and candidate wants EARLIER: listing.date < candidate.date
      const listingWantsEarlier = listing.desiredDirection === "EARLIER";
      const listingWantsLater = listing.desiredDirection === "LATER";
      const candidateWantsEarlier = candidate.desiredDirection === "EARLIER";
      const candidateWantsLater = candidate.desiredDirection === "LATER";
      
      const compatible = (listingWantsEarlier && candidateWantsLater && listing.currentDateTime > candidate.currentDateTime) ||
                        (listingWantsLater && candidateWantsEarlier && listing.currentDateTime < candidate.currentDateTime);

      if (compatible) {
        // Check if match exists
        const existing = await prisma.match.findFirst({
          where: {
            OR: [
              { listingAId: listing.id, listingBId: candidate.id },
              { listingAId: candidate.id, listingBId: listing.id },
            ],
          },
        });

        if (!existing) {
          // Create match
          const newMatch = await prisma.match.create({
            data: {
              listingAId: listing.id,
              listingBId: candidate.id,
              score: 100,
              status: "PROPOSED",
              qualitySummary: "Test match from debug endpoint",
              expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          });

          // Send webhook if candidate is DTC
          let webhookResult = null;
          if (candidate.source === "DTC") {
            try {
              const { notifyDtcOfMatchProposed } = await import("@/features/movemytest/webhooks");
              webhookResult = await notifyDtcOfMatchProposed(
                newMatch.id,
                {
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
                  desiredTimePreference: listing.desiredTimePreference,
                  desiredCentreIds: Array.isArray(listing.desiredCentreIds) ? (listing.desiredCentreIds as string[]) : [],
                  desiredDirection: listing.desiredDirection,
                  jurisdiction: listing.jurisdiction,
                },
                {
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
                  desiredTimePreference: candidate.desiredTimePreference,
                  desiredCentreIds: Array.isArray(candidate.desiredCentreIds) ? (candidate.desiredCentreIds as string[]) : [],
                  desiredDirection: candidate.desiredDirection,
                  jurisdiction: candidate.jurisdiction,
                  dtcListingId: candidate.dtcListingId,
                },
                100
              );
            } catch (err) {
              webhookResult = { success: false, error: String(err) };
            }
          }

          matches.push({
            matchId: newMatch.id,
            candidateId: candidate.id,
            candidateSource: candidate.source,
            webhookResult,
          });
        }
      }
    }

    return NextResponse.json({
      status: "ok",
      listingId,
      candidatesChecked: candidates.length,
      matchesCreated: matches.length,
      matches,
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "error", error: err }, { status: 500 });
  }
}
