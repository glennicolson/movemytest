/**
 * DTC → MoveMyTest Shadow Sync Script
 * 
 * Purpose: Sync ACTIVE TestSwapListings from DTC database to MoveMyTest database
 * so MMT users can see and match with DTC listings in the shared pool.
 * 
 * Runs: As a cron job every 5 minutes, or triggered manually
 * Environment: Node.js with access to both DTC and MMT databases
 * 
 * Strategy:
 * 1. Connect to DTC database (read-only)
 * 2. Fetch all ACTIVE TestSwapListings
 * 3. Transform DTC schema → MMT schema
 * 4. Upsert into MMT.Listing with source='DTC'
 * 5. Mark deleted DTC listings as WITHDRAWN in MMT
 * 
 * Safety:
 * - DTC database is read-only (no writes)
 * - MMT is the shadow/derived copy (can be rebuilt)
 * - Only ACTIVE listings synced (no history, no matches, no PII)
 */

import { PrismaClient as DtcPrismaClient } from "@/generated/dtc";
import { PrismaClient as MmtPrismaClient } from "@/generated/mmt";

// We'll use separate Prisma clients for each database
// Note: In production, these would be instantiated with different DATABASE_URLs

interface SyncConfig {
  dryRun: boolean;
  batchSize: number;
  logLevel: "debug" | "info" | "warn" | "error";
}

interface SyncResult {
  inserted: number;
  updated: number;
  withdrawn: number;
  errors: number;
  durationMs: number;
}

/**
 * Map DTC TestSwapTestType → MMT TestType
 */
function mapTestType(dtcType: string): string {
  const mapping: Record<string, string> = {
    "WEEKDAY_STANDARD_CAR": "WEEKDAY_STANDARD_CAR",
    "EVENING_WEEKEND_BANK_HOLIDAY_STANDARD_CAR": "EVENING_WEEKEND_BANK_HOLIDAY_STANDARD_CAR",
    "EXTRA_TIME_SPECIAL_REQUIREMENTS": "EXTRA_TIME_SPECIAL_REQUIREMENTS",
    "EXTENDED_WEEKDAY": "EXTENDED_WEEKDAY",
    "EXTENDED_EVENING_WEEKEND_BANK_HOLIDAY": "EXTENDED_EVENING_WEEKEND_BANK_HOLIDAY",
  };
  return mapping[dtcType] || "WEEKDAY_STANDARD_CAR";
}

/**
 * Map DTC TestSwapTimePreference → MMT TimePreference
 */
function mapTimePreference(dtcPref: string): string {
  const mapping: Record<string, string> = {
    "ANY": "ANY",
    "MORNING": "MORNING",
    "AFTERNOON": "AFTERNOON",
    "EVENING": "EVENING",
  };
  return mapping[dtcPref] || "ANY";
}

/**
 * Map DTC TestSwapDesiredDirection → MMT DesiredDirection
 */
function mapDesiredDirection(dtcDir: string): string {
  const mapping: Record<string, string> = {
    "EARLIER": "EARLIER",
    "LATER": "LATER",
    "EITHER": "EITHER",
  };
  return mapping[dtcDir] || "EITHER";
}

/**
 * Map DTC TestSwapJurisdiction → MMT Jurisdiction
 */
function mapJurisdiction(dtcJur: string): string {
  const mapping: Record<string, string> = {
    "GB_DVSA": "GB_DVSA",
    "NI_DVA": "NI_DVA",
  };
  return mapping[dtcJur] || "GB_DVSA";
}

/**
 * Map DTC TestSwapListingStatus → MMT ListingStatus
 */
function mapStatus(dtcStatus: string): string {
  const mapping: Record<string, string> = {
    "ACTIVE": "ACTIVE",
    "PAUSED": "PAUSED",
    "MATCHED": "MATCHED",
    "COMPLETED": "COMPLETED",
    "EXPIRED": "EXPIRED",
    "DELETED": "DELETED",
    "BANNED": "BANNED",
  };
  return mapping[dtcStatus] || "ACTIVE";
}

/**
 * Transform a DTC TestSwapListing into MMT Listing shape
 */
