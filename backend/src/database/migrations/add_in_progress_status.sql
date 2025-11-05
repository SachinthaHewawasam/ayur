-- Migration: Add 'in_progress' to appointment_status enum
-- Date: 2025-11-05
-- Description: Add the missing 'in_progress' status to the appointment_status enum type

-- Add 'in_progress' to the appointment_status enum if it doesn't exist
DO $$ 
BEGIN
    -- Check if 'in_progress' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'in_progress' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'appointment_status'
        )
    ) THEN
        -- Add the new enum value
        ALTER TYPE appointment_status ADD VALUE 'in_progress';
        RAISE NOTICE 'Added in_progress to appointment_status enum';
    ELSE
        RAISE NOTICE 'in_progress already exists in appointment_status enum';
    END IF;
END $$;
