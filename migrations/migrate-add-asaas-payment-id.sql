-- Migration: Add asaas_payment_id field to event_registrations table
-- This script adds the asaas_payment_id field to track ASAAS payment IDs

-- Add asaas_payment_id column to event_registrations table
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS asaas_payment_id VARCHAR(100);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_registrations_asaas_payment_id
ON event_registrations (asaas_payment_id);

-- Add comment to the column
COMMENT ON COLUMN event_registrations.asaas_payment_id IS 'ASAAS payment ID for webhook tracking';

-- Verify the migration
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'event_registrations'
AND column_name = 'asaas_payment_id';
