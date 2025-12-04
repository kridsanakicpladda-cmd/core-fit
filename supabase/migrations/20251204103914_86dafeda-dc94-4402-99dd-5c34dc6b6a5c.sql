-- Add test score fields to candidate_details table
ALTER TABLE public.candidate_details 
ADD COLUMN IF NOT EXISTS hr_test_score integer,
ADD COLUMN IF NOT EXISTS department_test_score integer;