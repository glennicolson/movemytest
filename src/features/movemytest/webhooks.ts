import type { MatchListing } from "./matching";
import { sendMatchToDTC } from "@/lib/dtc-api";

/**
 * Send match.proposed to DTC via internal API
 */
export async function notifyDtcOfMatchProposed(
  mmtMatchId: string,
  mmtListing: MatchListing,
  dtcListing: MatchListing & { dtcListingId?: string | null },
  score: number
): Promise<{ success: boolean; error?: string }> {
  const dtcListingId = dtcListing.dtcListingId || dtcListing.id;

  const result = await sendMatchToDTC({
    matchId: mmtMatchId,
    sourcePlatform: "MMT",
    targetPlatform: "DTC",
    sourceListingId: mmtListing.id,
    targetListingId: dtcListingId,
    score,
    proposedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    sourceUser: {
      platform: "MMT",
      listingId: mmtListing.id,
      testCentre: mmtListing.currentCentreId,
      testDate: mmtListing.currentDateTime.toISOString(),
      testType: mmtListing.testType,
      desiredDateFrom: mmtListing.desiredDateFrom.toISOString(),
      desiredDateTo: mmtListing.desiredDateTo.toISOString(),
      desiredDirection: mmtListing.desiredDirection,
    },
    targetUser: {
      platform: "DTC",
      listingId: dtcListingId,
      testCentre: dtcListing.currentCentreId,
      testDate: dtcListing.currentDateTime.toISOString(),
      testType: dtcListing.testType,
      desiredDateFrom: dtcListing.desiredDateFrom.toISOString(),
      desiredDateTo: dtcListing.desiredDateTo.toISOString(),
      desiredDirection: dtcListing.desiredDirection,
    },
  });

  return { success: result.success, error: result.error };
}
