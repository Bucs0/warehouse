-- Migration: Allow user deletion by updating foreign key constraints
-- This script updates the foreign key constraints to allow user deletion
-- while preserving historical records

USE warehouse_inventory;

-- ==========================================
-- STEP 1: Drop existing foreign key constraints
-- ==========================================

-- Drop FK from stock_transactions
ALTER TABLE stock_transactions 
DROP FOREIGN KEY stock_transactions_ibfk_2;

-- Drop FK from appointments
ALTER TABLE appointments 
DROP FOREIGN KEY appointments_ibfk_2;

-- Drop FK from activity_logs
ALTER TABLE activity_logs 
DROP FOREIGN KEY activity_logs_ibfk_1;

-- ==========================================
-- STEP 2: Add new foreign key constraints with SET NULL
-- ==========================================

-- Add FK to stock_transactions with SET NULL
ALTER TABLE stock_transactions 
ADD CONSTRAINT fk_stock_transactions_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE SET NULL;

-- Add FK to appointments with SET NULL
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_user 
FOREIGN KEY (scheduled_by_user_id) REFERENCES users(id) 
ON DELETE SET NULL;

-- Add FK to activity_logs with SET NULL
ALTER TABLE activity_logs 
ADD CONSTRAINT fk_activity_logs_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE SET NULL;

-- ==========================================
-- STEP 3: Update columns to allow NULL
-- ==========================================

-- Make user_id nullable in stock_transactions
ALTER TABLE stock_transactions 
MODIFY COLUMN user_id INT NULL;

-- Make scheduled_by_user_id nullable in appointments
ALTER TABLE appointments 
MODIFY COLUMN scheduled_by_user_id INT NULL;

-- Make user_id nullable in activity_logs
ALTER TABLE activity_logs 
MODIFY COLUMN user_id INT NULL;

-- ==========================================
-- DONE
-- ==========================================
SELECT '✅ Migration completed successfully!' as status;
