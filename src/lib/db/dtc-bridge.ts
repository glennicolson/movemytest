/**
 * DTC database bridge for the CRM link.
 *
 * MMT's Prisma client is wired to the MMT database only. The CRM
 * bridge needs to read DTC's `User`, `InstructorProfile`,
 * `LearnerProfile` tables to find the DTC records that an MMT
 * account was created from.
 *
 * We use a small typed interface over mysql2 instead of a second
 * Prisma client, because (a) we only need 3 tables, (b) we don't
 * want a second Prisma generate to keep in sync, and (c) raw SQL
 * is faster to audit than opaque Prisma client code.
 *
 * SAFETY: this module is READ-ONLY on the DTC side. The only
 * writes are on the MMT side via the regular `prisma` import.
 * Audited: see src/scripts/sync-safe.ts for the same pattern.
 */
import "server-only";
import mysql, { type Pool } from "mysql2/promise";

let _dtcPool: Pool | null = null;

function getDtcPool(): Pool {
  if (_dtcPool) return _dtcPool;
  const url = process.env.DTC_DATABASE_URL;
  if (!url) throw new Error("DTC_DATABASE_URL is not set. The DTC bridge cannot function without it.");
  _dtcPool = mysql.createPool({
    uri: url,
    connectionLimit: 5,
    waitForConnections: true,
    // Cap query latency so a stuck DTC DB can't block MMT requests
    connectTimeout: 5_000,
  });
  return _dtcPool;
}

export interface DtcUser {
  id: string;
  email: string;
  // The DTC schema has `phone` (snake_case in some versions) and
  // `learnerProfile.homePhone`. We pass them as `any` and let the
  // caller pick the field they need.
  [key: string]: unknown;
}

export interface DtcInstructorProfile {
  id: string;
  adiNumber: string | null;
  // Sub-include: the related DTC User.
  user: DtcUser | null;
}

/**
 * Look up a DTC user by ID, with optional `learnerProfile` join.
 * Returns null if the user doesn't exist.
 */
export async function findDtcUserById(
  userId: string,
  options: { includeLearnerProfile?: boolean } = {}
): Promise<DtcUser | null> {
  const pool = getDtcPool();
  const [rows] = await pool.query(
    options.includeLearnerProfile
      ? `SELECT u.*, lp.* FROM User u LEFT JOIN LearnerProfile lp ON lp.userId = u.id WHERE u.id = ? LIMIT 1`
      : `SELECT * FROM User WHERE id = ? LIMIT 1`,
    [userId]
  );
  const rowsArr = rows as DtcUser[];
  return rowsArr.length > 0 ? rowsArr[0] : null;
}

/**
 * Look up a DTC instructor profile by ID, with the related User joined.
 * Returns null if the profile doesn't exist.
 */
export async function findDtcInstructorProfileById(
  instructorProfileId: string
): Promise<DtcInstructorProfile | null> {
  const pool = getDtcPool();
  const [rows] = await pool.query(
    `SELECT ip.id, ip.adiNumber, u.* FROM InstructorProfile ip LEFT JOIN User u ON u.id = ip.userId WHERE ip.id = ? LIMIT 1`,
    [instructorProfileId]
  );
  const rowsArr = rows as (DtcInstructorProfile & DtcUser)[];
  if (rowsArr.length === 0) return null;
  const row = rowsArr[0];
  // mysql2 returns flattened rows when joining; pick out the user fields
  const rowId = (row as { id?: string }).id ?? "";
  const rowEmail = (row as { email?: string }).email;
  const rowFirst = (row as { firstName?: string }).firstName;
  const rowLast = (row as { lastName?: string }).lastName;
  // DtcUser | null — null when no linked user exists
  const user: DtcUser | null = rowEmail
    ? { id: rowId, email: rowEmail, firstName: rowFirst ?? "", lastName: rowLast ?? "" }
    : null;
  return {
    id: rowId,
    adiNumber: ((row as { adiNumber?: string | null }).adiNumber ?? null) as string | null,
    user,
  };
}

/**
 * Look up a DTC user by email.
 */
export async function findDtcUserByEmail(email: string): Promise<DtcUser | null> {
  const pool = getDtcPool();
  const [rows] = await pool.query(`SELECT * FROM User WHERE email = ? LIMIT 1`, [email]);
  const rowsArr = rows as DtcUser[];
  return rowsArr.length > 0 ? rowsArr[0] : null;
}

/**
 * Look up a DTC instructor profile by ADI number.
 */
export async function findDtcInstructorProfileByAdi(
  adiNumber: string
): Promise<DtcInstructorProfile | null> {
  const pool = getDtcPool();
  const [rows] = await pool.query(
    `SELECT ip.id, ip.adiNumber, u.* FROM InstructorProfile ip LEFT JOIN User u ON u.id = ip.userId WHERE ip.adiNumber = ? LIMIT 1`,
    [adiNumber]
  );
  const rowsArr = rows as (DtcInstructorProfile & DtcUser)[];
  return rowsArr.length > 0 ? rowsArr[0] : null;
}

/**
 * Look up a DTC instructor profile by DTC user ID.
 * Returns null if the profile doesn't exist for that user.
 */
export async function findDtcInstructorProfileByUserId(
  userId: string
): Promise<DtcInstructorProfile | null> {
  const pool = getDtcPool();
  const [rows] = await pool.query(
    `SELECT ip.id, ip.adiNumber, u.* FROM InstructorProfile ip LEFT JOIN User u ON u.id = ip.userId WHERE ip.userId = ? LIMIT 1`,
    [userId]
  );
  const rowsArr = rows as (DtcInstructorProfile & DtcUser)[];
  if (rowsArr.length === 0) return null;
  const row = rowsArr[0];
  return {
    id: row.id,
    adiNumber: row.adiNumber,
    user: {
      id: userId,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
    },
  };
}
