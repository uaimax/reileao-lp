-- Migration: Add payment_status field to event_registrations table
-- This script adds the payment_status field to track payment status

-- Add payment_status column to event_registrations table
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Add updated_at column if it doesn't exist
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have payment_status = 'pending' (for backward compatibility)
UPDATE event_registrations
SET payment_status = 'pending'
WHERE payment_status IS NULL;

-- Add comment to the column
COMMENT ON COLUMN event_registrations.payment_status IS 'Payment status: pending, paid, refunded, cancelled';

-- Verify the migration
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'event_registrations'
AND column_name IN ('payment_status', 'updated_at');