function transformDtcToMmt(dtcListing: any): any {
  return {
    source: "DTC",
    dtcListingId: dtcListing.id,
    // We don't have the DTC user's email directly in the listing table
    // It would need to be fetched from the User or TestSwapAccount table
    // For privacy, we may not want to sync email at all
    dtcUserEmail: null,
    
    // Map the core listing fields
    currentCentreId: dtcListing.currentCentreId,
    originalCentreId: dtcListing.originalCentreId,
    currentDateTime: dtcListing.currentDateTime,
    testType: mapTestType(dtcListing.testType),
    hasRemainingChange: dtcListing.hasRemainingChange,
    desiredDateFrom: dtcListing.desiredDateFrom,
    desiredDateTo: dtcListing.desiredDateTo,
    desiredTimePreference: mapTimePreference(dtcListing.desiredTimePreference),
    desiredCentreIds: dtcListing.desiredCentreIds,
    desiredDirection: mapDesiredDirection(dtcListing.desiredDirection),
    status: mapStatus(dtcListing.status),
    jurisdiction: mapJurisdiction(dtcListing.jurisdiction),
    expiresAt: dtcListing.expiresAt,
    createdAt: dtcListing.createdAt,
    updatedAt: dtcListing.updatedAt,
    
    // Important: DTC listings have no MMT accountId
    // They exist as shadow entries for matching only
    accountId: null,
  };
}

/**
 * Main sync function
 */
export async function syncDtcToMmt(config: SyncConfig = { dryRun: false, batchSize: 100, logLevel: "info" }): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = { inserted: 0, updated: 0, withdrawn: 0, errors: 0, durationMs: 0 };
  
  const dtc = new DtcPrismaClient();
  const mmt = new MmtPrismaClient();
  
  try {
    // Step 1: Fetch all ACTIVE listings from DTC
    const dtcListings = await dtc.listing.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { gt: new Date() }, // Only non-expired
      },
      orderBy: { updatedAt: "desc" },
    });
    
    console.log(`[Sync] Found ${dtcListings.length} ACTIVE DTC listings`);
    
    if (config.dryRun) {
      console.log(`[Sync] DRY RUN — would sync ${dtcListings.length} listings`);
      return { ...result, durationMs: Date.now() - startTime };
    }
    
    // Step 2: Get all current DTC shadow listings from MMT
    const existingShadows = await mmt.listing.findMany({
      where: { source: "DTC" },
      select: { id: true, dtcListingId: true, status: true },
    });
    
    const existingDtcIds = new Set(existingShadows.map((s: { dtcListingId: string | null }) => s.dtcListingId ?? "").filter((id) => id.length > 0));
    const dtcIdsToSync = new Set(dtcListings.map((l: { id: string }) => l.id));
    
    // Step 3: Upsert — insert new, update changed
    for (const dtcListing of dtcListings.slice(0, config.batchSize)) {
      try {
        const mmtData = transformDtcToMmt(dtcListing);
        
        if (existingDtcIds.has(dtcListing.id)) {
          // Update existing shadow
          await mmt.listing.updateMany({
            where: { dtcListingId: dtcListing.id, source: "DTC" },
            data: mmtData,
          });
          result.updated++;
        } else {
          // Insert new shadow
          await mmt.listing.create({
            data: {
              ...mmtData,
              // Generate a new ID for the shadow record
              id: undefined, // Let Prisma generate cuid()
            },
          });
          result.inserted++;
        }
      } catch (err) {
        console.error(`[Sync] Error processing DTC listing ${dtcListing.id}:`, err);
        result.errors++;
      }
    }
    
    // Step 4: Withdraw shadows for DTC listings that are no longer ACTIVE
    const withdrawnIds = existingShadows
      .filter((s: { dtcListingId: string | null }) => s.dtcListingId !== null && !dtcIdsToSync.has(s.dtcListingId))
      .map((s: { dtcListingId: string | null }) => s.dtcListingId)
      .filter((id: string | null): id is string => id !== null) as string[];
    
    if (withdrawnIds.length > 0) {
      await mmt.listing.updateMany({
        where: {
          source: "DTC",
          dtcListingId: { in: withdrawnIds },
        },
        data: {
          status: "EXPIRED", // or "WITHDRAWN" if we add that status
        },
      });
      result.withdrawn = withdrawnIds.length;
      console.log(`[Sync] Withdrawn ${withdrawnIds.length} stale DTC shadows`);
    }
    
    result.durationMs = Date.now() - startTime;
    console.log(`[Sync] Complete: ${JSON.stringify(result)}`);
    
    return result;
  } finally {
    await dtc.$disconnect();
    await mmt.$disconnect();
  }
}

/**
 * CLI entry point for cron/manual execution
 */
if (require.main === module) {
  const dryRun = process.argv.includes("--dry-run");
  syncDtcToMmt({ dryRun, batchSize: 100, logLevel: "info" })
    .then(result => {
      process.exit(result.errors > 0 ? 1 : 0);
    })
    .catch(err => {
      console.error("[Sync] Fatal error:", err);
      process.exit(1);
    });
}
