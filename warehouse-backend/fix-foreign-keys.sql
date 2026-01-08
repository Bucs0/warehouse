-- Fix foreign key constraints to allow user deletion
-- This script changes RESTRICT constraints to SET NULL

USE warehouse_inventory;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- STEP 1: Drop existing foreign key constraints
-- ==========================================

-- Try to drop constraints (use actual constraint names from your database)
ALTER TABLE stock_transactions DROP FOREIGN KEY IF EXISTS stock_transactions_ibfk_2;
ALTER TABLE appointments DROP FOREIGN KEY IF EXISTS appointments_ibfk_2;
ALTER TABLE activity_logs DROP FOREIGN KEY IF EXISTS activity_logs_ibfk_1;

-- ==========================================
-- STEP 2: Make user_id columns nullable
-- ==========================================

ALTER TABLE stock_transactions MODIFY COLUMN user_id INT NULL;
ALTER TABLE appointments MODIFY COLUMN scheduled_by_user_id INT NULL;
ALTER TABLE activity_logs MODIFY COLUMN user_id INT NULL;

-- ==========================================
-- STEP 3: Add new foreign key constraints with SET NULL
-- ==========================================

ALTER TABLE stock_transactions 
ADD CONSTRAINT fk_stock_transactions_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_user 
FOREIGN KEY (scheduled_by_user_id) REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE activity_logs 
ADD CONSTRAINT fk_activity_logs_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- VERIFICATION: Check the constraints
-- ==========================================

SELECT 
  kcu.TABLE_NAME,
  kcu.COLUMN_NAME,
  kcu.CONSTRAINT_NAME,
  rc.DELETE_RULE
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
  ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
WHERE kcu.TABLE_SCHEMA = 'warehouse_inventory'
  AND kcu.REFERENCED_TABLE_NAME = 'users';

SELECT '✅ Migration completed! All DELETE_RULE should be SET NULL' as Status;
