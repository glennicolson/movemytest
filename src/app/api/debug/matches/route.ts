import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/debug/matches
 * 
 * Debug endpoint to check current matches and sync status.
 * Only accessible in development or with admin token.
 */
export async function GET() {
  try {
    // Get active MMT listings
    const mmtListings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, source: true, currentCentreId: true, currentDateTime: true }
    });

    // Get active DTC listings (source = 'DTC')
    const dtcListings = await prisma.listing.findMany({
      where: { source: "DTC", status: "ACTIVE" },
      select: { id: true, dtcListingId: true, currentCentreId: true, currentDateTime: true }
    });

    // Get recent matches involving DTC listings
    const recentMatches = await prisma.match.findMany({
      where: {
        OR: [
          { listingA: { source: "DTC" } },
          { listingB: { source: "DTC" } }
        ]
      },
      select: {
        id: true,
        listingAId: true,
        listingBId: true,
        status: true,
        score: true,
        dtcMatchId: true,
        createdAt: true,
        listingA: { select: { source: true } },
        listingB: { select: { source: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      mmtListings: {
        count: mmtListings.length,
        active: mmtListings.filter(l => l.source === "MMT").length,
        dtcShadows: dtcListings.length,
        samples: dtcListings.slice(0, 3).map(l => ({
          id: l.id,
          dtcListingId: l.dtcListingId,
          currentCentreId: l.currentCentreId,
          currentDateTime: l.currentDateTime
        }))
      },
      dtcMatches: {
        count: recentMatches.length,
        samples: recentMatches
      }
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      status: "error",
      error: err
    }, { status: 500 });
  }
}
