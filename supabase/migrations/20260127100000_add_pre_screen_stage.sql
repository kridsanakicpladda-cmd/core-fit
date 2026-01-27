-- Add "Pre Screen" to allowed stages in candidates table
-- First drop the existing constraint, then add a new one with "Pre Screen" included

ALTER TABLE public.candidates
DROP CONSTRAINT IF EXISTS candidates_stage_check;

ALTER TABLE public.candidates
ADD CONSTRAINT candidates_stage_check
CHECK (stage IN ('Pending', 'Interested', 'Shortlist', 'Pre Screen', 'Interview', 'Offer', 'Hired', 'Rejected'));
