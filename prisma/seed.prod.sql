-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `userType` ENUM('STAFF', 'INSTRUCTOR', 'LEARNER') NOT NULL,
    `role` ENUM('ADMIN', 'MANAGER', 'OFFICE_STAFF', 'INSTRUCTOR', 'LEARNER') NOT NULL,
    `status` ENUM('INVITED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED') NOT NULL DEFAULT 'INVITED',
    `branchId` VARCHAR(191) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `purpose` ENUM('INVITE', 'PASSWORD_RESET') NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `consumedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AuthToken_tokenHash_key`(`tokenHash`),
    INDEX `AuthToken_userId_purpose_idx`(`userId`, `purpose`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `addressLine1` VARCHAR(191) NULL,
    `addressLine2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `postcode` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Branch_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaffProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StaffProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstructorProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `adiNumber` VARCHAR(191) NULL,
    `vehicleMake` VARCHAR(191) NULL,
    `vehicleModel` VARCHAR(191) NULL,
    `vehicleRegistration` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InstructorProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LearnerProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `assignedInstructorId` VARCHAR(191) NULL,
    `licenceNumber` VARCHAR(191) NULL,
    `provisionalExpiry` DATETIME(3) NULL,
    `targetTestDate` DATETIME(3) NULL,
    `onboardingStatus` VARCHAR(191) NULL,
    `balancePence` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LearnerProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST') NOT NULL DEFAULT 'NEW',
    `source` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `preferredBranchId` VARCHAR(191) NULL,
    `convertedLearnerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lesson` (
    `id` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `learnerId` VARCHAR(191) NOT NULL,
    `instructorId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'DRAFT',
    `deliveryType` ENUM('MANUAL', 'AUTO_SCHEDULED', 'TEST_PREP') NOT NULL DEFAULT 'MANUAL',
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `pickupLocation` VARCHAR(191) NULL,
    `dropoffLocation` VARCHAR(191) NULL,
    `vehicleRequired` BOOLEAN NOT NULL DEFAULT true,
    `learnerNotes` VARCHAR(191) NULL,
    `internalNotes` VARCHAR(191) NULL,
    `attendanceStatus` ENUM('ATTENDED', 'PARTIAL', 'LEARNER_LATE', 'LEARNER_NO_SHOW', 'CANCELLED_IN_ADVANCE') NULL,
    `taughtMinutes` INTEGER NULL,
    `completedAt` DATETIME(3) NULL,
    `completionSummary` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstructorAvailability` (
    `id` VARCHAR(191) NOT NULL,
    `instructorId` VARCHAR(191) NOT NULL,
    `dayOfWeek` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InstructorAvailability_instructorId_dayOfWeek_idx`(`instructorId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LessonNote` (
    `id` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NOT NULL,
    `strengths` VARCHAR(191) NULL,
    `focusAreas` VARCHAR(191) NULL,
    `shareWithLearner` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SkillProgress` (
    `id` VARCHAR(191) NOT NULL,
    `learnerId` VARCHAR(191) NOT NULL,
    `skillCode` VARCHAR(191) NOT NULL,
    `skillLabel` VARCHAR(191) NOT NULL,
    `level` ENUM('NOT_STARTED', 'INTRODUCED', 'DEVELOPING', 'CONSISTENT', 'TEST_READY') NOT NULL DEFAULT 'NOT_STARTED',
    `note` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SkillProgress_learnerId_skillCode_key`(`learnerId`, `skillCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TheoryTest` (
    `id` VARCHAR(191) NOT NULL,
    `learnerId` VARCHAR(191) NOT NULL,
    `status` ENUM('NOT_BOOKED', 'BOOKED', 'PASSED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'NOT_BOOKED',
    `testDate` DATETIME(3) NULL,
    `testCentre` VARCHAR(191) NULL,
    `bookingReference` VARCHAR(191) NULL,
    `score` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PracticalTest` (
    `id` VARCHAR(191) NOT NULL,
    `learnerId` VARCHAR(191) NOT NULL,
    `status` ENUM('NOT_BOOKED', 'BOOKED', 'PASSED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'NOT_BOOKED',
    `testDate` DATETIME(3) NULL,
    `testCentre` VARCHAR(191) NULL,
    `bookingReference` VARCHAR(191) NULL,
    `resultSummary` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `learnerId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'PART_PAID', 'PAID', 'VOID') NOT NULL DEFAULT 'DRAFT',
    `issuedAt` DATETIME(3) NULL,
    `dueAt` DATETIME(3) NULL,
    `subtotalPence` INTEGER NOT NULL DEFAULT 0,
    `taxPence` INTEGER NOT NULL DEFAULT 0,
    `totalPence` INTEGER NOT NULL DEFAULT 0,
    `balancePence` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceLine` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitAmountPence` INTEGER NOT NULL,
    `lineTotalPence` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `provider` VARCHAR(191) NULL,
    `providerReference` VARCHAR(191) NULL,
    `amountPence` INTEGER NOT NULL,
    `receivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectionsCase` (
    `id` VARCHAR(191) NOT NULL,
    `learnerId` VARCHAR(191) NOT NULL,
    `ownerName` VARCHAR(191) NULL,
    `nextFollowUpAt` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'MONITORED') NOT NULL DEFAULT 'ACTIVE',
    `note` VARCHAR(191) NULL,
    `lastActionType` VARCHAR(191) NULL,
    `lastActionAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CollectionsCase_learnerId_key`(`learnerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `learnerId` VARCHAR(191) NULL,
    `uploadedById` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` ENUM('LICENCE', 'THEORY_CERTIFICATE', 'PRACTICAL_CERTIFICATE', 'IDENTITY', 'CONSENT_FORM', 'INVOICE', 'RECEIPT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `workflowState` ENUM('REQUESTED', 'RECEIVED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'RECEIVED',
    `fileName` VARCHAR(191) NOT NULL,
    `storagePath` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `audience` ENUM('INTERNAL', 'LEARNER', 'SHARED') NOT NULL DEFAULT 'INTERNAL',
    `notes` VARCHAR(191) NULL,
    `requestedAt` DATETIME(3) NULL,
    `dueAt` DATETIME(3) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` ENUM('CREATED', 'UPDATED', 'DELETED', 'VIEWED', 'EXPORTED', 'SIGNED_IN', 'SIGNED_OUT') NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CrmEmailMessage` (
    `id` VARCHAR(191) NOT NULL,
    `direction` ENUM('INBOUND', 'OUTBOUND') NOT NULL,
    `deliveryStatus` ENUM('PENDING', 'SENT', 'RECEIVED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `mailbox` VARCHAR(191) NOT NULL,
    `threadKey` VARCHAR(191) NOT NULL DEFAULT 'subject:(no subject)',
    `subject` VARCHAR(191) NOT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `fromAddress` VARCHAR(191) NOT NULL,
    `toAddresses` VARCHAR(191) NOT NULL,
    `ccAddresses` VARCHAR(191) NULL,
    `bccAddresses` VARCHAR(191) NULL,
    `replyToAddress` VARCHAR(191) NULL,
    `textBody` VARCHAR(191) NULL,
    `htmlBody` VARCHAR(191) NULL,
    `snippet` VARCHAR(191) NULL,
    `remoteMessageId` VARCHAR(191) NULL,
    `inReplyTo` VARCHAR(191) NULL,
    `referenceIds` VARCHAR(191) NULL,
    `remoteFolder` VARCHAR(191) NULL,
    `remoteUid` INTEGER NULL,
    `provider` VARCHAR(191) NULL,
    `providerRef` VARCHAR(191) NULL,
    `syncError` VARCHAR(191) NULL,
    `retryCount` INTEGER NOT NULL DEFAULT 0,
    `lastRetryAt` DATETIME(3) NULL,
    `receivedAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `learnerId` VARCHAR(191) NULL,
    `leadId` VARCHAR(191) NULL,
    `sentByUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CrmEmailMessage_remoteMessageId_key`(`remoteMessageId`),
    INDEX `CrmEmailMessage_mailbox_threadKey_createdAt_idx`(`mailbox`, `threadKey`, `createdAt`),
    INDEX `CrmEmailMessage_mailbox_direction_receivedAt_idx`(`mailbox`, `direction`, `receivedAt`),
    INDEX `CrmEmailMessage_mailbox_direction_sentAt_idx`(`mailbox`, `direction`, `sentAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CrmEmailAttachment` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `sizeBytes` INTEGER NOT NULL,
    `contentId` VARCHAR(191) NULL,
    `contentDisposition` VARCHAR(191) NULL,
    `storagePath` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CrmEmailAttachment_messageId_createdAt_idx`(`messageId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `featuredImage` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NULL,
    `authorName` VARCHAR(191) NULL,
    `publishDate` DATETIME(3) NULL,
    `excerpt` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `categories` VARCHAR(191) NOT NULL DEFAULT '[]',
    `tags` VARCHAR(191) NOT NULL DEFAULT '[]',
    `seoMetaTitle` VARCHAR(191) NULL,
    `seoMetaDescription` VARCHAR(191) NULL,
    `seoNoIndex` BOOLEAN NOT NULL DEFAULT false,
    `pin` ENUM('NONE', 'FEATURED') NOT NULL DEFAULT 'NONE',
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    INDEX `BlogPost_status_publishDate_idx`(`status`, `publishDate`),
    INDEX `BlogPost_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GoogleReview` (
    `id` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `text` VARCHAR(191) NOT NULL,
    `reviewedAt` DATETIME(3) NOT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'google',
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GoogleReview_visible_sortOrder_idx`(`visible`, `sortOrder`),
    INDEX `GoogleReview_reviewedAt_idx`(`reviewedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CrmEmailThreadWorkflow` (
    `id` VARCHAR(191) NOT NULL,
    `mailbox` VARCHAR(191) NOT NULL,
    `threadKey` VARCHAR(191) NOT NULL,
    `ownerUserId` VARCHAR(191) NULL,
    `status` ENUM('OPEN', 'WAITING_ON_CUSTOMER', 'WAITING_ON_INTERNAL', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    `priority` ENUM('NORMAL', 'PRIORITY', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `internalNotes` VARCHAR(191) NULL,
    `dueAt` DATETIME(3) NULL,
    `reminderAt` DATETIME(3) NULL,
    `lastActionAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CrmEmailThreadWorkflow_threadKey_key`(`threadKey`),
    INDEX `CrmEmailThreadWorkflow_mailbox_status_priority_idx`(`mailbox`, `status`, `priority`),
    INDEX `CrmEmailThreadWorkflow_ownerUserId_updatedAt_idx`(`ownerUserId`, `updatedAt`),
    INDEX `CrmEmailThreadWorkflow_dueAt_reminderAt_idx`(`dueAt`, `reminderAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuthToken` ADD CONSTRAINT `AuthToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StaffProfile` ADD CONSTRAINT `StaffProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorProfile` ADD CONSTRAINT `InstructorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorProfile` ADD CONSTRAINT `InstructorProfile_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearnerProfile` ADD CONSTRAINT `LearnerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearnerProfile` ADD CONSTRAINT `LearnerProfile_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearnerProfile` ADD CONSTRAINT `LearnerProfile_assignedInstructorId_fkey` FOREIGN KEY (`assignedInstructorId`) REFERENCES `InstructorProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_preferredBranchId_fkey` FOREIGN KEY (`preferredBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_convertedLearnerId_fkey` FOREIGN KEY (`convertedLearnerId`) REFERENCES `LearnerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_learnerId_fkey` FOREIGN KEY (`learnerId`) REFERENCES `LearnerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `InstructorProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorAvailability` ADD CONSTRAINT `InstructorAvailability_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `InstructorProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LessonNote` ADD CONSTRAINT `LessonNote_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SkillProgress` ADD CONSTRAINT `SkillProgress_learnerId_fkey` FOREIGN KEY (`learnerId`) REFERENCES `LearnerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TheoryTest` ADD CONSTRAINT `TheoryTest_learnerId_fkey` FOREIGN KEY (`learnerId`) REFERENCES `LearnerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PracticalTest` ADD CONSTRAINT `PracticalTest_learnerId_fkey` FOREIGN KEY (`learnerId`) REFERENCES `LearnerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_learnerId_fkey` FOREIGN KEY (`learnerId`) REFERENCES `LearnerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceLine` ADD CONSTRAINT `InvoiceLine_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CollectionsCase` ADD CONSTRAINT `CollectionsCase_learnerId_fkey` FOREIGN KEY (`learnerId`) REFERENCES `LearnerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_learnerId_fkey` FOREIGN KEY (`learnerId`) REFERENCES `LearnerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CrmEmailMessage` ADD CONSTRAINT `CrmEmailMessage_learnerId_fkey` FOREIGN KEY (`learnerId`) REFERENCES `LearnerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CrmEmailMessage` ADD CONSTRAINT `CrmEmailMessage_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CrmEmailMessage` ADD CONSTRAINT `CrmEmailMessage_sentByUserId_fkey` FOREIGN KEY (`sentByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CrmEmailAttachment` ADD CONSTRAINT `CrmEmailAttachment_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `CrmEmailMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CrmEmailThreadWorkflow` ADD CONSTRAINT `CrmEmailThreadWorkflow_ownerUserId_fkey` FOREIGN KEY (`ownerUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


-- Seed data
INSERT INTO `Branch` (`id`, `name`, `code`, `status`, `phone`, `email`, `addressLine1`, `city`, `postcode`, `createdAt`, `updatedAt`) VALUES
('clx_branch001', 'The DTC - Main Office', 'DTC-MAIN', 'ACTIVE', '01234 567890', 'office@thedtc.co.uk', '123 High Street', 'London', 'SW1A 1AA', NOW(3), NOW(3));

INSERT INTO `User` (`id`, `email`, `firstName`, `lastName`, `phone`, `userType`, `role`, `status`, `branchId`, `createdAt`, `updatedAt`) VALUES
('clx_admin001', 'admin@thedtc.co.uk', 'Admin', 'User', '07000100001', 'STAFF', 'ADMIN', 'ACTIVE', 'clx_branch001', NOW(3), NOW(3)),
('clx_staff001', 'sarah@thedtc.co.uk', 'Sarah', 'Mitchell', '07000100002', 'STAFF', 'MANAGER', 'ACTIVE', 'clx_branch001', NOW(3), NOW(3)),
('clx_inst001', 'james@thedtc.co.uk', 'James', 'Cooper', '07000100003', 'INSTRUCTOR', 'INSTRUCTOR', 'ACTIVE', 'clx_branch001', NOW(3), NOW(3)),
('clx_learner001', 'emily.watson@email.com', 'Emily', 'Watson', '07111111111', 'LEARNER', 'LEARNER', 'ACTIVE', 'clx_branch001', NOW(3), NOW(3)),
('clx_learner002', 'marcus.chen@email.com', 'Marcus', 'Chen', '07222222222', 'LEARNER', 'LEARNER', 'ACTIVE', 'clx_branch001', NOW(3), NOW(3)),
('clx_learner003', 'sophie.taylor@email.com', 'Sophie', 'Taylor', '07333333333', 'LEARNER', 'LEARNER', 'ACTIVE', 'clx_branch001', NOW(3), NOW(3));

INSERT INTO `StaffProfile` (`id`, `userId`, `title`, `createdAt`, `updatedAt`) VALUES
('clx_sp001', 'clx_admin001', 'Centre Manager', NOW(3), NOW(3)),
('clx_sp002', 'clx_staff001', 'Office Manager', NOW(3), NOW(3));

INSERT INTO `InstructorProfile` (`id`, `userId`, `branchId`, `adiNumber`, `vehicleMake`, `vehicleModel`, `vehicleRegistration`, `createdAt`, `updatedAt`) VALUES
('clx_ip001', 'clx_inst001', 'clx_branch001', 'ADI12345', 'Vauxhall', 'Corsa', 'NK24 DTC', NOW(3), NOW(3));

INSERT INTO `LearnerProfile` (`id`, `userId`, `branchId`, `assignedInstructorId`, `onboardingStatus`, `createdAt`, `updatedAt`) VALUES
('clx_lp001', 'clx_learner001', 'clx_branch001', 'clx_ip001', 'ONBOARDED', NOW(3), NOW(3)),
('clx_lp002', 'clx_learner002', 'clx_branch001', 'clx_ip001', 'ONBOARDED', NOW(3), NOW(3)),
('clx_lp003', 'clx_learner003', 'clx_branch001', NULL, 'INVITED', NOW(3), NOW(3));

INSERT INTO `Lead` (`id`, `firstName`, `lastName`, `email`, `phone`, `status`, `source`, `notes`, `createdAt`, `updatedAt`) VALUES
('clx_lead001', 'David', 'Brown', 'david.brown@email.com', '07444444444', 'NEW', 'WEBSITE', 'Interested in automatic lessons', NOW(3), NOW(3)),
('clx_lead002', 'Rachel', 'Green', 'rachel.green@email.com', '07555555555', 'CONTACTED', 'REFERRAL', 'Referred by Emily Watson', NOW(3), NOW(3));
