-- ============================================================================
-- Phase 8.4 — DRY RUN (read-only). Run this FIRST on MMT live.
-- Tells you exactly which columns the migration will add, without writing.
-- ============================================================================

-- IMPORTANT: phpMyAdmin must have the MMT DB selected (left sidebar) before
-- you run this — the queries below use DATABASE() and unqualified table names.
-- If you see "Unknown table 'LearnerAccount' in information_schema", that's
-- the symptom of no DB selected. Either click `u385361430_movedata` in the
-- sidebar first, or uncomment the USE line below.
--
-- USE `u385361430_movedata`;   -- uncomment if your client doesn't have a DB selected

-- Counts
SELECT
  COUNT(*) AS total_learner_accounts
FROM LearnerAccount;

-- Check which columns are present right now
SELECT
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'LearnerAccount'
  AND COLUMN_NAME IN ('smsOptOutAt', 'smsOptOutReason', 'lastOptOutAt')
ORDER BY COLUMN_NAME;

-- Also confirm the MMT-side queue tables exist (we may have just-fixed them)
SELECT
  TABLE_NAME,
  IF(COUNT(*) >= 1, 'YES', 'NO') AS exists
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('EmailQueue', 'SmsQueue', 'LearnerAccount', 'LearnerConsent', '_prisma_migrations')
GROUP BY TABLE_NAME
ORDER BY TABLE_NAME;
