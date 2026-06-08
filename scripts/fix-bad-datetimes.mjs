// One-shot: find and fix rows with invalid datetime values in MMT dev DB
// Uses raw mysql2 (NOT Prisma) to avoid Prisma's strict-mode rejections
// of invalid datetimes on read.
import "dotenv/config";
import mysql from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL || "";
if (!dbUrl.includes("127.0.0.1") && !dbUrl.includes("localhost")) {
  console.error(`Refusing to run: DATABASE_URL host is not localhost/127.0.0.1`);
  process.exit(2);
}

const conn = await mysql.createConnection(dbUrl);
console.log(`Connected to ${dbUrl.replace(/:\/\/.*@/, "://***@")}\n`);

// 1) Find every datetime column
const [cols] = await conn.query(`
  SELECT TABLE_NAME, COLUMN_NAME
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND DATA_TYPE = 'datetime'
`);

console.log(`Scanning ${cols.length} datetime columns...\n`);

// 2) For each column, count bad rows using a raw query (Prisma-safe)
const badCols = [];
for (const { TABLE_NAME, COLUMN_NAME } of cols) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS n FROM \`${TABLE_NAME}\` WHERE \`${COLUMN_NAME}\` < '1000-01-01' OR \`${COLUMN_NAME}\` IS NULL OR DAY(\`${COLUMN_NAME}\`) = 0 OR MONTH(\`${COLUMN_NAME}\`) = 0`
  );
  if (rows[0].n > 0) badCols.push({ table: TABLE_NAME, column: COLUMN_NAME, count: rows[0].n });
}

if (badCols.length === 0) {
  console.log("✅ No bad datetime values found.");
  await conn.end();
  process.exit(0);
}

console.log(`Found ${badCols.length} column(s) with bad datetimes:\n`);
for (const r of badCols) {
  console.log(`  ${r.table}.${r.column}: ${r.count} bad row(s)`);
}

// 3) Show samples (also raw, not Prisma)
console.log(`\n=== Samples ===`);
for (const { table, column, count } of badCols) {
  const [sample] = await conn.query(
    `SELECT * FROM \`${table}\` WHERE \`${column}\` < '1000-01-01' OR DAY(\`${column}\`) = 0 OR MONTH(\`${column}\`) = 0 LIMIT 2`
  );
  console.log(`\n  ${table}.${column} (${count} rows, sample):`);
  for (const row of sample) {
    console.log(`    ${JSON.stringify(row).slice(0, 200)}`);
  }
}

// 4) Fix: NULL out bad values for nullable columns, or set to NOW() for NOT NULL
console.log(`\n=== Fixing ===`);
for (const { table, column, count } of badCols) {
  // Check nullability
  const [meta] = await conn.query(
    `SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  const nullable = meta[0]?.IS_NULLABLE === "YES";

  // Choose replacement:
  // - If nullable, set to NULL (safest — preserves semantics for "deletedAt" etc)
  // - If NOT NULL, try to set to createdAt if that column exists, else NOW()
  let fixSql;
  if (nullable) {
    fixSql = `UPDATE \`${table}\` SET \`${column}\` = NULL WHERE \`${column}\` < '1000-01-01' OR DAY(\`${column}\`) = 0 OR MONTH(\`${column}\`) = 0`;
  } else {
    const [createdAtCol] = await conn.query(
      `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'createdAt'`,
      [table]
    );
    const replacement = createdAtCol.length > 0 ? "createdAt" : "NOW()";
    fixSql = `UPDATE \`${table}\` SET \`${column}\` = ${replacement} WHERE \`${column}\` < '1000-01-01' OR DAY(\`${column}\`) = 0 OR MONTH(\`${column}\`) = 0`;
  }

  const [result] = await conn.query(fixSql);
  console.log(`  ${table}.${column} (${nullable ? "nullable" : "NOT NULL"}): ${result.affectedRows} row(s) updated`);
}

// 5) Verify
console.log(`\n=== Verify ===`);
for (const { table, column } of badCols) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS n FROM \`${table}\` WHERE \`${column}\` < '1000-01-01' OR DAY(\`${column}\`) = 0 OR MONTH(\`${column}\`) = 0`
  );
  const remaining = rows[0].n;
  console.log(`  ${table}.${column}: ${remaining} bad row(s) remaining ${remaining === 0 ? "✅" : "❌"}`);
}

await conn.end();
console.log(`\n✅ Done.`);
