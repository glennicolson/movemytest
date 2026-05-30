#!/usr/bin/env node
/**
 * Production Sync Script — DTC → MMT (Standalone JS)
 * Runs without npx/tsx. Uses Node.js directly.
 * Must be run from project root with node_modules available.
 */

const { PrismaClient } = require('@prisma/client');

// Database names from URLs
const DTC_DB = process.env.DTC_DATABASE_URL?.split("/").pop()?.split("?")[0] || "u385361430_N";
const MMT_DB = process.env.DATABASE_URL?.split("/").pop()?.split("?")[0] || "u385361430_movedata";

console.log(`[Sync] DTC_DB=${DTC_DB}, MMT_DB=${MMT_DB}`);

// Validate env
if (!process.env.DTC_DATABASE_URL) {
  console.error("[Sync] Missing DTC_DATABASE_URL");
  process.exit(1);
}

async function syncDtcToMmt() {
  const start = Date.now();
  const result = { synced: 0, withdrawn: 0, errors: 0 };

  const prisma = new PrismaClient();

  try {
    // Count DTC listings
    const countResult = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM \`${DTC_DB}\`.TestSwapListing WHERE status = 'ACTIVE' AND expiresAt > NOW()`
    );
    const dtcCount = Number(countResult[0]?.count || 0);
    console.log(`[Sync] DTC has ${dtcCount} ACTIVE listings`);

    // Get DTC listings
    const dtcListings = await prisma.$queryRawUnsafe(
      `SELECT l.id, l.currentCentreId, l.originalCentreId, l.currentDateTime,
              l.testType, l.hasRemainingChange, l.desiredDateFrom, l.desiredDateTo,
              l.desiredTimePreference, l.desiredCentreIds, l.desiredDirection,
              l.status, l.jurisdiction, l.expiresAt, l.createdAt
       FROM \`${DTC_DB}\`.TestSwapListing l
       WHERE l.status = 'ACTIVE' AND l.expiresAt > NOW()
       LIMIT 500`
    );

    console.log(`[Sync] Fetched ${dtcListings.length} listings`);

    // Get existing shadows
    const existing = await prisma.$queryRawUnsafe(
      `SELECT dtcListingId FROM \`${MMT_DB}\`.Listing WHERE source = 'DTC'`
    );
    const existingIds = new Set(existing.map(e => e.dtcListingId));
    const dtcIds = new Set(dtcListings.map(l => l.id));

    // Upsert each listing
    for (const row of dtcListings) {
      try {
        const data = {
          source: 'DTC',
          dtcListingId: row.id,
          currentCentreId: row.currentCentreId,
          originalCentreId: row.originalCentreId || null,
          currentDateTime: new Date(row.currentDateTime),
          testType: row.testType,
          hasRemainingChange: row.hasRemainingChange === 1 || row.hasRemainingChange === true,
          desiredDateFrom: new Date(row.desiredDateFrom),
          desiredDateTo: new Date(row.desiredDateTo),
          desiredTimePreference: row.desiredTimePreference || 'ANY',
          desiredCentreIds: typeof row.desiredCentreIds === 'string' ? row.desiredCentreIds : JSON.stringify(row.desiredCentreIds),
          desiredDirection: row.desiredDirection,
          status: row.status,
          jurisdiction: row.jurisdiction,
          expiresAt: new Date(row.expiresAt),
          createdAt: new Date(row.createdAt),
          updatedAt: new Date()
        };

        if (existingIds.has(row.id)) {
          await prisma.$executeRawUnsafe(
            `UPDATE \`${MMT_DB}\`.Listing SET
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
          await prisma.$executeRawUnsafe(
            `INSERT INTO \`${MMT_DB}\`.Listing
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
        console.error(`[Sync] Error ${row.id}:`, err.message);
        result.errors++;
      }
    }

    // Withdraw stale
    const withdrawnIds = Array.from(existingIds).filter(id => !dtcIds.has(id));
    if (withdrawnIds.length > 0) {
      const placeholders = withdrawnIds.map(() => '?').join(',');
      await prisma.$executeRawUnsafe(
        `UPDATE \`${MMT_DB}\`.Listing SET status = 'EXPIRED', updatedAt = NOW()
         WHERE source = 'DTC' AND dtcListingId IN (${placeholders})`,
        ...withdrawnIds
      );
      result.withdrawn = withdrawnIds.length;
    }

    console.log(`[Sync] Done: synced=${result.synced}, withdrawn=${result.withdrawn}, errors=${result.errors}, duration=${Date.now()-start}ms`);
    return result;

  } finally {
    await prisma.$disconnect();
  }
}

syncDtcToMmt()
  .then(r => process.exit(r.errors > 0 ? 1 : 0))
  .catch(e => { console.error(e); process.exit(1); });
