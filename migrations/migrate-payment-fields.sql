-- Migration: Add payment fields to event_registrations table
-- This script adds the installments field to support payment configuration

-- Add installments column to event_registrations table
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS installments INTEGER NOT NULL DEFAULT 1;

-- Update existing records to have installments = 1 (for backward compatibility)
UPDATE event_registrations
SET installments = 1
WHERE installments IS NULL;

-- Add comment to the column
COMMENT ON COLUMN event_registrations.installments IS 'Number of installments for credit card payments (default: 1)';

-- Verify the migration
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'event_registrations'
AND column_name = 'installments';

