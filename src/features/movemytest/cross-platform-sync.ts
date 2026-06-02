/**
 * Cross-platform listing sync utilities for MoveMyTest
 *
 * When a listing is created/updated/deleted on MMT, this pushes a shadow copy
 * to DTC so DTC users can see and match with MMT listings.
 */

const DTC_WEBHOOK_URL = process.env.DTC_WEBHOOK_URL || "https://www.thedtc.co.uk/api/webhooks/mmt";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

interface ListingSyncPayload {
  mmtListingId: string;
  action: "created" | "updated" | "deleted";
  currentCentreId: string;
  originalCentreId?: string | null;
  currentDateTime: string;
  testType: string;
  hasRemainingChange: boolean;
  desiredDateFrom: string;
  desiredDateTo: string;
  desiredTimePreference: string;
  desiredCentreIds: string[];
  desiredDirection: string;
  jurisdiction: string;
  status: string;
  expiresAt: string;
}

interface AcceptanceSyncPayload {
  matchId: string;
  dtcMatchId: string | null;
  acceptedBy: "MMT";
  listingOwnerId: string;
  listingAId: string;
  listingBId: string;
}

interface CallerVolunteerSyncPayload {
  matchId: string;
  dtcMatchId: string | null;
  callerPlatform: "MMT";
  listingAId: string;
  listingBId: string;
}

/**
 * Push an MMT listing to DTC as a shadow record.
 * Called after create/update/delete actions on MMT Listing.
 */
export async function pushListingToDTC(payload: ListingSyncPayload): Promise<{ success: boolean; error?: string }> {
  if (!DTC_WEBHOOK_URL || !INTERNAL_API_KEY) {
    console.log("[MMTCrossSync] DTC webhook or API key not configured, skipping");
    return { success: false, error: "Not configured" };
  }

  try {
    const response = await fetch(DTC_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        event: "listing.synced",
        webhookId: `mmt_sync_${payload.mmtListingId}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    });

    if (response.ok) {
      console.log(`[MMTCrossSync] Listing ${payload.mmtListingId} synced to DTC (${payload.action})`);
      return { success: true };
    }

    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    console.error(`[MMTCrossSync] Failed to sync listing ${payload.mmtListingId}: ${err.error || response.status}`);
    return { success: false, error: err.error || `HTTP ${response.status}` };
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    console.error(`[MMTCrossSync] Error syncing listing ${payload.mmtListingId}: ${err}`);
    return { success: false, error: err };
  }
}

/**
 * Push MMT match acceptance to DTC.
 * Called when an MMT user accepts a match that involves a DTC listing.
 */
export async function pushAcceptanceToDTC(payload: AcceptanceSyncPayload): Promise<void> {
  if (!DTC_WEBHOOK_URL || !INTERNAL_API_KEY) {
    console.log("[MMTCrossSync] DTC webhook or API key not configured, skipping acceptance sync");
    return;
  }

  try {
    const response = await fetch(DTC_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        event: "match.accepted",
        webhookId: `mmt_accept_${payload.matchId}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    });
    if (response.ok) {
      console.log(`[MMTCrossSync] Acceptance for MMT match ${payload.matchId} pushed to DTC (${response.status})`);
    } else {
      const errBody = await response.text().catch(() => "");
      console.error(`[MMTCrossSync] DTC rejected acceptance push for match ${payload.matchId}: HTTP ${response.status} — ${errBody.slice(0, 200)}`);
    }
  } catch (error) {
    console.error(`[MMTCrossSync] Error pushing acceptance to DTC: ${String(error)}`);
  }
}

/**
 * Push MMT DVSA-caller volunteer state to DTC.
 * Called when an MMT user volunteers to make the official DVSA call.
 */
export async function pushCallerVolunteerToDTC(payload: CallerVolunteerSyncPayload): Promise<void> {
  if (!DTC_WEBHOOK_URL || !INTERNAL_API_KEY) {
    console.log("[MMTCrossSync] DTC webhook or API key not configured, skipping caller sync");
    return;
  }

  try {
    const response = await fetch(DTC_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        event: "match.dvsa_caller_volunteered",
        webhookId: `mmt_caller_${payload.matchId}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    });
    if (response.ok) {
      console.log(`[MMTCrossSync] DVSA caller for MMT match ${payload.matchId} pushed to DTC (${response.status})`);
    } else {
      const errBody = await response.text().catch(() => "");
      console.error(`[MMTCrossSync] DTC rejected caller push for match ${payload.matchId}: HTTP ${response.status} — ${errBody.slice(0, 200)}`);
    }
  } catch (error) {
    console.error(`[MMTCrossSync] Error pushing caller volunteer to DTC: ${String(error)}`);
  }
}

interface BookingRefSharedSyncPayload {
  matchId: string;
  dtcMatchId: string | null;
  sharedBy: "MMT";
  listingAId: string;
  listingBId: string;
}

/**
 * Push MMT booking-reference-shared event to DTC.
 * Called when both MMT learners have confirmed their booking references.
 */
export async function pushBookingReferenceSharedToDTC(payload: BookingRefSharedSyncPayload): Promise<void> {
  if (!DTC_WEBHOOK_URL || !INTERNAL_API_KEY) {
    console.log("[MMTCrossSync] DTC webhook or API key not configured, skipping booking-ref sync");
    return;
  }

  try {
    const response = await fetch(DTC_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        event: "match.booking_reference_shared",
        webhookId: `mmt_booking_ref_${payload.matchId}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    });
    if (response.ok) {
      console.log(`[MMTCrossSync] Booking ref shared for MMT match ${payload.matchId} pushed to DTC (${response.status})`);
    } else {
      const errBody = await response.text().catch(() => "");
      console.error(`[MMTCrossSync] DTC rejected booking-ref push for match ${payload.matchId}: HTTP ${response.status} — ${errBody.slice(0, 200)}`);
    }
  } catch (error) {
    console.error(`[MMTCrossSync] Error pushing booking-ref to DTC: ${String(error)}`);
  }
}
