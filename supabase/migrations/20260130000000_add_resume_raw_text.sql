-- Add resume_raw_text column to candidate_details table
-- This stores the full text content extracted from the resume file via OCR
-- Used by AI Fit Score to analyze candidate qualifications

ALTER TABLE public.candidate_details
ADD COLUMN IF NOT EXISTS resume_raw_text TEXT;

-- Add comment to explain the column purpose
COMMENT ON COLUMN public.candidate_details.resume_raw_text IS
'Full text content extracted from candidate resume file via OCR. Used by AI for fit score calculation.';
