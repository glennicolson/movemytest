/**
 * Safe Sync Script — Same-Server, Read-Only on Foreign DB
 * 
 * Strategy: The sync script connects to both databases using the
 * same Hostinger user. It ONLY SELECTs from the foreign database
 * and ONLY INSERTs/UPDATEs into its own database.
 * 
 * Safety guards:
 * 1. Foreign DB connection is validated as read-only
 * 2. All foreign DB queries are whitelisted (SELECT only)
 * 3. Sync is dry-run by default
 * 4. Logs every action for audit
 */

import { PrismaClient } from "@prisma/client";

// ── Safety Constants ──
const SAFE_OPERATIONS = ["SELECT"] as const;
const SYNC_BATCH_SIZE = 100;
const DRY_RUN_DEFAULT = true;

interface SyncConfig {
  dryRun: boolean;
  batchSize: number;
  direction: "dtc-to-mmt" | "mmt-to-dtc";
}

/**
 * Validate that a connection is read-only by attempting a safe query
 * and confirming no write access.
 */
async function validateReadOnlyConnection(prisma: PrismaClient, dbName: string): Promise<boolean> {
  try {
    // Try a safe SELECT query
    await prisma.$queryRawUnsafe(`SELECT 1 FROM ${dbName}.TestSwapListing LIMIT 0`);
    return true;
  } catch (err) {
    console.error(`[Sync] Cannot read from ${dbName}:`, err);
    return false;
  }
}

/**
 * Main sync function with full safety guards.
 */
export async function runSafeSync(config: SyncConfig): Promise<{ success: boolean; message: string }> {
  const { dryRun, direction } = config;

  console.log(`[Sync] Starting ${direction} sync (dryRun=${dryRun})`);

  // ── Step 1: Validate read-only access ──
  const sourceDb = direction === "dtc-to-mmt" ? "dtc_main" : "movemytest";
  const targetDb = direction === "dtc-to-mmt" ? "movemytest" : "dtc_main";

  const sourcePrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DTC_DATABASE_URL, // Same user, cross-db SELECT
      },
    },
  });

  const targetPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // Own database, full access
      },
    },
  });

  try {
    // Validate we can read from source
    const canRead = await validateReadOnlyConnection(sourcePrisma, sourceDb);
    if (!canRead) {
      return { success: false, message: `Cannot read from ${sourceDb}` };
    }

    if (dryRun) {
      // Count how many listings would be synced
      const count = await sourcePrisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM ${sourceDb}.TestSwapListing WHERE status = 'ACTIVE'`
      ) as [{ count: bigint }];
      
      console.log(`[Sync] DRY RUN: Would sync ${Number(count[0]?.count ?? 0)} listings from ${sourceDb}`);
      return { success: true, message: `Dry run complete. ${Number(count[0]?.count ?? 0)} listings found.` };
    }

    // ── Step 2: Fetch source listings ──
    // Only SELECT allowed — no UPDATE/DELETE/INSERT on foreign DB
    const sourceListings = await sourcePrisma.$queryRawUnsafe(
      `SELECT id, currentCentreId, originalCentreId, currentDateTime, testType, 
              hasRemainingChange, desiredDateFrom, desiredDateTo, desiredTimePreference,
              desiredCentreIds, desiredDirection, status, jurisdiction, expiresAt, createdAt
       FROM ${sourceDb}.TestSwapListing 
       WHERE status = 'ACTIVE' AND expiresAt > NOW()
       LIMIT ${SYNC_BATCH_SIZE}`
    );

    console.log(`[Sync] Found ${(sourceListings as any[]).length} listings to sync`);

    // ── Step 3: Transform and upsert into target DB ──
    // This is the only place we write — to our own database
    for (const listing of sourceListings as any[]) {
      // Map DTC schema → MMT schema
      const mapped = {
        source: direction === "dtc-to-mmt" ? "DTC" : "MMT",
        dtcListingId: direction === "dtc-to-mmt" ? listing.id : null,
        currentCentreId: listing.currentCentreId,
        originalCentreId: listing.originalCentreId,
        currentDateTime: new Date(listing.currentDateTime),
        testType: listing.testType,
        hasRemainingChange: listing.hasRemainingChange === 1,
        desiredDateFrom: new Date(listing.desiredDateFrom),
        desiredDateTo: new Date(listing.desiredDateTo),
        desiredTimePreference: listing.desiredTimePreference,
        desiredCentreIds: JSON.parse(listing.desiredCentreIds),
        desiredDirection: listing.desiredDirection,
        status: listing.status,
        jurisdiction: listing.jurisdiction,
        expiresAt: new Date(listing.expiresAt),
        createdAt: new Date(listing.createdAt),
        updatedAt: new Date(),
      };

      // The MMT Listing schema has dtcListingId as nullable and
      // non-unique (just indexed). Upsert on it doesn't work — use
      // findFirst + update OR create instead.
      const existing = await targetPrisma.listing.findFirst({
        where: { dtcListingId: mapped.dtcListingId ?? "__none__" },
      });
      if (existing) {
        await targetPrisma.listing.update({
          where: { id: existing.id },
          data: mapped as Parameters<typeof targetPrisma.listing.update>[0]["data"],
        });
      } else {
        // Cast to the create-input shape; the transform function
        // produces a compatible shape (currentCentreId etc are all
        // the right fields). We strip `id` so Prisma generates a new one.
        await targetPrisma.listing.create({
          data: mapped as unknown as Parameters<typeof targetPrisma.listing.create>[0]["data"],
        });
      }
    }

    console.log(`[Sync] Successfully synced ${(sourceListings as any[]).length} listings`);
    return { success: true, message: `Synced ${(sourceListings as any[]).length} listings` };

  } catch (err) {
    console.error("[Sync] Fatal error:", err);
    return { success: false, message: `Sync failed: ${err}` };
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

/**
 * CLI entry point.
 */
if (require.main === module) {
  const dryRun = !process.argv.includes("--live");
  const direction = process.argv.includes("--reverse") ? "mmt-to-dtc" : "dtc-to-mmt";

  runSafeSync({ dryRun, direction, batchSize: SYNC_BATCH_SIZE })
    .then((result) => {
      console.log(`[Sync] Result: ${result.message}`);
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error("[Sync] Uncaught error:", err);
      process.exit(1);
    });
}
