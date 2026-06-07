-- ============================================================================
-- Phase 8.4 — MMT LIVE FIX. Paste into phpMyAdmin SQL tab and click Go.
-- Idempotent. Safe to re-run. Works on MySQL 5.7+ and MariaDB 10.x.
--
-- Reason: Phase 8.4 added the new columns smsOptOutAt, smsOptOutReason,
-- lastOptOutAt to LearnerAccount, plus pushed code that reads them.
-- The live DB only has the original shape. Without these columns, every
-- /dashboard/settings page load fails with "column does not exist".
--
-- Same idempotent pattern as the DTC phase 8.2 fix: information_schema
-- guards instead of `ADD COLUMN IF NOT EXISTS` (MariaDB-only).
--
-- We use the information_schema guard pattern instead of `ADD COLUMN IF NOT EXISTS`
-- so it works on both MySQL 5.7+ and MariaDB 10.x (per the recurrence
-- flagged in MEMORY.md 2026-05-03 and 2026-05-22).

-- Select the live MMT DB. Must be uncommented so the queries below can
-- find LearnerAccount without needing the phpMyAdmin sidebar to be on it.
USE `u385361430_movedata`;

-- smsOptOutAt
SET @sql_smsOptOutAt = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LearnerAccount'
     AND COLUMN_NAME = 'smsOptOutAt') = 0,
  'ALTER TABLE LearnerAccount ADD COLUMN smsOptOutAt DATETIME(3) NULL',
  'SELECT 1'
));
PREPARE stmt FROM @sql_smsOptOutAt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- smsOptOutReason
SET @sql_smsOptOutReason = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LearnerAccount'
     AND COLUMN_NAME = 'smsOptOutReason') = 0,
  'ALTER TABLE LearnerAccount ADD COLUMN smsOptOutReason VARCHAR(40) NULL',
  'SELECT 1'
));
PREPARE stmt FROM @sql_smsOptOutReason; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- lastOptOutAt
SET @sql_lastOptOutAt = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LearnerAccount'
     AND COLUMN_NAME = 'lastOptOutAt') = 0,
  'ALTER TABLE LearnerAccount ADD COLUMN lastOptOutAt DATETIME(3) NULL',
  'SELECT 1'
));
PREPARE stmt FROM @sql_lastOptOutAt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Register the migration in _prisma_migrations so future
-- `prisma migrate deploy` is happy. Uses UUID() because MD5() isn't
-- available on the MySQL 9.6 build (same fix as DTC's phase 8.2).
INSERT IGNORE INTO `_prisma_migrations`
  (id, checksum, migration_name, finished_at, applied_steps_count, started_at)
VALUES
  (CONCAT('cm', REPLACE(UUID(), '-', '')),
   'pending-placeholder',
   '20260607_learner_account_sms_opt_out',
   NOW(3),
   1,
   NOW(3));

-- Final verification
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'LearnerAccount'
  AND COLUMN_NAME IN ('smsOptOutAt', 'smsOptOutReason', 'lastOptOutAt')
ORDER BY COLUMN_NAME;
