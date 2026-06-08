#!/usr/bin/env bash
# Import a phpMyAdmin live MMT dump into the local dev MySQL.
#
# Usage:
#   ./scripts/import-live-dump.sh /path/to/u385361430_movedata.sql
#
# What it does:
#   1. Extracts INSERT statements from the dump (skips CREATE TABLE / ALTER TABLE).
#   2. Truncates the 15 MMT tables that the dump populates (preserves _prisma_migrations).
#   3. Disables FK checks + relaxes sql_mode (dev MySQL has NO_ZERO_DATE on; live didn't).
#   4. Pipes the inserts in, then re-enables FK checks.
#
# IMPORTANT:
# - This is a one-shot dev reset. All dev data in the 15 affected tables is replaced.
# - Tables NOT in the dump (auth, MFA, etc.) are left untouched.
# - The dev `LearnerAccount.passwordHash` is reset to `DevPass2026!` afterwards so the
#   dev sign-in works. Re-run the reset block at the bottom of this script if you
#   need to reset again.
# - Dev's `_prisma_migrations` row is preserved. The Phase 8.4 migration stays applied.

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 /path/to/u385361430_movedata.sql"
  exit 1
fi

DUMP="$1"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_USER="${DB_USER:-u385361430_moveuser}"
DB_PASS="${DB_PASS:-DTC159eH6}"
DB_NAME="${DB_NAME:-movemytest}"

if [ ! -f "$DUMP" ]; then
  echo "dump file not found: $DUMP"
  exit 1
fi

WORK="/tmp/mmt-import-$$"
mkdir -p "$WORK"
trap "rm -rf $WORK" EXIT

echo "extracting INSERT statements..."
awk '/^INSERT INTO/ {p=1; print; next} p && /^-- -/ {p=0; print ""; next} p {print}' "$DUMP" > "$WORK/inserts.sql"
N=$(grep -c "^INSERT INTO" "$WORK/inserts.sql" || true)
echo "  $N INSERT statements extracted"

# Default password for dev after import: DevPass2026!
# Generated with: node -e 'const c=require("crypto");const{scrypt:p}=c;const s=require("util").promisify;const k=require("crypto").scrypt;...'
DEFAULT_PW_HASH='scrypt$91057b33051b4e09c0424afda376a4a6$ca37088efe961dc5f7ce21c6f75095597252c23901cdda2dd3df8ed3e9107f8e219e2ee8e152b308d6c9802f928cf4657dcbf02e4ae4f5fb76605b9b15ef53e8'

echo "truncating 15 tables..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE BookingReferenceSecret;
TRUNCATE TABLE EmailQueue;
TRUNCATE TABLE InstructorAccount;
TRUNCATE TABLE InstructorAuditLog;
TRUNCATE TABLE LearnerAccount;
TRUNCATE TABLE LearnerConsent;
TRUNCATE TABLE Listing;
TRUNCATE TABLE ListingInstructor;
TRUNCATE TABLE \`Match\`;
TRUNCATE TABLE MatchEvent;
TRUNCATE TABLE MoveMyTestEmailQueue;
TRUNCATE TABLE Report;
TRUNCATE TABLE SmsQueue;
TRUNCATE TABLE StaffAccount;
TRUNCATE TABLE TestCentre;
SET FOREIGN_KEY_CHECKS = 1;
" 2>/dev/null

echo "importing data..."
{
  echo "SET FOREIGN_KEY_CHECKS = 0;"
  echo "SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION';"
  cat "$WORK/inserts.sql"
  echo "SET FOREIGN_KEY_CHECKS = 1;"
} | mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" 2>/dev/null || {
  echo "  import had errors — check output above"
  exit 1
}

echo "resetting dev password to DevPass2026!..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
UPDATE LearnerAccount SET passwordHash = '$DEFAULT_PW_HASH'
WHERE email IN ('glennicolson@me.com', 'glennicolson@gmail.com');
" 2>/dev/null

echo ""
echo "=== import complete ==="
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
SELECT 'LearnerAccount' AS t, COUNT(*) AS n FROM LearnerAccount
UNION ALL SELECT 'Listing', COUNT(*) FROM \`Listing\`
UNION ALL SELECT 'Match', COUNT(*) FROM \`Match\`
UNION ALL SELECT 'MoveMyTestEmailQueue', COUNT(*) FROM MoveMyTestEmailQueue
UNION ALL SELECT 'EmailQueue', COUNT(*) FROM EmailQueue
UNION ALL SELECT 'TestCentre', COUNT(*) FROM TestCentre
ORDER BY 1;
" 2>/dev/null

echo ""
echo "dev sign-in: glennicolson@me.com  /  DevPass2026!"
echo "             glennicolson@gmail.com  /  DevPass2026!"
