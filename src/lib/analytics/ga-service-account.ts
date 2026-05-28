import { BetaAnalyticsDataClient } from "@google-analytics/data";

let client: BetaAnalyticsDataClient | null = null;

function getPropertyId(): string {
  const id = process.env.GA_PROPERTY_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) {
    throw new Error("GA_PROPERTY_ID or NEXT_PUBLIC_GA_MEASUREMENT_ID is not set.");
  }
// Strip 'G-' prefix if present for the API
  return id.replace(/^G-/, "");
}

export function getGaClient(): BetaAnalyticsDataClient {
  if (!client) {
    const rawJson = process.env.GA_SERVICE_ACCOUNT_JSON;
    if (rawJson) {
      const credentials = JSON.parse(rawJson);
      client = new BetaAnalyticsDataClient({ credentials });
    } else {
// Fallback: uses GOOGLE_APPLICATION_CREDENTIALS env or ADC
      client = new BetaAnalyticsDataClient();
    }
  }
  return client;
}

export function getGaPropertyId(): string {
  return getPropertyId();
}
