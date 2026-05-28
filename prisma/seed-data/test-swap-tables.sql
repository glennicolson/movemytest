CREATE TABLE `TestCentre` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `officialName` VARCHAR(191) NOT NULL,
  `displayName` VARCHAR(191) NOT NULL,
  `region` VARCHAR(191) NOT NULL,
  `regionSlug` VARCHAR(191) NOT NULL,
  `country` ENUM('ENGLAND','SCOTLAND','WALES','NORTHERN_IRELAND') NOT NULL,
  `sourceAgency` ENUM('DVSA','DVA') NOT NULL,
  `addressLines` JSON NULL,
  `postcode` VARCHAR(191) NULL,
  `latitude` DECIMAL(9,6) NULL,
  `longitude` DECIMAL(9,6) NULL,
  `centreType` VARCHAR(191) NOT NULL DEFAULT 'practical driving test',
  `active` BOOLEAN NOT NULL DEFAULT true,
  `sourceUrl` TEXT NOT NULL,
  `sourceLastCheckedAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `TestCentre_slug_key`(`slug`),
  INDEX `TestCentre_regionSlug_idx`(`regionSlug`),
  INDEX `TestCentre_country_sourceAgency_idx`(`country`, `sourceAgency`),
  INDEX `TestCentre_active_idx`(`active`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestCentreNeighbour` (
  `id` VARCHAR(191) NOT NULL,
  `centreId` VARCHAR(191) NOT NULL,
  `neighbourId` VARCHAR(191) NOT NULL,
  `distanceMiles` DECIMAL(6,2) NULL,
  `rank` INTEGER NOT NULL,
  `sourceUrl` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `TestCentreNeighbour_centreId_neighbourId_key`(`centreId`, `neighbourId`),
  INDEX `TestCentreNeighbour_centreId_rank_idx`(`centreId`, `rank`),
  INDEX `TestCentreNeighbour_neighbourId_idx`(`neighbourId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapListing` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `currentCentreId` VARCHAR(191) NOT NULL,
  `originalCentreId` VARCHAR(191) NULL,
  `currentDateTime` DATETIME(3) NOT NULL,
  `testType` ENUM('WEEKDAY_STANDARD_CAR','EVENING_WEEKEND_BANK_HOLIDAY_STANDARD_CAR','EXTRA_TIME_SPECIAL_REQUIREMENTS','EXTENDED_WEEKDAY','EXTENDED_EVENING_WEEKEND_BANK_HOLIDAY') NOT NULL,
  `hasRemainingChange` BOOLEAN NOT NULL,
  `desiredDateFrom` DATETIME(3) NOT NULL,
  `desiredDateTo` DATETIME(3) NOT NULL,
  `desiredTimePreference` ENUM('ANY','MORNING','AFTERNOON','EVENING') NOT NULL DEFAULT 'ANY',
  `desiredCentreIds` JSON NOT NULL,
  `desiredDirection` ENUM('EARLIER','LATER','EITHER') NOT NULL,
  `status` ENUM('ACTIVE','PAUSED','MATCHED','COMPLETED','EXPIRED','DELETED','BANNED') NOT NULL DEFAULT 'ACTIVE',
  `jurisdiction` ENUM('GB_DVSA','NI_DVA') NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `TestSwapListing_userId_status_idx`(`userId`, `status`),
  INDEX `TestSwapListing_currentCentreId_status_idx`(`currentCentreId`, `status`),
  INDEX `TestSwapListing_jurisdiction_status_idx`(`jurisdiction`, `status`),
  INDEX `TestSwapListing_currentDateTime_idx`(`currentDateTime`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapMatch` (
  `id` VARCHAR(191) NOT NULL,
  `listingAId` VARCHAR(191) NOT NULL,
  `listingBId` VARCHAR(191) NOT NULL,
  `status` ENUM('PROPOSED','LEARNER_A_ACCEPTED','LEARNER_B_ACCEPTED','BOTH_ACCEPTED','BOOKING_REFERENCE_CONSENT_REQUESTED','BOOKING_REFERENCE_SHARED','COMPLETED','DECLINED','EXPIRED','REPORTED') NOT NULL DEFAULT 'PROPOSED',
  `score` INTEGER NOT NULL DEFAULT 0,
  `qualitySummary` TEXT NULL,
  `ineligibleReasons` JSON NULL,
  `learnerAAcceptedAt` DATETIME(3) NULL,
  `learnerBAcceptedAt` DATETIME(3) NULL,
  `bothAcceptedAt` DATETIME(3) NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `TestSwapMatch_listingAId_listingBId_key`(`listingAId`, `listingBId`),
  INDEX `TestSwapMatch_status_idx`(`status`),
  INDEX `TestSwapMatch_expiresAt_idx`(`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapMatchEvent` (
  `id` VARCHAR(191) NOT NULL,
  `matchId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `eventType` VARCHAR(191) NOT NULL,
  `detail` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `TestSwapMatchEvent_matchId_createdAt_idx`(`matchId`, `createdAt`),
  INDEX `TestSwapMatchEvent_userId_idx`(`userId`),
  INDEX `TestSwapMatchEvent_eventType_idx`(`eventType`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapBookingReferenceSecret` (
  `id` VARCHAR(191) NOT NULL,
  `matchId` VARCHAR(191) NOT NULL,
  `ownerUserId` VARCHAR(191) NOT NULL,
  `encryptedValue` TEXT NOT NULL,
  `iv` VARCHAR(191) NOT NULL,
  `authTag` VARCHAR(191) NOT NULL,
  `revealedAt` DATETIME(3) NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `TestSwapBookingReferenceSecret_matchId_ownerUserId_idx`(`matchId`, `ownerUserId`),
  INDEX `TestSwapBookingReferenceSecret_expiresAt_idx`(`expiresAt`),
  INDEX `TestSwapBookingReferenceSecret_deletedAt_idx`(`deletedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapReport` (
  `id` VARCHAR(191) NOT NULL,
  `listingId` VARCHAR(191) NULL,
  `matchId` VARCHAR(191) NULL,
  `reporterUserId` VARCHAR(191) NOT NULL,
  `reason` VARCHAR(191) NOT NULL,
  `detail` TEXT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `TestSwapReport_status_createdAt_idx`(`status`, `createdAt`),
  INDEX `TestSwapReport_listingId_idx`(`listingId`),
  INDEX `TestSwapReport_matchId_idx`(`matchId`),
  INDEX `TestSwapReport_reporterUserId_idx`(`reporterUserId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapAdminNote` (
  `id` VARCHAR(191) NOT NULL,
  `entityType` VARCHAR(191) NOT NULL,
  `entityId` VARCHAR(191) NOT NULL,
  `authorUserId` VARCHAR(191) NOT NULL,
  `note` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `TestSwapAdminNote_entityType_entityId_idx`(`entityType`, `entityId`),
  INDEX `TestSwapAdminNote_authorUserId_idx`(`authorUserId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `TestCentreNeighbour` ADD CONSTRAINT `TestCentreNeighbour_centreId_fkey` FOREIGN KEY (`centreId`) REFERENCES `TestCentre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TestCentreNeighbour` ADD CONSTRAINT `TestCentreNeighbour_neighbourId_fkey` FOREIGN KEY (`neighbourId`) REFERENCES `TestCentre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TestSwapListing` ADD CONSTRAINT `TestSwapListing_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TestSwapListing` ADD CONSTRAINT `TestSwapListing_currentCentreId_fkey` FOREIGN KEY (`currentCentreId`) REFERENCES `TestCentre`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `TestSwapListing` ADD CONSTRAINT `TestSwapListing_originalCentreId_fkey` FOREIGN KEY (`originalCentreId`) REFERENCES `TestCentre`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `TestSwapMatch` ADD CONSTRAINT `TestSwapMatch_listingAId_fkey` FOREIGN KEY (`listingAId`) REFERENCES `TestSwapListing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TestSwapMatch` ADD CONSTRAINT `TestSwapMatch_listingBId_fkey` FOREIGN KEY (`listingBId`) REFERENCES `TestSwapListing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TestSwapMatchEvent` ADD CONSTRAINT `TestSwapMatchEvent_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `TestSwapMatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TestSwapMatchEvent` ADD CONSTRAINT `TestSwapMatchEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `TestSwapBookingReferenceSecret` ADD CONSTRAINT `TestSwapBookingReferenceSecret_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `TestSwapMatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TestSwapReport` ADD CONSTRAINT `TestSwapReport_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `TestSwapListing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `TestSwapReport` ADD CONSTRAINT `TestSwapReport_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `TestSwapMatch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `TestSwapReport` ADD CONSTRAINT `TestSwapReport_reporterUserId_fkey` FOREIGN KEY (`reporterUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TestSwapAdminNote` ADD CONSTRAINT `TestSwapAdminNote_authorUserId_fkey` FOREIGN KEY (`authorUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- Create separate DTC Test Swap learner account tables and link Test Swap records to them.

CREATE TABLE `TestSwapLearnerAccount` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `status` ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `termsAcceptedAt` DATETIME(3) NOT NULL,
  `privacyAcceptedAt` DATETIME(3) NOT NULL,
  `officialProcessAcknowledgedAt` DATETIME(3) NOT NULL,
  `marketingConsentAt` DATETIME(3) NULL,
  `emailVerifiedAt` DATETIME(3) NULL,
  `lastLoginAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `TestSwapLearnerAccount_email_key`(`email`),
  INDEX `TestSwapLearnerAccount_status_createdAt_idx`(`status`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapLearnerConsent` (
  `id` VARCHAR(191) NOT NULL,
  `accountId` VARCHAR(191) NOT NULL,
  `consentType` VARCHAR(191) NOT NULL,
  `consentVersion` VARCHAR(191) NOT NULL,
  `acceptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` TEXT NULL,
  INDEX `TestSwapLearnerConsent_accountId_consentType_idx`(`accountId`, `consentType`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `TestSwapListing`
  ADD COLUMN `testSwapAccountId` VARCHAR(191) NULL,
  MODIFY `userId` VARCHAR(191) NULL;

ALTER TABLE `TestSwapMatchEvent`
  ADD COLUMN `testSwapAccountId` VARCHAR(191) NULL;

ALTER TABLE `TestSwapBookingReferenceSecret`
  ADD COLUMN `ownerTestSwapAccountId` VARCHAR(191) NULL,
  MODIFY `ownerUserId` VARCHAR(191) NULL;

ALTER TABLE `TestSwapReport`
  ADD COLUMN `reporterTestSwapAccountId` VARCHAR(191) NULL,
  MODIFY `reporterUserId` VARCHAR(191) NULL;

CREATE INDEX `TestSwapListing_testSwapAccountId_status_idx` ON `TestSwapListing`(`testSwapAccountId`, `status`);
CREATE INDEX `TestSwapMatchEvent_testSwapAccountId_idx` ON `TestSwapMatchEvent`(`testSwapAccountId`);
CREATE INDEX `TestSwapBookingReferenceSecret_matchId_ownerTSA_idx` ON `TestSwapBookingReferenceSecret`(`matchId`, `ownerTestSwapAccountId`);
CREATE INDEX `TestSwapReport_reporterTestSwapAccountId_idx` ON `TestSwapReport`(`reporterTestSwapAccountId`);

ALTER TABLE `TestSwapLearnerConsent`
  ADD CONSTRAINT `TestSwapLearnerConsent_accountId_fkey`
  FOREIGN KEY (`accountId`) REFERENCES `TestSwapLearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `TestSwapListing`
  ADD CONSTRAINT `TestSwapListing_testSwapAccountId_fkey`
  FOREIGN KEY (`testSwapAccountId`) REFERENCES `TestSwapLearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `TestSwapMatchEvent`
  ADD CONSTRAINT `TestSwapMatchEvent_testSwapAccountId_fkey`
  FOREIGN KEY (`testSwapAccountId`) REFERENCES `TestSwapLearnerAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `TestSwapBookingReferenceSecret`
  ADD CONSTRAINT `TestSwapBookingReferenceSecret_ownerTSA_fkey`
  FOREIGN KEY (`ownerTestSwapAccountId`) REFERENCES `TestSwapLearnerAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `TestSwapReport`
  ADD CONSTRAINT `TestSwapReport_reporterTestSwapAccountId_fkey`
  FOREIGN KEY (`reporterTestSwapAccountId`) REFERENCES `TestSwapLearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `TestSwapLearnerAccount`
  ADD COLUMN `mobileNumber` VARCHAR(191) NULL,
  ADD COLUMN `mobileContactConsentAt` DATETIME(3) NULL,
  ADD COLUMN `accountSetupCompletedAt` DATETIME(3) NULL;

ALTER TABLE `TestSwapListing`
  ADD COLUMN `bookingReferenceEncrypted` TEXT NULL,
  ADD COLUMN `bookingReferenceIv` VARCHAR(191) NULL,
  ADD COLUMN `bookingReferenceAuthTag` VARCHAR(191) NULL;
-- Add separate DTC Test Swap instructor account, invite, and listing-link tables.

CREATE TABLE `TestSwapInstructorAccount` (
  `id` VARCHAR(191) NOT NULL,
  `adiNumber` VARCHAR(191) NOT NULL,
  `firstName` VARCHAR(191) NOT NULL,
  `lastName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `mobileNumber` VARCHAR(191) NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
  `emailVerifiedAt` DATETIME(3) NULL,
  `mobileVerifiedAt` DATETIME(3) NULL,
  `lastLoginAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `TestSwapInstructorAccount_adiNumber_key`(`adiNumber`),
  UNIQUE INDEX `TestSwapInstructorAccount_email_key`(`email`),
  INDEX `TestSwapInstructorAccount_adiNumber_status_idx`(`adiNumber`, `status`),
  INDEX `TestSwapInstructorAccount_email_status_idx`(`email`, `status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapListingInstructor` (
  `id` VARCHAR(191) NOT NULL,
  `listingId` VARCHAR(191) NOT NULL,
  `instructorAccountId` VARCHAR(191) NULL,
  `adiNumber` VARCHAR(191) NOT NULL,
  `firstName` VARCHAR(191) NOT NULL,
  `lastName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `mobileNumber` VARCHAR(191) NULL,
  `learnerConfirmedPermissionAt` DATETIME(3) NOT NULL,
  `learnerConfirmedAvailabilityCheckAt` DATETIME(3) NOT NULL,
  `inviteSentAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `TestSwapListingInstructor_listingId_key`(`listingId`),
  INDEX `TestSwapListingInstructor_adiNumber_idx`(`adiNumber`),
  INDEX `TestSwapListingInstructor_instructorAccountId_idx`(`instructorAccountId`),
  INDEX `TestSwapListingInstructor_email_idx`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapInstructorInvite` (
  `id` VARCHAR(191) NOT NULL,
  `listingInstructorId` VARCHAR(191) NOT NULL,
  `instructorAccountId` VARCHAR(191) NULL,
  `email` VARCHAR(191) NOT NULL,
  `adiNumber` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `inviteSentAt` DATETIME(3) NULL,
  `inviteError` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `TestSwapInstructorInvite_email_status_idx`(`email`, `status`),
  INDEX `TestSwapInstructorInvite_adiNumber_status_idx`(`adiNumber`, `status`),
  INDEX `TestSwapInstructorInvite_listingInstructorId_idx`(`listingInstructorId`),
  INDEX `TestSwapInstructorInvite_instructorAccountId_idx`(`instructorAccountId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `TestSwapListingInstructor`
  ADD CONSTRAINT `TestSwapListingInstructor_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `TestSwapListing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `TestSwapListingInstructor_instructorAccountId_fkey` FOREIGN KEY (`instructorAccountId`) REFERENCES `TestSwapInstructorAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `TestSwapInstructorInvite`
  ADD CONSTRAINT `TestSwapInstructorInvite_listingInstructorId_fkey` FOREIGN KEY (`listingInstructorId`) REFERENCES `TestSwapListingInstructor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `TestSwapInstructorInvite_instructorAccountId_fkey` FOREIGN KEY (`instructorAccountId`) REFERENCES `TestSwapInstructorAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
-- Add DTC Test Swap match consent, DVSA call-window, completion, cancellation, and archive timestamps.

ALTER TABLE `TestSwapMatch`
  ADD COLUMN `learnerABookingReferenceConfirmedAt` DATETIME(3) NULL,
  ADD COLUMN `learnerBBookingReferenceConfirmedAt` DATETIME(3) NULL,
  ADD COLUMN `callWindowStartedAt` DATETIME(3) NULL,
  ADD COLUMN `callWindowExpiresAt` DATETIME(3) NULL,
  ADD COLUMN `learnerACompletedAt` DATETIME(3) NULL,
  ADD COLUMN `learnerBCompletedAt` DATETIME(3) NULL,
  ADD COLUMN `cancelledAt` DATETIME(3) NULL,
  ADD COLUMN `cancelReason` TEXT NULL,
  ADD COLUMN `archivedAt` DATETIME(3) NULL;

CREATE INDEX `TestSwapMatch_callWindowExpiresAt_idx` ON `TestSwapMatch`(`callWindowExpiresAt`);
CREATE INDEX `TestSwapMatch_archivedAt_idx` ON `TestSwapMatch`(`archivedAt`);
-- Add DVSA caller volunteer fields to match.
ALTER TABLE `TestSwapMatch`
  ADD COLUMN `learnerADvsaCallerAt` DATETIME(3) NULL,
  ADD COLUMN `learnerBDvsaCallerAt` DATETIME(3) NULL;

-- Email queue for automated Test Swap reminders.
CREATE TABLE `TestSwapEmailQueue` (
  `id` VARCHAR(191) NOT NULL,
  `matchId` VARCHAR(191) NOT NULL,
  `kind` VARCHAR(191) NOT NULL,
  `recipient` VARCHAR(191) NOT NULL,
  `recipientRole` VARCHAR(191) NOT NULL DEFAULT 'LEARNER',
  `scheduledFor` DATETIME(3) NOT NULL,
  `sentAt` DATETIME(3) NULL,
  `error` TEXT NULL,
  `retryCount` INTEGER NOT NULL DEFAULT 0,
  `maxRetries` INTEGER NOT NULL DEFAULT 3,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `TestSwapEmailQueue_status_scheduledFor_idx` (`status`, `scheduledFor`),
  INDEX `TestSwapEmailQueue_matchId_idx` (`matchId`),
  INDEX `TestSwapEmailQueue_matchId_kind_recipient_idx` (`matchId`, `kind`, `recipient`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `TestSwapEmailQueue`
  ADD CONSTRAINT `TestSwapEmailQueue_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `TestSwapMatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- Add independent Test Swap instructor availability decisions and audit log.

CREATE TABLE `TestSwapInstructorAvailabilityDecision` (
  `id` VARCHAR(191) NOT NULL,
  `listingInstructorId` VARCHAR(191) NOT NULL,
  `instructorAccountId` VARCHAR(191) NULL,
  `matchId` VARCHAR(191) NULL,
  `slotType` ENUM('CURRENT_TEST', 'PROPOSED_SWAP') NOT NULL,
  `status` ENUM('AVAILABLE', 'UNAVAILABLE', 'NEEDS_DISCUSSION') NOT NULL,
  `note` TEXT NULL,
  `decidedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `tsi_avail_link_slot_decided_idx` (`listingInstructorId`, `slotType`, `decidedAt`),
  INDEX `tsi_avail_acct_decided_idx` (`instructorAccountId`, `decidedAt`),
  INDEX `tsi_avail_match_slot_decided_idx` (`matchId`, `slotType`, `decidedAt`),
  INDEX `tsi_avail_status_idx` (`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapInstructorAuditLog` (
  `id` VARCHAR(191) NOT NULL,
  `instructorAccountId` VARCHAR(191) NULL,
  `listingInstructorId` VARCHAR(191) NULL,
  `matchId` VARCHAR(191) NULL,
  `action` VARCHAR(191) NOT NULL,
  `detail` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `tsi_audit_acct_created_idx` (`instructorAccountId`, `createdAt`),
  INDEX `tsi_audit_link_created_idx` (`listingInstructorId`, `createdAt`),
  INDEX `tsi_audit_match_created_idx` (`matchId`, `createdAt`),
  INDEX `tsi_audit_action_idx` (`action`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `TestSwapInstructorAvailabilityDecision`
  ADD CONSTRAINT `tsi_avail_link_fk` FOREIGN KEY (`listingInstructorId`) REFERENCES `TestSwapListingInstructor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tsi_avail_account_fk` FOREIGN KEY (`instructorAccountId`) REFERENCES `TestSwapInstructorAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tsi_avail_match_fk` FOREIGN KEY (`matchId`) REFERENCES `TestSwapMatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `TestSwapInstructorAuditLog`
  ADD CONSTRAINT `tsi_audit_account_fk` FOREIGN KEY (`instructorAccountId`) REFERENCES `TestSwapInstructorAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tsi_audit_link_fk` FOREIGN KEY (`listingInstructorId`) REFERENCES `TestSwapListingInstructor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tsi_audit_match_fk` FOREIGN KEY (`matchId`) REFERENCES `TestSwapMatch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
-- Bridge DTC CRM users/instructors to dedicated Test Swap accounts and add learner invite records.

ALTER TABLE `TestSwapLearnerAccount`
  ADD COLUMN `crmUserId` VARCHAR(191) NULL;

ALTER TABLE `TestSwapInstructorAccount`
  ADD COLUMN `crmInstructorProfileId` VARCHAR(191) NULL;

CREATE TABLE `TestSwapLearnerInvite` (
  `id` VARCHAR(191) NOT NULL,
  `invitedByUserId` VARCHAR(191) NULL,
  `invitedByInstructorProfileId` VARCHAR(191) NULL,
  `invitedByInstructorAccountId` VARCHAR(191) NULL,
  `claimedByTestSwapAccountId` VARCHAR(191) NULL,
  `learnerName` VARCHAR(191) NULL,
  `email` VARCHAR(191) NOT NULL,
  `mobileNumber` VARCHAR(191) NULL,
  `instructorAdiNumber` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `tokenHash` VARCHAR(191) NULL,
  `inviteSentAt` DATETIME(3) NULL,
  `inviteError` TEXT NULL,
  `claimedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `ts_linvite_email_status_idx` (`email`, `status`),
  INDEX `ts_linvite_user_created_idx` (`invitedByUserId`, `createdAt`),
  INDEX `ts_linvite_crm_inst_created_idx` (`invitedByInstructorProfileId`, `createdAt`),
  INDEX `ts_linvite_ts_inst_created_idx` (`invitedByInstructorAccountId`, `createdAt`),
  INDEX `ts_linvite_account_idx` (`claimedByTestSwapAccountId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `TestSwapLearnerAccount_crmUserId_key` ON `TestSwapLearnerAccount`(`crmUserId`);
CREATE INDEX `ts_learner_crm_user_idx` ON `TestSwapLearnerAccount`(`crmUserId`);
CREATE UNIQUE INDEX `TestSwapInstructorAccount_crmInstructorProfileId_key` ON `TestSwapInstructorAccount`(`crmInstructorProfileId`);
CREATE INDEX `ts_inst_crm_profile_idx` ON `TestSwapInstructorAccount`(`crmInstructorProfileId`);

ALTER TABLE `TestSwapLearnerAccount`
  ADD CONSTRAINT `ts_learner_crm_user_fk` FOREIGN KEY (`crmUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `TestSwapInstructorAccount`
  ADD CONSTRAINT `ts_inst_crm_profile_fk` FOREIGN KEY (`crmInstructorProfileId`) REFERENCES `InstructorProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `TestSwapLearnerInvite`
  ADD CONSTRAINT `ts_linvite_user_fk` FOREIGN KEY (`invitedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ts_linvite_crm_inst_fk` FOREIGN KEY (`invitedByInstructorProfileId`) REFERENCES `InstructorProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ts_linvite_ts_inst_fk` FOREIGN KEY (`invitedByInstructorAccountId`) REFERENCES `TestSwapInstructorAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ts_linvite_account_fk` FOREIGN KEY (`claimedByTestSwapAccountId`) REFERENCES `TestSwapLearnerAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
CREATE TABLE `TestSwapLearnerMfaFactor` (
  `id` VARCHAR(191) NOT NULL,
  `accountId` VARCHAR(191) NOT NULL,
  `method` ENUM('TOTP', 'WEBAUTHN') NOT NULL,
  `status` ENUM('PENDING', 'ACTIVE', 'DISABLED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
  `label` VARCHAR(191) NULL,
  `isPrimary` BOOLEAN NOT NULL DEFAULT false,
  `totpSecretEncrypted` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `activatedAt` DATETIME(3) NULL,
  `revokedAt` DATETIME(3) NULL,

  PRIMARY KEY (`id`),
  INDEX `ts_lmfa_account_method_status_idx`(`accountId`, `method`, `status`),
  CONSTRAINT `ts_lmfa_account_fk` FOREIGN KEY (`accountId`) REFERENCES `TestSwapLearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TestSwapLearnerBackupCode` (
  `id` VARCHAR(191) NOT NULL,
  `accountId` VARCHAR(191) NOT NULL,
  `codeHash` VARCHAR(191) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE INDEX `TestSwapLearnerBackupCode_codeHash_key`(`codeHash`),
  INDEX `ts_lbackup_account_used_idx`(`accountId`, `usedAt`),
  CONSTRAINT `ts_lbackup_account_fk` FOREIGN KEY (`accountId`) REFERENCES `TestSwapLearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
