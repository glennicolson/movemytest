/**
 * Production Sync Script — MMT → DTC
 *
 * Syncs MMT listings to DTC's TestSwapListing table.
 * Uses MMT_DATABASE_URL from .env to connect to DTC database.
 * Only writes to DTC TestSwapListing table.
 *
 * Safety: SELECT from MMT. INSERT/UPDATE to DTC only.
 */

import { PrismaClient } from "@prisma/client";

const MMT_DB = process.env.DATABASE_URL?.split("/").pop()?.split("?")[0] ?? "u385361430_movedata";
const DTC_DB = process.env.MMT_DATABASE_URL?.split("/").pop()?.split("?")[0] ?? "u385361430_N";

// Validate we have both URLs
if (!process.env.DATABASE_URL || !process.env.MMT_DATABASE_URL) {
  console.error("[Sync] Missing DATABASE_URL or MMT_DATABASE_URL in .env");
  process.exit(1);
}

interface SyncResult {
  synced: number;
  withdrawn: number;
  errors: number;
  durationMs: number;
}

async function syncMmtToDtc(): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { synced: 0, withdrawn: 0, errors: 0, durationMs: 0 };

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.MMT_DATABASE_URL,
      },
    },
  });

  try {
    // Step 1: Count MMT listings
    const countResult = await prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM ${MMT_DB}.Listing WHERE status = 'ACTIVE' AND source = 'MMT' AND expiresAt > NOW()`
    );
    const mmtCount = Number(countResult[0]?.count ?? 0);
    console.log(`[Sync] MMT has ${mmtCount} ACTIVE listings`);

    // Step 2: Get MMT listings
    const mmtListings = await prisma.$queryRawUnsafe<any[]>(
      `SELECT
         l.id, l.currentCentreId, l.originalCentreId, l.currentDateTime,
         l.testType, l.hasRemainingChange, l.desiredDateFrom, l.desiredDateTo,
         l.desiredTimePreference, l.desiredCentreIds, l.desiredDirection,
         l.status, l.jurisdiction, l.expiresAt, l.createdAt, l.updatedAt
       FROM ${MMT_DB}.Listing l
       WHERE l.status = 'ACTIVE' AND l.source = 'MMT' AND l.expiresAt > NOW()
       LIMIT 500`
    );

    console.log(`[Sync] Fetched ${mmtListings.length} listings from MMT`);

    // Step 3: Get existing shadow IDs in DTC
    const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM ${DTC_DB}.TestSwapListing WHERE source = 'MMT'`
    );
    const existingIds = new Set(existing.map((e) => e.id));
    const mmtIds = new Set(mmtListings.map((l) => l.id));

    // Step 4: Upsert MMT listings into DTC
    for (const row of mmtListings) {
      try {
        const data = {
          id: row.id,
          currentCentreId: row.currentCentreId,
          originalCentreId: row.originalCentreId,
          currentDateTime: new Date(row.currentDateTime),
          testType: row.testType,
          hasRemainingChange: row.hasRemainingChange,
          desiredDateFrom: new Date(row.desiredDateFrom),
          desiredDateTo: new Date(row.desiredDateTo),
          desiredTimePreference: row.desiredTimePreference || "ANY",
          desiredCentreIds: JSON.stringify(row.desiredCentreIds),
          desiredDirection: row.desiredDirection,
          status: row.status,
          jurisdiction: row.jurisdiction,
          expiresAt: new Date(row.expiresAt),
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(),
        };

        if (existingIds.has(row.id)) {
          // Update existing shadow
          await prisma.$executeRawUnsafe(
            `UPDATE ${DTC_DB}.TestSwapListing SET
               currentCentreId = ?, originalCentreId = ?, currentDateTime = ?,
               testType = ?, hasRemainingChange = ?, desiredDateFrom = ?, desiredDateTo = ?,
               desiredTimePreference = ?, desiredCentreIds = ?, desiredDirection = ?,
               status = ?, jurisdiction = ?, expiresAt = ?, updatedAt = NOW()
             WHERE id = ? AND source = 'MMT'`,
            data.currentCentreId, data.originalCentreId, data.currentDateTime,
            data.testType, data.hasRemainingChange, data.desiredDateFrom, data.desiredDateTo,
            data.desiredTimePreference, data.desiredCentreIds, data.desiredDirection,
            data.status, data.jurisdiction, data.expiresAt, row.id
          );
        } else {
          // Insert new shadow
          await prisma.$executeRawUnsafe(
            `INSERT INTO ${DTC_DB}.TestSwapListing
             (id, currentCentreId, originalCentreId, currentDateTime,
              testType, hasRemainingChange, desiredDateFrom, desiredDateTo, desiredTimePreference,
              desiredCentreIds, desiredDirection, status, jurisdiction, expiresAt, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            data.id, data.currentCentreId, data.originalCentreId, data.currentDateTime,
            data.testType, data.hasRemainingChange, data.desiredDateFrom, data.desiredDateTo,
            data.desiredTimePreference, data.desiredCentreIds, data.desiredDirection,
            data.status, data.jurisdiction, data.expiresAt, data.createdAt
          );
        }
        result.synced++;
      } catch (err) {
        console.error(`[Sync] Error processing ${row.id}:`, err);
        result.errors++;
      }
    }

    // Step 5: Withdraw stale listings
    const withdrawnIds = Array.from(existingIds).filter((id) => !mmtIds.has(id));
    if (withdrawnIds.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE ${DTC_DB}.TestSwapListing SET status = 'EXPIRED', updatedAt = NOW()
         WHERE source = 'MMT' AND id IN (${withdrawnIds.map(() => "?").join(",")})`,
        ...withdrawnIds
      );
      result.withdrawn = withdrawnIds.length;
    }

    result.durationMs = Date.now() - start;
    console.log(`[Sync] Complete: ${JSON.stringify(result)}`);
    return result;

  } finally {
    await prisma.$disconnect();
  }
}

// Run
syncMmtToDtc()
  .then((r) => process.exit(r.errors > 0 ? 1 : 0))
  .catch((e) => { console.error(e); process.exit(1); });
