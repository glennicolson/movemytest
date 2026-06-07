-- ============================================================================
-- Phase 8.4 — VERIFY (read-only). Run AFTER the migration on MMT live.
-- Confirms the migration did what it should have.
-- ============================================================================

-- Should show 3 rows: smsOptOutAt, smsOptOutReason, lastOptOutAt
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'LearnerAccount'
  AND COLUMN_NAME IN ('smsOptOutAt', 'smsOptOutReason', 'lastOptOutAt')
ORDER BY COLUMN_NAME;

-- Should show 1 row tagged with the migration name
SELECT
  migration_name,
  finished_at
FROM _prisma_migrations
WHERE migration_name = '20260607_learner_account_sms_opt_out';

-- Sanity: do the settings page's other reads also have the columns they need?
-- (The /dashboard/settings page reads mobileNumber, mobileContactConsentAt,
--  marketingConsentAt, smsOptOutAt, smsOptOutReason, accountSetupCompletedAt
--  from LearnerAccount. All of these are part of the original schema except
--  smsOptOutAt/smsOptOutReason/lastOptOutAt which we just added.)
SELECT
  COLUMN_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'LearnerAccount'
  AND COLUMN_NAME IN (
    'mobileNumber',
    'mobileContactConsentAt',
    'marketingConsentAt',
    'smsOptOutAt',
    'smsOptOutReason',
    'accountSetupCompletedAt'
  )
ORDER BY COLUMN_NAME;
