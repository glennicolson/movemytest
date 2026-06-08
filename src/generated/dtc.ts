/**
 * Stand-in for a separately-generated DTC Prisma client.
 *
 * The cross-platform sync scripts (sync-dtc-to-mmt.ts, sync-safe.ts)
 * were originally written to use two distinct Prisma clients: one
 * wired to the DTC database (DTC_DATABASE_URL) and one wired to
 * the MMT database (DATABASE_URL). Each would have its own generated
 * `index.d.ts` and `package.json` produced by `prisma generate`.
 *
 * In the current MMT setup, neither has been generated — the
 * scripts are a work-in-progress that use raw mysql2 (see
 * src/lib/db/dtc-bridge.ts for the read-only bridge).
 *
 * To keep the scripts type-checkable without bringing in a second
 * Prisma schema and second generate, we re-export the standard
 * @prisma/client PrismaClient here. The runtime still uses
 * separate mysql2 connections (see `createPrismaClient` calls
 * in the scripts). Type-level this means: any Prisma operation
 * that works on MMT's schema will type-check here too, even if
 * the runtime would actually be talking to DTC's schema. This
 * is a known loose coupling — when the second Prisma client is
 * set up, the imports here should be split.
 */
export { PrismaClient } from "@prisma/client";
export type { Prisma } from "@prisma/client";
