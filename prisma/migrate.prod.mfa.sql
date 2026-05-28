-- Production MySQL migration: Add MFA tables and WebAuthn columns
-- Apply this SQL to the Hostinger production database via phpMyAdmin or mysql CLI
-- Date: 2026-04-19

-- 1. Create MfaFactor table
CREATE TABLE IF NOT EXISTS `MfaFactor` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `label` VARCHAR(191) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `totpSecretEncrypted` MEDIUMTEXT NULL,
    `webauthnCredentialId` VARCHAR(191) NULL,
    `webauthnPublicKey` LONGTEXT NULL,
    `webauthnCounter` INT NULL,
    `webauthnTransports` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `activatedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`),
    INDEX `MfaFactor_userId_method_status_idx` (`userId`, `method`, `status`),
    UNIQUE INDEX `MfaFactor_webauthnCredentialId_key` (`webauthnCredentialId`),
    CONSTRAINT `MfaFactor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Create BackupCode table
CREATE TABLE IF NOT EXISTS `BackupCode` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    UNIQUE INDEX `BackupCode_codeHash_key` (`codeHash`),
    INDEX `BackupCode_userId_usedAt_idx` (`userId`, `usedAt`),
    CONSTRAINT `BackupCode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Add AccountStatus enum values if not present (DISABLED was added for MFA disable)
-- MySQL stores enums as strings in the User table; check if DISABLED exists
-- This is safe to run: if the column already has these values, it will simply confirm the ALTER
-- ALTER TABLE `User` MODIFY COLUMN `status` ENUM('ACTIVE', 'INVITED', 'SUSPENDED', 'ARCHIVED', 'DISABLED') NOT NULL DEFAULT 'ACTIVE';
-- NOTE: Only run the above ALTER if the DISABLED status is not yet in the enum.
-- For safety, check first: SELECT DISTINCT status FROM User;
-- If DISABLED is missing, uncomment the ALTER above.

-- 4. Fix BlogPost categories and tags columns
-- MySQL strict mode disallows default values on TEXT columns
-- These columns were previously String @default("[]") @db.Text which fails in MySQL strict mode
-- Change to nullable TEXT (application code defaults to [])
ALTER TABLE `BlogPost` MODIFY COLUMN `categories` TEXT NULL DEFAULT NULL;
ALTER TABLE `BlogPost` MODIFY COLUMN `tags` TEXT NULL DEFAULT NULL;