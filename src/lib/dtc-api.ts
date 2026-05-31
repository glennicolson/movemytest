/**
 * Internal API Client for DTC communication
 * Uses API key authentication instead of webhooks
 */

const DTC_API_URL = process.env.DTC_API_URL || "https://www.thedtc.co.uk/api/internal";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

interface MatchPayload {
  matchId: string;
  sourcePlatform: string;
  targetPlatform: string;
  sourceListingId: string;
  targetListingId: string;
  score: number;
  proposedAt: string;
  expiresAt: string;
  sourceUser: {
    platform: string;
    listingId: string;
    testCentre: string;
    testDate: string;
    testType: string;
    desiredDateFrom: string;
    desiredDateTo: string;
    desiredDirection: string;
  };
  targetUser: {
    platform: string;
    listingId: string;
    testCentre: string;
    testDate: string;
    testType: string;
    desiredDateFrom: string;
    desiredDateTo: string;
    desiredDirection: string;
  };
}

/**
 * Send match data to DTC via internal API
 */
export async function sendMatchToDTC(payload: MatchPayload): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  if (!DTC_API_URL || !INTERNAL_API_KEY) {
    console.log("[Internal API] DTC API not configured, skipping");
    return { success: false, error: "DTC API not configured" };
  }

  try {
    const response = await fetch(`${DTC_API_URL}/matches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": INTERNAL_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      console.log(`[Internal API] Match sent to DTC: ${payload.matchId} (status: ${response.status})`);
      return { success: true, statusCode: response.status };
    } else {
      const error = data?.error || `HTTP ${response.status}`;
      console.error(`[Internal API] Failed to send match to DTC: ${error}`);
      return { success: false, error, statusCode: response.status };
    }
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    console.error(`[Internal API] Error sending match to DTC: ${err}`);
    return { success: false, error: err };
  }
}
