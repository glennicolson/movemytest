-- Fix Match table schema for MoveMyTest live database
-- Run this via phpMyAdmin SQL tab or MySQL CLI

-- 1. Add all new columns as NULLABLE first (safe for existing rows)
ALTER TABLE `Match` 
  ADD COLUMN `qualitySummary` TEXT NULL,
  ADD COLUMN `ineligibleReasons` JSON NULL,
  ADD COLUMN `learnerAAcceptedAt` DATETIME(3) NULL,
  ADD COLUMN `learnerBAcceptedAt` DATETIME(3) NULL,
  ADD COLUMN `bothAcceptedAt` DATETIME(3) NULL,
  ADD COLUMN `learnerABookingReferenceConfirmedAt` DATETIME(3) NULL,
  ADD COLUMN `learnerBBookingReferenceConfirmedAt` DATETIME(3) NULL,
  ADD COLUMN `learnerADvsaCallerAt` DATETIME(3) NULL,
  ADD COLUMN `learnerBDvsaCallerAt` DATETIME(3) NULL,
  ADD COLUMN `callWindowStartedAt` DATETIME(3) NULL,
  ADD COLUMN `learnerACompletedAt` DATETIME(3) NULL,
  ADD COLUMN `learnerBCompletedAt` DATETIME(3) NULL,
  ADD COLUMN `archivedAt` DATETIME(3) NULL,
  ADD COLUMN `instructorConfirmedByLearnerAtA` DATETIME(3) NULL,
  ADD COLUMN `instructorConfirmedByLearnerAtB` DATETIME(3) NULL,
  ADD COLUMN `expiresAt` DATETIME(3) NULL;

-- 2. Update existing rows to have a default expiresAt (e.g. 30 days from createdAt, or just NOW())
UPDATE `Match` SET `expiresAt` = DATE_ADD(`createdAt`, INTERVAL 30 DAY) WHERE `expiresAt` IS NULL;

-- 3. Now make expiresAt NOT NULL
ALTER TABLE `Match` MODIFY COLUMN `expiresAt` DATETIME(3) NOT NULL;

-- 4. Update the status ENUM to include new values
ALTER TABLE `Match` MODIFY COLUMN `status` 
  ENUM('PROPOSED','ACCEPTED','DECLINED','EXPIRED','CONFIRMED','BOOKING_REFERENCE_SHARED','COMPLETED','REPORTED') 
  NOT NULL DEFAULT 'PROPOSED';

-- 5. Add missing indexes
ALTER TABLE `Match` ADD INDEX `Match_status_idx`(`status`);
ALTER TABLE `Match` ADD INDEX `Match_expiresAt_idx`(`expiresAt`);

-- 6. Rename old columns if they exist (from old schema)
-- Only run these if the old columns still exist:
-- ALTER TABLE `Match` CHANGE `aAcceptedAt` `learnerAAcceptedAt` DATETIME(3) NULL;
-- ALTER TABLE `Match` CHANGE `bAcceptedAt` `learnerBAcceptedAt` DATETIME(3) NULL;
-- ALTER TABLE `Match` DROP COLUMN `callWindowOpensAt`;
-- ALTER TABLE `Match` DROP COLUMN `aRevealedSecretAt`;
-- ALTER TABLE `Match` DROP COLUMN `bRevealedSecretAt`;
