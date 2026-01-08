-- Migration: Remove unique constraints from event_registrations table
-- Purpose: Allow multiple registrations with same CPF/email for the same event
-- Date: 2025-10-02

-- Begin transaction to ensure atomic operation
BEGIN;

-- Remove unique constraint on CPF + event_id
DROP INDEX IF EXISTS idx_event_registrations_unique_cpf_event;

-- Remove unique constraint on email + event_id
DROP INDEX IF EXISTS idx_event_registrations_unique_email_event;

-- Keep the individual indexes for performance (removing uniqueness)
-- These will help with queries but won't enforce uniqueness

-- Create non-unique index for CPF queries (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_event_registrations_cpf_non_unique
ON event_registrations (cpf)
WHERE cpf IS NOT NULL;

-- Create non-unique index for email queries (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_event_registrations_email_non_unique
ON event_registrations (email);

-- Create composite non-unique index for event + CPF queries
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_cpf_non_unique
ON event_registrations (event_id, cpf)
WHERE cpf IS NOT NULL;

-- Create composite non-unique index for event + email queries
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_email_non_unique
ON event_registrations (event_id, email);

-- Commit transaction
COMMIT;

-- Rollback script (for reference - run manually if needed):
-- BEGIN;
-- CREATE UNIQUE INDEX idx_event_registrations_unique_cpf_event
-- ON event_registrations (event_id, cpf)
-- WHERE cpf IS NOT NULL;
-- CREATE UNIQUE INDEX idx_event_registrations_unique_email_event
-- ON event_registrations (event_id, email);
-- DROP INDEX IF EXISTS idx_event_registrations_cpf_non_unique;
-- DROP INDEX IF EXISTS idx_event_registrations_email_non_unique;
-- DROP INDEX IF EXISTS idx_event_registrations_event_cpf_non_unique;
-- DROP INDEX IF EXISTS idx_event_registrations_event_email_non_unique;
-- COMMIT;