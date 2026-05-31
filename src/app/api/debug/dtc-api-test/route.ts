import { NextResponse } from "next/server";
import { sendMatchToDTC } from "@/lib/dtc-api";

export async function GET() {
  const testPayload = {
    matchId: "test_manual_001",
    sourcePlatform: "MMT",
    targetPlatform: "DTC",
    sourceListingId: "test-source",
    targetListingId: "cmp6iquq500017ui5m91y04dj",
    score: 95,
    proposedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    sourceUser: {
      platform: "MMT",
      listingId: "test-source",
      testCentre: "cmp2zli2d0000a9r70gf89163",
      testDate: "2026-12-01T09:22:00.000Z",
      testType: "WEEKDAY_STANDARD_CAR",
      desiredDateFrom: "2027-01-04T00:00:00.000Z",
      desiredDateTo: "2027-01-04T23:59:59.000Z",
      desiredDirection: "LATER",
    },
    targetUser: {
      platform: "DTC",
      listingId: "cmp6iquq500017ui5m91y04dj",
      testCentre: "cmp2zli2d0000a9r70gf89163",
      testDate: "2027-01-04T10:57:00.000Z",
      testType: "WEEKDAY_STANDARD_CAR",
      desiredDateFrom: "2026-12-01T00:00:00.000Z",
      desiredDateTo: "2026-12-01T23:59:59.000Z",
      desiredDirection: "EARLIER",
    },
  };

  const result = await sendMatchToDTC(testPayload);

  return NextResponse.json({
    success: result.success,
    error: result.error,
    statusCode: result.statusCode,
    timestamp: new Date().toISOString(),
  });
}
