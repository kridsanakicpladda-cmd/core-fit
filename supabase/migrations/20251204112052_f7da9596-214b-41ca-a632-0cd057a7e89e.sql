-- Add job_duties column to job_requisitions table
ALTER TABLE public.job_requisitions 
ADD COLUMN job_duties TEXT;