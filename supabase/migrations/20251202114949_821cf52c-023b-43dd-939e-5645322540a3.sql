-- Add additional fields to job_positions table for job posting information
ALTER TABLE public.job_positions
ADD COLUMN IF NOT EXISTS salary_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_max INTEGER,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS job_grade TEXT,
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full-time',
ADD COLUMN IF NOT EXISTS responsibilities TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT;