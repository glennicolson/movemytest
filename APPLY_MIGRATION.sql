-- Apply this to production MMT database via phpMyAdmin or MySQL CLI
-- Database: u385361430_movedata

-- Check if columns already exist (safe to run multiple times)
SET @dbname = 'u385361430_movedata';
SET @tablename = 'Listing';

-- Add source column if not exists
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'source');

SET @add_source = IF(@column_exists = 0, 
  'ALTER TABLE `Listing` ADD COLUMN `source` ENUM(\'MMT\', \'DTC\') NOT NULL DEFAULT \'MMT\'', 
  'SELECT \'source column already exists\' as status');

PREPARE stmt FROM @add_source;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add dtcListingId column if not exists
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'dtcListingId');

SET @add_dtc_id = IF(@column_exists = 0, 
  'ALTER TABLE `Listing` ADD COLUMN `dtcListingId` VARCHAR(191) NULL', 
  'SELECT \'dtcListingId column already exists\' as status');

PREPARE stmt FROM @add_dtc_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add dtcUserEmail column if not exists
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'dtcUserEmail');

SET @add_email = IF(@column_exists = 0, 
  'ALTER TABLE `Listing` ADD COLUMN `dtcUserEmail` VARCHAR(191) NULL', 
  'SELECT \'dtcUserEmail column already exists\' as status');

PREPARE stmt FROM @add_email;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes
CREATE INDEX IF NOT EXISTS `idx_listing_source` ON `Listing`(`source`);
CREATE INDEX IF NOT EXISTS `idx_listing_dtc_id` ON `Listing`(`dtcListingId`);

SELECT 'Migration applied successfully' as status;
