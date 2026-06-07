-- ============================================================================
-- Phase 8.4 — ROLLBACK (use only if the migration went wrong)
--
-- Drops the 3 columns added by phase 8.4. Reversible as long as no live
-- data depends on them (smsOptOutAt will lose any STOP-reply opt-outs
-- that have come in since the migration; LearnerConsent rows are
-- independent and won't be touched).
--
-- Only safe to run if you haven't built further features that depend on
-- these columns. As of 2026-06-07, no other feature reads them.
-- ============================================================================

-- IMPORTANT: phpMyAdmin must have the MMT DB selected (left sidebar) before
-- you run this — the queries below use DATABASE(). If you see "Unknown
-- table 'LearnerAccount' in information_schema", that's the symptom of no
-- DB selected. Either click `u385361430_movedata` in the sidebar first,
-- or uncomment the USE line below.
--
-- USE `u385361430_movedata`;   -- uncomment if your client doesn't have a DB selected

-- Step 1: Show current state (sanity check)
SELECT COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'LearnerAccount'
  AND COLUMN_NAME IN ('smsOptOutAt', 'smsOptOutReason', 'lastOptOutAt')
ORDER BY COLUMN_NAME;

-- Step 2: Drop the 3 columns
SET @sql_smsOptOutAt = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LearnerAccount'
     AND COLUMN_NAME = 'smsOptOutAt') = 1,
  'ALTER TABLE LearnerAccount DROP COLUMN smsOptOutAt',
  'SELECT 1'
));
PREPARE stmt FROM @sql_smsOptOutAt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql_smsOptOutReason = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LearnerAccount'
     AND COLUMN_NAME = 'smsOptOutReason') = 1,
  'ALTER TABLE LearnerAccount DROP COLUMN smsOptOutReason',
  'SELECT 1'
));
PREPARE stmt FROM @sql_smsOptOutReason; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql_lastOptOutAt = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LearnerAccount'
     AND COLUMN_NAME = 'lastOptOutAt') = 1,
  'ALTER TABLE LearnerAccount DROP COLUMN lastOptOutAt',
  'SELECT 1'
));
PREPARE stmt FROM @sql_lastOptOutAt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Step 3: Remove the migration from _prisma_migrations (so future
-- prisma migrate deploy re-applies it cleanly)
DELETE FROM _prisma_migrations
WHERE migration_name = '20260607_learner_account_sms_opt_out';

-- Step 4: Verify
SELECT COLUMN_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'LearnerAccount'
  AND COLUMN_NAME IN ('smsOptOutAt', 'smsOptOutReason', 'lastOptOutAt');
-- Should return 0 rows.

SELECT COUNT(*) AS rollback_log_count
FROM _prisma_migrations
WHERE migration_name = '20260607_learner_account_sms_opt_out';
-- Should return 0.
