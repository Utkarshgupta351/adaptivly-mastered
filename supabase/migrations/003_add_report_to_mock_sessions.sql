-- Add a JSONB column to store the final professional interview report
ALTER TABLE public.mock_sessions 
ADD COLUMN IF NOT EXISTS report JSONB DEFAULT NULL;
