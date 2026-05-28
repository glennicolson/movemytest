-- CreateTable
CREATE TABLE `LearnerAccount` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `mobileNumber` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `termsAcceptedAt` DATETIME(3) NOT NULL,
    `privacyAcceptedAt` DATETIME(3) NOT NULL,
    `officialProcessAcknowledgedAt` DATETIME(3) NOT NULL,
    `mobileContactConsentAt` DATETIME(3) NULL,
    `accountSetupCompletedAt` DATETIME(3) NULL,
    `marketingConsentAt` DATETIME(3) NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LearnerAccount_email_key`(`email`),
    INDEX `LearnerAccount_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LearnerMfaFactor` (
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

    INDEX `LearnerMfaFactor_accountId_method_status_idx`(`accountId`, `method`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LearnerBackupCode` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LearnerBackupCode_codeHash_key`(`codeHash`),
    INDEX `LearnerBackupCode_accountId_usedAt_idx`(`accountId`, `usedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LearnerInvite` (
    `id` VARCHAR(191) NOT NULL,
    `invitedByInstructorAccountId` VARCHAR(191) NULL,
    `claimedByAccountId` VARCHAR(191) NULL,
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

    INDEX `LearnerInvite_email_status_idx`(`email`, `status`),
    INDEX `LearnerInvite_invitedByInstructorAccountId_createdAt_idx`(`invitedByInstructorAccountId`, `createdAt`),
    INDEX `LearnerInvite_claimedByAccountId_idx`(`claimedByAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LearnerConsent` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `consentType` VARCHAR(191) NOT NULL,
    `consentVersion` VARCHAR(191) NOT NULL,
    `acceptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,

    INDEX `LearnerConsent_accountId_consentType_idx`(`accountId`, `consentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestCentre` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `addressLine1` VARCHAR(191) NULL,
    `town` VARCHAR(191) NULL,
    `postcode` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `passRate` DOUBLE NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TestCentre_slug_key`(`slug`),
    INDEX `TestCentre_region_idx`(`region`),
    INDEX `TestCentre_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Listing` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NULL,
    `currentCentreId` VARCHAR(191) NOT NULL,
    `originalCentreId` VARCHAR(191) NULL,
    `currentDateTime` DATETIME(3) NOT NULL,
    `bookingReferenceEncrypted` TEXT NULL,
    `bookingReferenceIv` VARCHAR(191) NULL,
    `bookingReferenceAuthTag` VARCHAR(191) NULL,
    `testType` ENUM('WEEKDAY_STANDARD_CAR', 'EVENING_WEEKEND_BANK_HOLIDAY_STANDARD_CAR', 'EXTRA_TIME_SPECIAL_REQUIREMENTS', 'EXTENDED_WEEKDAY', 'EXTENDED_EVENING_WEEKEND_BANK_HOLIDAY') NOT NULL,
    `hasRemainingChange` BOOLEAN NOT NULL,
    `desiredDateFrom` DATETIME(3) NOT NULL,
    `desiredDateTo` DATETIME(3) NOT NULL,
    `desiredTimePreference` ENUM('ANY', 'MORNING', 'AFTERNOON', 'EVENING') NOT NULL DEFAULT 'ANY',
    `desiredCentreIds` JSON NOT NULL,
    `desiredDirection` ENUM('EARLIER', 'LATER', 'EITHER') NOT NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'MATCHED', 'COMPLETED', 'EXPIRED', 'DELETED', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    `jurisdiction` ENUM('GB_DVSA', 'NI_DVA') NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Listing_accountId_status_idx`(`accountId`, `status`),
    INDEX `Listing_currentCentreId_status_idx`(`currentCentreId`, `status`),
    INDEX `Listing_jurisdiction_status_idx`(`jurisdiction`, `status`),
    INDEX `Listing_currentDateTime_idx`(`currentDateTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstructorAccount` (
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
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiresAt` DATETIME(3) NULL,
    `verificationToken` VARCHAR(191) NULL,
    `verificationTokenExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InstructorAccount_adiNumber_key`(`adiNumber`),
    UNIQUE INDEX `InstructorAccount_email_key`(`email`),
    INDEX `InstructorAccount_adiNumber_status_idx`(`adiNumber`, `status`),
    INDEX `InstructorAccount_email_status_idx`(`email`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstructorMfaFactor` (
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

    INDEX `InstructorMfaFactor_accountId_method_status_idx`(`accountId`, `method`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstructorBackupCode` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `InstructorBackupCode_codeHash_key`(`codeHash`),
    INDEX `InstructorBackupCode_accountId_usedAt_idx`(`accountId`, `usedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstructorInvite` (
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

    INDEX `InstructorInvite_email_status_idx`(`email`, `status`),
    INDEX `InstructorInvite_adiNumber_status_idx`(`adiNumber`, `status`),
    INDEX `InstructorInvite_listingInstructorId_idx`(`listingInstructorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListingInstructor` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `instructorAccountId` VARCHAR(191) NULL,
    `adiNumber` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `mobileNumber` VARCHAR(191) NULL,
    `learnerConfirmedPermissionAt` DATETIME(3) NULL,
    `learnerConfirmedAvailabilityCheckAt` DATETIME(3) NULL,
    `inviteSentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ListingInstructor_listingId_key`(`listingId`),
    INDEX `ListingInstructor_adiNumber_idx`(`adiNumber`),
    INDEX `ListingInstructor_instructorAccountId_idx`(`instructorAccountId`),
    INDEX `ListingInstructor_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstructorAvailabilityDecision` (
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

    INDEX `InstructorAvailabilityDecision_listingInstructorId_slotType__idx`(`listingInstructorId`, `slotType`, `decidedAt`),
    INDEX `InstructorAvailabilityDecision_instructorAccountId_decidedAt_idx`(`instructorAccountId`, `decidedAt`),
    INDEX `InstructorAvailabilityDecision_matchId_slotType_decidedAt_idx`(`matchId`, `slotType`, `decidedAt`),
    INDEX `InstructorAvailabilityDecision_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstructorAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `instructorAccountId` VARCHAR(191) NULL,
    `listingInstructorId` VARCHAR(191) NULL,
    `matchId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `detail` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InstructorAuditLog_instructorAccountId_createdAt_idx`(`instructorAccountId`, `createdAt`),
    INDEX `InstructorAuditLog_listingInstructorId_createdAt_idx`(`listingInstructorId`, `createdAt`),
    INDEX `InstructorAuditLog_matchId_createdAt_idx`(`matchId`, `createdAt`),
    INDEX `InstructorAuditLog_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `id` VARCHAR(191) NOT NULL,
    `listingAId` VARCHAR(191) NOT NULL,
    `listingBId` VARCHAR(191) NOT NULL,
    `status` ENUM('PROPOSED', 'LEARNER_A_ACCEPTED', 'LEARNER_B_ACCEPTED', 'BOTH_ACCEPTED', 'CALLER_PENDING', 'BOOKING_REFERENCE_CONSENT_REQUESTED', 'BOOKING_REFERENCE_SHARED', 'COMPLETED', 'DECLINED', 'EXPIRED', 'REPORTED') NOT NULL DEFAULT 'PROPOSED',
    `score` INTEGER NOT NULL DEFAULT 0,
    `qualitySummary` TEXT NULL,
    `ineligibleReasons` JSON NULL,
    `learnerAAcceptedAt` DATETIME(3) NULL,
    `learnerBAcceptedAt` DATETIME(3) NULL,
    `bothAcceptedAt` DATETIME(3) NULL,
    `learnerABookingReferenceConfirmedAt` DATETIME(3) NULL,
    `learnerBBookingReferenceConfirmedAt` DATETIME(3) NULL,
    `learnerADvsaCallerAt` DATETIME(3) NULL,
    `learnerBDvsaCallerAt` DATETIME(3) NULL,
    `callWindowStartedAt` DATETIME(3) NULL,
    `callWindowExpiresAt` DATETIME(3) NULL,
    `learnerACompletedAt` DATETIME(3) NULL,
    `learnerBCompletedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `cancelReason` TEXT NULL,
    `archivedAt` DATETIME(3) NULL,
    `instructorConfirmedByLearnerAtA` DATETIME(3) NULL,
    `instructorConfirmedByLearnerAtB` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Match_status_idx`(`status`),
    INDEX `Match_expiresAt_idx`(`expiresAt`),
    UNIQUE INDEX `Match_listingAId_listingBId_key`(`listingAId`, `listingBId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatchEvent` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `detail` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MatchEvent_matchId_createdAt_idx`(`matchId`, `createdAt`),
    INDEX `MatchEvent_accountId_idx`(`accountId`),
    INDEX `MatchEvent_eventType_idx`(`eventType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingReferenceSecret` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `ownerAccountId` VARCHAR(191) NULL,
    `encryptedValue` TEXT NOT NULL,
    `iv` VARCHAR(191) NOT NULL,
    `authTag` VARCHAR(191) NOT NULL,
    `revealedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BookingReferenceSecret_matchId_ownerAccountId_idx`(`matchId`, `ownerAccountId`),
    INDEX `BookingReferenceSecret_expiresAt_idx`(`expiresAt`),
    INDEX `BookingReferenceSecret_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NULL,
    `matchId` VARCHAR(191) NULL,
    `reporterAccountId` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NOT NULL,
    `detail` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    `mobileNumber` VARCHAR(191) NULL,
    `closedAt` DATETIME(3) NULL,
    `closedReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Report_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Report_listingId_idx`(`listingId`),
    INDEX `Report_matchId_idx`(`matchId`),
    INDEX `Report_reporterAccountId_idx`(`reporterAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportResponse` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `authorAccountId` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `channel` ENUM('PORTAL_REPLY', 'EMAIL_SENT', 'PHONE_CALL_NOTE') NOT NULL DEFAULT 'PORTAL_REPLY',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ReportResponse_reportId_createdAt_idx`(`reportId`, `createdAt`),
    INDEX `ReportResponse_authorAccountId_idx`(`authorAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LearnerNotification` (
    `id` VARCHAR(191) NOT NULL,
    `learnerAccountId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `readAt` DATETIME(3) NULL,
    `relatedReportId` VARCHAR(191) NULL,
    `relatedResponseId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LearnerNotification_learnerAccountId_readAt_idx`(`learnerAccountId`, `readAt`),
    INDEX `LearnerNotification_createdAt_idx`(`createdAt`),
    INDEX `LearnerNotification_relatedReportId_idx`(`relatedReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailQueue` (
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

    INDEX `EmailQueue_status_scheduledFor_idx`(`status`, `scheduledFor`),
    INDEX `EmailQueue_matchId_idx`(`matchId`),
    INDEX `EmailQueue_matchId_kind_recipient_idx`(`matchId`, `kind`, `recipient`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminNote` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `authorEmail` VARCHAR(191) NOT NULL,
    `note` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdminNote_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `AdminNote_authorEmail_idx`(`authorEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LearnerMfaFactor` ADD CONSTRAINT `LearnerMfaFactor_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `LearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearnerBackupCode` ADD CONSTRAINT `LearnerBackupCode_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `LearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearnerInvite` ADD CONSTRAINT `LearnerInvite_invitedByInstructorAccountId_fkey` FOREIGN KEY (`invitedByInstructorAccountId`) REFERENCES `InstructorAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearnerInvite` ADD CONSTRAINT `LearnerInvite_claimedByAccountId_fkey` FOREIGN KEY (`claimedByAccountId`) REFERENCES `LearnerAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearnerConsent` ADD CONSTRAINT `LearnerConsent_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `LearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `LearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_currentCentreId_fkey` FOREIGN KEY (`currentCentreId`) REFERENCES `TestCentre`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_originalCentreId_fkey` FOREIGN KEY (`originalCentreId`) REFERENCES `TestCentre`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorMfaFactor` ADD CONSTRAINT `InstructorMfaFactor_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `InstructorAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorBackupCode` ADD CONSTRAINT `InstructorBackupCode_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `InstructorAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorInvite` ADD CONSTRAINT `InstructorInvite_listingInstructorId_fkey` FOREIGN KEY (`listingInstructorId`) REFERENCES `ListingInstructor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorInvite` ADD CONSTRAINT `InstructorInvite_instructorAccountId_fkey` FOREIGN KEY (`instructorAccountId`) REFERENCES `InstructorAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingInstructor` ADD CONSTRAINT `ListingInstructor_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingInstructor` ADD CONSTRAINT `ListingInstructor_instructorAccountId_fkey` FOREIGN KEY (`instructorAccountId`) REFERENCES `InstructorAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorAvailabilityDecision` ADD CONSTRAINT `InstructorAvailabilityDecision_listingInstructorId_fkey` FOREIGN KEY (`listingInstructorId`) REFERENCES `ListingInstructor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorAvailabilityDecision` ADD CONSTRAINT `InstructorAvailabilityDecision_instructorAccountId_fkey` FOREIGN KEY (`instructorAccountId`) REFERENCES `InstructorAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorAvailabilityDecision` ADD CONSTRAINT `InstructorAvailabilityDecision_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorAuditLog` ADD CONSTRAINT `InstructorAuditLog_instructorAccountId_fkey` FOREIGN KEY (`instructorAccountId`) REFERENCES `InstructorAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorAuditLog` ADD CONSTRAINT `InstructorAuditLog_listingInstructorId_fkey` FOREIGN KEY (`listingInstructorId`) REFERENCES `ListingInstructor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorAuditLog` ADD CONSTRAINT `InstructorAuditLog_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_listingAId_fkey` FOREIGN KEY (`listingAId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_listingBId_fkey` FOREIGN KEY (`listingBId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchEvent` ADD CONSTRAINT `MatchEvent_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchEvent` ADD CONSTRAINT `MatchEvent_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `LearnerAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingReferenceSecret` ADD CONSTRAINT `BookingReferenceSecret_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingReferenceSecret` ADD CONSTRAINT `BookingReferenceSecret_ownerAccountId_fkey` FOREIGN KEY (`ownerAccountId`) REFERENCES `LearnerAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reporterAccountId_fkey` FOREIGN KEY (`reporterAccountId`) REFERENCES `LearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportResponse` ADD CONSTRAINT `ReportResponse_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportResponse` ADD CONSTRAINT `ReportResponse_authorAccountId_fkey` FOREIGN KEY (`authorAccountId`) REFERENCES `LearnerAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearnerNotification` ADD CONSTRAINT `LearnerNotification_learnerAccountId_fkey` FOREIGN KEY (`learnerAccountId`) REFERENCES `LearnerAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
