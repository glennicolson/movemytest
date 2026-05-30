/**
 * Production Sync Script — Same MySQL Server
 * 
 * Uses the EXISTING database user to SELECT from both databases.
 * Since both DBs are on the same Hostinger server, we can use raw
 * SQL with cross-database queries (e.g., SELECT FROM dtc_main.table).
 * 
 * Safety: This script only SELECTS from the other database and
 * only writes to its own database. No changes to DTC DB.
 */

import { PrismaClient } from "@prisma/client";

const DTC_DB = "dtc_main";
const MMT_DB = "movemytest";

interface SyncResult {
  synced: number;
  withdrawn: number;
  errors: number;
  durationMs: number;
}

async function syncDtcToMmt(): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { synced: 0, withdrawn: 0, errors: 0, durationMs: 0 };

  const prisma = new PrismaClient();

  try {
    // ── Step 1: Count DTC listings ──
    const countResult = await prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM ${DTC_DB}.TestSwapListing WHERE status = 'ACTIVE' AND expiresAt > NOW()`
    );
    const dtcCount = Number(countResult[0]?.count ?? 0);
    console.log(`[Sync] DTC has ${dtcCount} ACTIVE listings`);

    // ── Step 2: Get DTC listings ──
    const dtcListings = await prisma.$queryRawUnsafe<any[]>(
      `SELECT 
         l.id, l.currentCentreId, l.originalCentreId, l.currentDateTime,
         l.testType, l.hasRemainingChange, l.desiredDateFrom, l.desiredDateTo,
         l.desiredTimePreference, l.desiredCentreIds, l.desiredDirection,
         l.status, l.jurisdiction, l.expiresAt, l.createdAt, l.updatedAt
       FROM ${DTC_DB}.TestSwapListing l
       WHERE l.status = 'ACTIVE' AND l.expiresAt > NOW()
       LIMIT 500`
    );

    console.log(`[Sync] Fetched ${dtcListings.length} listings from DTC`);

    // ── Step 3: Get existing shadow IDs ──
    const existing = await prisma.$queryRawUnsafe<{ dtcListingId: string }[]>(
      `SELECT dtcListingId FROM ${MMT_DB}.Listing WHERE source = 'DTC'`
    );
    const existingIds = new Set(existing.map((e) => e.dtcListingId));
    const dtcIds = new Set(dtcListings.map((l) => l.id));

    // ── Step 4: Upsert DTC listings into MMT ──
    for (const row of dtcListings) {
      try {
        const data = {
          source: "DTC",
          dtcListingId: row.id,
          accountId: null,
          currentCentreId: row.currentCentreId,
          originalCentreId: row.originalCentreId,
          currentDateTime: new Date(row.currentDateTime),
          testType: row.testType,
          hasRemainingChange: row.hasRemainingChange === 1 || row.hasRemainingChange === true,
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
            `UPDATE ${MMT_DB}.Listing SET 
               currentCentreId = ?, originalCentreId = ?, currentDateTime = ?,
               testType = ?, hasRemainingChange = ?, desiredDateFrom = ?, desiredDateTo = ?,
               desiredTimePreference = ?, desiredCentreIds = ?, desiredDirection = ?,
               status = ?, jurisdiction = ?, expiresAt = ?, updatedAt = NOW()
             WHERE dtcListingId = ? AND source = 'DTC'`,
            data.currentCentreId, data.originalCentreId, data.currentDateTime,
            data.testType, data.hasRemainingChange, data.desiredDateFrom, data.desiredDateTo,
            data.desiredTimePreference, data.desiredCentreIds, data.desiredDirection,
            data.status, data.jurisdiction, data.expiresAt, row.id
          );
        } else {
          // Insert new shadow
          await prisma.$executeRawUnsafe(
            `INSERT INTO ${MMT_DB}.Listing 
             (id, source, dtcListingId, accountId, currentCentreId, originalCentreId, currentDateTime,
              testType, hasRemainingChange, desiredDateFrom, desiredDateTo, desiredTimePreference,
              desiredCentreIds, desiredDirection, status, jurisdiction, expiresAt, createdAt, updatedAt)
             VALUES (UUID(), ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            data.source, data.dtcListingId, data.currentCentreId, data.originalCentreId, data.currentDateTime,
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

    // ── Step 5: Withdraw stale listings ──
    const withdrawnIds = Array.from(existingIds).filter((id) => !dtcIds.has(id));
    if (withdrawnIds.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE ${MMT_DB}.Listing SET status = 'EXPIRED', updatedAt = NOW()
         WHERE source = 'DTC' AND dtcListingId IN (${withdrawnIds.map(() => "?").join(",")})`,
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

// ── Run ──
syncDtcToMmt()
  .then((r) => process.exit(r.errors > 0 ? 1 : 0))
  .catch((e) => { console.error(e); process.exit(1); });
