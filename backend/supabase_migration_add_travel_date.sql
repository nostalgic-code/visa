-- Migration: Add travel_date column to visa_applications table
-- Run this SQL in your Supabase SQL Editor

-- Add the travel_date column
ALTER TABLE visa_applications 
ADD COLUMN IF NOT EXISTS travel_date DATE;

-- Add a comment to document the column
COMMENT ON COLUMN visa_applications.travel_date IS 'Intended travel date when user plans to depart';

-- Optional: Update existing records to set travel_date to NULL or a default value
-- (Existing records will have NULL for travel_date, which is fine)

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'visa_applications' 
AND column_name = 'travel_date';
