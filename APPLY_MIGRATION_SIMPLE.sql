-- Run this SQL in phpMyAdmin on your MMT database (u385361430_movedata)
-- Or run via MySQL CLI:
-- mysql -u u385361430_moveuser -p u385361430_movedata < APPLY_MIGRATION_SIMPLE.sql

-- Add source column
ALTER TABLE `Listing` ADD COLUMN IF NOT EXISTS `source` ENUM('MMT', 'DTC') NOT NULL DEFAULT 'MMT';

-- Add dtcListingId column
ALTER TABLE `Listing` ADD COLUMN IF NOT EXISTS `dtcListingId` VARCHAR(191) NULL;

-- Add dtcUserEmail column
ALTER TABLE `Listing` ADD COLUMN IF NOT EXISTS `dtcUserEmail` VARCHAR(191) NULL;

-- Add indexes
ALTER TABLE `Listing` ADD INDEX IF NOT EXISTS `idx_listing_source` (`source`);
ALTER TABLE `Listing` ADD INDEX IF NOT EXISTS `idx_listing_dtc_id` (`dtcListingId`);
