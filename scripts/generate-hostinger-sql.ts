import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function generateSQL() {
  console.log("-- MoveMyTest Hostinger Database Setup");
  console.log("-- Generated:", new Date().toISOString());
  console.log("-- Run this SQL in your Hostinger MySQL database");
  console.log("");
  console.log("SET FOREIGN_KEY_CHECKS = 0;");
  console.log("");

  // Schema from migrations
  const schemaSQL = `
-- CreateTable
CREATE TABLE \`LearnerAccount\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`email\` VARCHAR(191) NOT NULL,
    \`passwordHash\` VARCHAR(191) NOT NULL,
    \`mobileNumber\` VARCHAR(191) NULL,
    \`status\` ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    \`termsAcceptedAt\` DATETIME(3) NOT NULL,
    \`privacyAcceptedAt\` DATETIME(3) NOT NULL,
    \`officialProcessAcknowledgedAt\` DATETIME(3) NOT NULL,
    \`mobileContactConsentAt\` DATETIME(3) NULL,
    \`accountSetupCompletedAt\` DATETIME(3) NULL,
    \`marketingConsentAt\` DATETIME(3) NULL,
    \`emailVerifiedAt\` DATETIME(3) NULL,
    \`lastLoginAt\` DATETIME(3) NULL,
    \`resetToken\` VARCHAR(191) NULL,
    \`resetTokenExpiresAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    UNIQUE INDEX \`LearnerAccount_email_key\`(\`email\`),
    INDEX \`LearnerAccount_status_createdAt_idx\`(\`status\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`LearnerMfaFactor\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`accountId\` VARCHAR(191) NOT NULL,
    \`method\` ENUM('TOTP', 'WEBAUTHN') NOT NULL,
    \`status\` ENUM('PENDING', 'ACTIVE', 'DISABLED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
    \`label\` VARCHAR(191) NULL,
    \`isPrimary\` BOOLEAN NOT NULL DEFAULT false,
    \`totpSecretEncrypted\` TEXT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`activatedAt\` DATETIME(3) NULL,
    \`revokedAt\` DATETIME(3) NULL,

    INDEX \`LearnerMfaFactor_accountId_method_status_idx\`(\`accountId\`, \`method\`, \`status\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`LearnerBackupCode\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`accountId\` VARCHAR(191) NOT NULL,
    \`codeHash\` VARCHAR(191) NOT NULL,
    \`usedAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX \`LearnerBackupCode_codeHash_key\`(\`codeHash\`),
    INDEX \`LearnerBackupCode_accountId_usedAt_idx\`(\`accountId\`, \`usedAt\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`LearnerInvite\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`invitedByInstructorAccountId\` VARCHAR(191) NULL,
    \`claimedByAccountId\` VARCHAR(191) NULL,
    \`learnerName\` VARCHAR(191) NULL,
    \`email\` VARCHAR(191) NOT NULL,
    \`mobileNumber\` VARCHAR(191) NULL,
    \`instructorAdiNumber\` VARCHAR(191) NULL,
    \`status\` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    \`tokenHash\` VARCHAR(191) NULL,
    \`inviteSentAt\` DATETIME(3) NULL,
    \`inviteError\` TEXT NULL,
    \`claimedAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    INDEX \`LearnerInvite_email_status_idx\`(\`email\`, \`status\`),
    INDEX \`LearnerInvite_invitedByInstructorAccountId_createdAt_idx\`(\`invitedByInstructorAccountId\`, \`createdAt\`),
    INDEX \`LearnerInvite_claimedByAccountId_idx\`(\`claimedByAccountId\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`LearnerConsent\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`accountId\` VARCHAR(191) NOT NULL,
    \`consentType\` VARCHAR(191) NOT NULL,
    \`consentVersion\` VARCHAR(191) NOT NULL,
    \`acceptedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`ipAddress\` VARCHAR(191) NULL,
    \`userAgent\` TEXT NULL,

    INDEX \`LearnerConsent_accountId_consentType_idx\`(\`accountId\`, \`consentType\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`TestCentre\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`slug\` VARCHAR(191) NOT NULL,
    \`name\` VARCHAR(191) NOT NULL,
    \`addressLine1\` VARCHAR(191) NULL,
    \`town\` VARCHAR(191) NULL,
    \`postcode\` VARCHAR(191) NULL,
    \`region\` VARCHAR(191) NULL,
    \`passRate\` DOUBLE NULL,
    \`latitude\` DOUBLE NULL,
    \`longitude\` DOUBLE NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    UNIQUE INDEX \`TestCentre_slug_key\`(\`slug\`),
    INDEX \`TestCentre_region_idx\`(\`region\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`Listing\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`accountId\` VARCHAR(191) NULL,
    \`currentCentreId\` VARCHAR(191) NOT NULL,
    \`originalCentreId\` VARCHAR(191) NULL,
    \`currentDateTime\` DATETIME(3) NOT NULL,
    \`bookingReferenceEncrypted\` TEXT NULL,
    \`bookingReferenceIv\` VARCHAR(191) NULL,
    \`bookingReferenceAuthTag\` VARCHAR(191) NULL,
    \`testType\` ENUM('PRACTICAL_CAR', 'PRACTICAL_MOTORCYCLE', 'PRACTICAL_LGV', 'PRACTICAL_PCV', 'THEORY') NOT NULL DEFAULT 'PRACTICAL_CAR',
    \`hasRemainingChange\` BOOLEAN NOT NULL,
    \`desiredDateFrom\` DATETIME(3) NOT NULL,
    \`desiredDateTo\` DATETIME(3) NOT NULL,
    \`desiredTimePreference\` ENUM('ANY', 'MORNING', 'AFTERNOON', 'WEEKEND') NOT NULL DEFAULT 'ANY',
    \`desiredCentreIds\` JSON NOT NULL,
    \`desiredDirection\` ENUM('EARLIER', 'LATER', 'ANY') NOT NULL,
    \`status\` ENUM('ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    \`jurisdiction\` ENUM('ENGLAND', 'SCOTLAND', 'WALES', 'NORTHERN_IRELAND') NOT NULL DEFAULT 'ENGLAND',
    \`expiresAt\` DATETIME(3) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    INDEX \`Listing_accountId_status_idx\`(\`accountId\`, \`status\`),
    INDEX \`Listing_currentCentreId_status_idx\`(\`currentCentreId\`, \`status\`),
    INDEX \`Listing_jurisdiction_status_idx\`(\`jurisdiction\`, \`status\`),
    INDEX \`Listing_status_createdAt_idx\`(\`status\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`InstructorAccount\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`email\` VARCHAR(191) NULL,
    \`passwordHash\` VARCHAR(191) NOT NULL,
    \`firstName\` VARCHAR(191) NULL,
    \`lastName\` VARCHAR(191) NULL,
    \`adiNumber\` VARCHAR(191) NULL,
    \`mobileNumber\` VARCHAR(191) NULL,
    \`status\` ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    \`lastLoginAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    INDEX \`InstructorAccount_status_createdAt_idx\`(\`status\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`InstructorMfaFactor\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`instructorAccountId\` VARCHAR(191) NOT NULL,
    \`method\` ENUM('TOTP', 'WEBAUTHN') NOT NULL,
    \`status\` ENUM('PENDING', 'ACTIVE', 'DISABLED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
    \`label\` VARCHAR(191) NULL,
    \`isPrimary\` BOOLEAN NOT NULL DEFAULT false,
    \`totpSecretEncrypted\` TEXT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`activatedAt\` DATETIME(3) NULL,
    \`revokedAt\` DATETIME(3) NULL,

    INDEX \`InstructorMfaFactor_instructorAccountId_method_status_idx\`(\`instructorAccountId\`, \`method\`, \`status\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`InstructorBackupCode\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`instructorAccountId\` VARCHAR(191) NOT NULL,
    \`codeHash\` VARCHAR(191) NOT NULL,
    \`usedAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX \`InstructorBackupCode_codeHash_key\`(\`codeHash\`),
    INDEX \`InstructorBackupCode_instructorAccountId_usedAt_idx\`(\`instructorAccountId\`, \`usedAt\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`InstructorInvite\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`instructorAccountId\` VARCHAR(191) NULL,
    \`email\` VARCHAR(191) NOT NULL,
    \`tokenHash\` VARCHAR(191) NULL,
    \`status\` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    \`inviteSentAt\` DATETIME(3) NULL,
    \`inviteError\` TEXT NULL,
    \`claimedAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    INDEX \`InstructorInvite_email_status_idx\`(\`email\`, \`status\`),
    INDEX \`InstructorInvite_instructorAccountId_idx\`(\`instructorAccountId\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`ListingInstructor\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`listingId\` VARCHAR(191) NOT NULL,
    \`instructorAccountId\` VARCHAR(191) NULL,
    \`adiNumber\` VARCHAR(191) NULL,
    \`firstName\` VARCHAR(191) NULL,
    \`lastName\` VARCHAR(191) NULL,
    \`email\` VARCHAR(191) NULL,
    \`mobileNumber\` VARCHAR(191) NULL,
    \`learnerConfirmedPermissionAt\` DATETIME(3) NULL,
    \`learnerConfirmedAvailabilityCheckAt\` DATETIME(3) NULL,
    \`inviteSentAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    UNIQUE INDEX \`ListingInstructor_listingId_key\`(\`listingId\`),
    INDEX \`ListingInstructor_instructorAccountId_idx\`(\`instructorAccountId\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`InstructorAvailabilityDecision\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`instructorAccountId\` VARCHAR(191) NOT NULL,
    \`listingInstructorId\` VARCHAR(191) NOT NULL,
    \`matchId\` VARCHAR(191) NULL,
    \`slotType\` VARCHAR(191) NOT NULL,
    \`status\` ENUM('AVAILABLE', 'UNAVAILABLE', 'NO_RESPONSE') NOT NULL DEFAULT 'NO_RESPONSE',
    \`decidedAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    INDEX \`InstructorAvailabilityDecision_instructorAccountId_status_decidedAt_idx\`(\`instructorAccountId\`, \`status\`, \`decidedAt\`),
    INDEX \`InstructorAvailabilityDecision_listingInstructorId_idx\`(\`listingInstructorId\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`InstructorAuditLog\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`instructorAccountId\` VARCHAR(191) NOT NULL,
    \`listingInstructorId\` VARCHAR(191) NULL,
    \`action\` VARCHAR(191) NOT NULL,
    \`detail\` JSON NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX \`InstructorAuditLog_instructorAccountId_createdAt_idx\`(\`instructorAccountId\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`Match\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`listingAId\` VARCHAR(191) NOT NULL,
    \`listingBId\` VARCHAR(191) NOT NULL,
    \`score\` INT NOT NULL,
    \`status\` ENUM('PROPOSED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CONFIRMED', 'COMPLETED') NOT NULL DEFAULT 'PROPOSED',
    \`callWindowOpensAt\` DATETIME(3) NULL,
    \`callWindowExpiresAt\` DATETIME(3) NULL,
    \`aAcceptedAt\` DATETIME(3) NULL,
    \`bAcceptedAt\` DATETIME(3) NULL,
    \`aRevealedSecretAt\` DATETIME(3) NULL,
    \`bRevealedSecretAt\` DATETIME(3) NULL,
    \`cancelledAt\` DATETIME(3) NULL,
    \`cancelReason\` TEXT NULL,
    \`completedAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    UNIQUE INDEX \`Match_listingAId_listingBId_key\`(\`listingAId\`, \`listingBId\`),
    INDEX \`Match_status_createdAt_idx\`(\`status\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`MatchEvent\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`matchId\` VARCHAR(191) NOT NULL,
    \`actorRole\` ENUM('SYSTEM', 'LEARNER_A', 'LEARNER_B', 'INSTRUCTOR') NOT NULL DEFAULT 'SYSTEM',
    \`eventType\` VARCHAR(191) NOT NULL,
    \`payload\` JSON NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX \`MatchEvent_matchId_createdAt_idx\`(\`matchId\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`BookingReferenceSecret\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`matchId\` VARCHAR(191) NOT NULL,
    \`ownerAccountId\` VARCHAR(191) NULL,
    \`secretEncrypted\` TEXT NULL,
    \`revealedAt\` DATETIME(3) NULL,
    \`expiresAt\` DATETIME(3) NULL,
    \`deletedAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX \`BookingReferenceSecret_matchId_idx\`(\`matchId\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`Report\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`listingId\` VARCHAR(191) NULL,
    \`matchId\` VARCHAR(191) NULL,
    \`reporterAccountId\` VARCHAR(191) NULL,
    \`reason\` VARCHAR(191) NOT NULL,
    \`detail\` TEXT NULL,
    \`status\` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    \`mobileNumber\` VARCHAR(191) NULL,
    \`closedAt\` DATETIME(3) NULL,
    \`closedReason\` VARCHAR(191) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    INDEX \`Report_status_createdAt_idx\`(\`status\`, \`createdAt\`),
    INDEX \`Report_listingId_idx\`(\`listingId\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`ReportResponse\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`reportId\` VARCHAR(191) NOT NULL,
    \`authorAccountId\` VARCHAR(191) NULL,
    \`message\` TEXT NOT NULL,
    \`channel\` ENUM('EMAIL', 'PORTAL_REPLY') NOT NULL DEFAULT 'PORTAL_REPLY',
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX \`ReportResponse_reportId_createdAt_idx\`(\`reportId\`, \`createdAt\`),
    INDEX \`ReportResponse_authorAccountId_idx\`(\`authorAccountId\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`LearnerNotification\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`learnerAccountId\` VARCHAR(191) NOT NULL,
    \`title\` VARCHAR(191) NOT NULL,
    \`message\` TEXT NOT NULL,
    \`readAt\` DATETIME(3) NULL,
    \`actionUrl\` VARCHAR(191) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX \`LearnerNotification_learnerAccountId_readAt_createdAt_idx\`(\`learnerAccountId\`, \`readAt\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`EmailQueue\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`matchId\` VARCHAR(191) NULL,
    \`kind\` VARCHAR(191) NOT NULL,
    \`recipient\` VARCHAR(191) NOT NULL,
    \`recipientRole\` VARCHAR(191) NOT NULL,
    \`scheduledFor\` DATETIME(3) NOT NULL,
    \`sentAt\` DATETIME(3) NULL,
    \`error\` TEXT NULL,
    \`retryCount\` INT NOT NULL DEFAULT 0,
    \`maxRetries\` INT NOT NULL DEFAULT 3,
    \`status\` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    INDEX \`EmailQueue_status_scheduledFor_idx\`(\`status\`, \`scheduledFor\`),
    INDEX \`EmailQueue_matchId_idx\`(\`matchId\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`AdminNote\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`note\` TEXT NOT NULL,
    \`entityType\` VARCHAR(191) NOT NULL,
    \`entityId\` VARCHAR(191) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX \`AdminNote_entityType_entityId_idx\`(\`entityType\`, \`entityId\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE \`StaffAccount\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`email\` VARCHAR(191) NOT NULL,
    \`passwordHash\` VARCHAR(191) NOT NULL,
    \`name\` VARCHAR(191) NOT NULL,
    \`role\` ENUM('ADMIN', 'MANAGER', 'SUPPORT') NOT NULL DEFAULT 'ADMIN',
    \`lastLoginAt\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,

    UNIQUE INDEX \`StaffAccount_email_key\`(\`email\`),
    INDEX \`StaffAccount_role_createdAt_idx\`(\`role\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`;

  console.log(schemaSQL);

  // Now fetch and output test centres
  const centres = await prisma.testCentre.findMany({
    orderBy: [{ region: "asc" }, { name: "asc" }],
  });

  console.log(`\n-- Test Centre Seed Data (${centres.length} centres)`);
  console.log("");

  for (const c of centres) {
    const address = (c.addressLine1 || "").replace(/'/g, "\\'");
    const town = (c.town || "").replace(/'/g, "\\'");
    const postcode = (c.postcode || "").replace(/'/g, "\\'");
    const region = (c.region || "").replace(/'/g, "\\'");
    const name = c.name.replace(/'/g, "\\'");
    const slug = c.slug.replace(/'/g, "\\'");

    console.log(
      `INSERT INTO \`TestCentre\` (\`id\`, \`slug\`, \`name\`, \`addressLine1\`, \`town\`, \`postcode\`, \`region\`, \`passRate\`, \`latitude\`, \`longitude\`, \`createdAt\`, \`updatedAt\`) VALUES ('${c.id}', '${slug}', '${name}', '${address}', '${town}', '${postcode}', '${region}', ${c.passRate ?? "NULL"}, ${c.latitude ?? "NULL"}, ${c.longitude ?? "NULL"}, '${c.createdAt.toISOString().slice(0, 19).replace("T", " ")}', '${c.updatedAt.toISOString().slice(0, 19).replace("T", " ")}');`
    );
  }

  // Add staff account
  console.log("\n-- Staff Account Seed Data");
  console.log("");
  console.log("-- Default admin account: support@movemytest.co.uk / M0v3mYt35t");
  console.log(`INSERT INTO \`StaffAccount\` (\`id\`, \`email\`, \`passwordHash\`, \`name\`, \`role\`, \`createdAt\`, \`updatedAt\`) VALUES ('cmq1test0000admin001', 'support@movemytest.co.uk', 'scrypt-generated-hash-here', 'Support Team', 'ADMIN', NOW(), NOW());`);

  console.log("\nSET FOREIGN_KEY_CHECKS = 1;");
}

generateSQL()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
