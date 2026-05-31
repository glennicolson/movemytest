import { sendWebhook, generateWebhookId, isWebhookTimestampValid } from "@/lib/webhook";
import type { MatchListing } from "./matching";

const DTC_WEBHOOK_URL = process.env.DTC_WEBHOOK_URL;
const DTC_WEBHOOK_SECRET = process.env.DTC_WEBHOOK_SECRET;

/**
 * Send match.proposed webhook to DTC when MMT user matches with DTC listing
 */
export async function notifyDtcOfMatchProposed(
  mmtMatchId: string,
  mmtListing: MatchListing,
  dtcListing: MatchListing,
  score: number
): Promise<{ success: boolean; error?: string }> {
  if (!DTC_WEBHOOK_URL || !DTC_WEBHOOK_SECRET) {
    console.log("[Webhook] DTC webhook not configured, skipping notification");
    return { success: false, error: "DTC webhook not configured" };
  }

  const payload = {
    event: "match.proposed" as const,
    timestamp: new Date().toISOString(),
    webhookId: generateWebhookId(),
    data: {
      matchId: mmtMatchId,
      sourcePlatform: "MMT",
      targetPlatform: "DTC",
      sourceListingId: mmtListing.id,
      targetListingId: dtcListing.id,
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
        listingId: dtcListing.id,
        testCentre: dtcListing.currentCentreId,
        testDate: dtcListing.currentDateTime.toISOString(),
        testType: dtcListing.testType,
        desiredDateFrom: dtcListing.desiredDateFrom.toISOString(),
        desiredDateTo: dtcListing.desiredDateTo.toISOString(),
        desiredDirection: dtcListing.desiredDirection,
      },
    },
  };

  const result = await sendWebhook(DTC_WEBHOOK_URL, DTC_WEBHOOK_SECRET, payload);

  if (result.success) {
    console.log(`[Webhook] Notified DTC of match ${mmtMatchId} (status: ${result.statusCode})`);
  } else {
    console.error(`[Webhook] Failed to notify DTC of match ${mmtMatchId}: ${result.error}`);
  }

  return { success: result.success, error: result.error };
}

/**
 * Send match.accepted webhook to DTC
 */
export async function notifyDtcOfMatchAccepted(
  mmtMatchId: string,
  acceptedBy: "MMT" | "DTC",
  dtcListingId: string
): Promise<{ success: boolean; error?: string }> {
  if (!DTC_WEBHOOK_URL || !DTC_WEBHOOK_SECRET) {
    return { success: false, error: "DTC webhook not configured" };
  }

  const payload = {
    event: "match.accepted" as const,
    timestamp: new Date().toISOString(),
    webhookId: generateWebhookId(),
    data: {
      matchId: mmtMatchId,
      sourcePlatform: "MMT",
      targetPlatform: "DTC",
      acceptedBy,
      targetListingId: dtcListingId,
      acceptedAt: new Date().toISOString(),
    },
  };

  const result = await sendWebhook(DTC_WEBHOOK_URL, DTC_WEBHOOK_SECRET, payload);
  return { success: result.success, error: result.error };
}

/**
 * Send match.cancelled webhook to DTC
 */
export async function notifyDtcOfMatchCancelled(
  mmtMatchId: string,
  dtcListingId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!DTC_WEBHOOK_URL || !DTC_WEBHOOK_SECRET) {
    return { success: false, error: "DTC webhook not configured" };
  }

  const payload = {
    event: "match.cancelled" as const,
    timestamp: new Date().toISOString(),
    webhookId: generateWebhookId(),
    data: {
      matchId: mmtMatchId,
      sourcePlatform: "MMT",
      targetPlatform: "DTC",
      targetListingId: dtcListingId,
      cancelledAt: new Date().toISOString(),
      reason,
    },
  };

  const result = await sendWebhook(DTC_WEBHOOK_URL, DTC_WEBHOOK_SECRET, payload);
  return { success: result.success, error: result.error };
}

/**
 * Send match.booking_reference_shared webhook to DTC
 */
export async function notifyDtcOfBookingReferenceShared(
  mmtMatchId: string,
  dtcListingId: string,
  sharedBy: "MMT" | "DTC"
): Promise<{ success: boolean; error?: string }> {
  if (!DTC_WEBHOOK_URL || !DTC_WEBHOOK_SECRET) {
    return { success: false, error: "DTC webhook not configured" };
  }

  const payload = {
    event: "match.booking_reference_shared" as const,
    timestamp: new Date().toISOString(),
    webhookId: generateWebhookId(),
    data: {
      matchId: mmtMatchId,
      sourcePlatform: "MMT",
      targetPlatform: "DTC",
      targetListingId: dtcListingId,
      sharedBy,
      sharedAt: new Date().toISOString(),
    },
  };

  const result = await sendWebhook(DTC_WEBHOOK_URL, DTC_WEBHOOK_SECRET, payload);
  return { success: result.success, error: result.error };
}

/**
 * Send match.completed webhook to DTC
 */
export async function notifyDtcOfMatchCompleted(
  mmtMatchId: string,
  dtcListingId: string
): Promise<{ success: boolean; error?: string }> {
  if (!DTC_WEBHOOK_URL || !DTC_WEBHOOK_SECRET) {
    return { success: false, error: "DTC webhook not configured" };
  }

  const payload = {
    event: "match.completed" as const,
    timestamp: new Date().toISOString(),
    webhookId: generateWebhookId(),
    data: {
      matchId: mmtMatchId,
      sourcePlatform: "MMT",
      targetPlatform: "DTC",
      targetListingId: dtcListingId,
      completedAt: new Date().toISOString(),
    },
  };

  const result = await sendWebhook(DTC_WEBHOOK_URL, DTC_WEBHOOK_SECRET, payload);
  return { success: result.success, error: result.error };
}
