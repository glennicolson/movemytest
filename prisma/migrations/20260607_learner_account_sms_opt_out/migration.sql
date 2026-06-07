-- Migration: Add smsOptOutAt + lastOptOutAt columns to LearnerAccount (MMT)
-- Date: 2026-06-07
-- Reason: Phase 8.4 — bring MMT in line with the DTC's SMS gate by adding
-- a hard STOP-reply opt-out field. The current gate is just
-- `mobileNumber && mobileContactConsentAt` which means users who text
-- STOP can never get back in (the only "fix" is to clear the consent
-- field in the database by hand).
--
-- Mirrors the pattern from DTC's Phase 7 + 8.2 work. The opt-out is
-- a hard gate OUTSIDE the per-channel preferences; even with marketing
-- consent on, a hard STOP-reply opt-out still blocks all SMS.
--
-- Idempotent: uses information_schema guards so it works on both
-- MySQL 5.7+ and MariaDB 10.x (per the recurrence flagged in
-- MEMORY.md 2026-05-03 and the earlier Phase 8 follow-up).

SET @sql_smsOptOutAt = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LearnerAccount'
     AND COLUMN_NAME = 'smsOptOutAt') = 0,
  'ALTER TABLE LearnerAccount ADD COLUMN smsOptOutAt DATETIME(3) NULL',
  'SELECT 1'
));
PREPARE stmt FROM @sql_smsOptOutAt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql_smsOptOutReason = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LearnerAccount'
     AND COLUMN_NAME = 'smsOptOutReason') = 0,
  'ALTER TABLE LearnerAccount ADD COLUMN smsOptOutReason VARCHAR(40) NULL',
  'SELECT 1'
));
PREPARE stmt FROM @sql_smsOptOutReason; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql_lastOptOutAt = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LearnerAccount'
     AND COLUMN_NAME = 'lastOptOutAt') = 0,
  'ALTER TABLE LearnerAccount ADD COLUMN lastOptOutAt DATETIME(3) NULL',
  'SELECT 1'
));
PREPARE stmt FROM @sql_lastOptOutAt; EXECUTE stmt; DEALLOCATE PREPARE stmt;
