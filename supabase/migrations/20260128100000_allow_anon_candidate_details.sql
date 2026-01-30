-- =============================================
-- ADD UNIQUE CONSTRAINT ON candidate_id FOR UPSERT
-- =============================================

-- Add unique constraint on candidate_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'candidate_details_candidate_id_key'
  ) THEN
    ALTER TABLE public.candidate_details
    ADD CONSTRAINT candidate_details_candidate_id_key UNIQUE (candidate_id);
  END IF;
END $$;

-- =============================================
-- CANDIDATES TABLE POLICIES FOR ANON
-- =============================================

-- Allow anon to SELECT candidates (needed for checking existing email)
DROP POLICY IF EXISTS "Anon can select candidates by email" ON public.candidates;
CREATE POLICY "Anon can select candidates by email"
ON public.candidates
FOR SELECT
TO anon
USING (true);

-- Allow anon to UPDATE candidates (for updating existing candidate)
DROP POLICY IF EXISTS "Anon can update candidates" ON public.candidates;
CREATE POLICY "Anon can update candidates"
ON public.candidates
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow anon to INSERT candidates (for Quick Apply form)
DROP POLICY IF EXISTS "Anon can insert candidates" ON public.candidates;
CREATE POLICY "Anon can insert candidates"
ON public.candidates
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow only HR staff (admin, hr_manager, manager, recruiter, interviewer) to SELECT candidates
DROP POLICY IF EXISTS "Authenticated can select candidates" ON public.candidates;
DROP POLICY IF EXISTS "HR staff can select candidates" ON public.candidates;
CREATE POLICY "HR staff can select candidates"
ON public.candidates
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'hr_manager'::app_role) OR
  public.has_role(auth.uid(), 'manager'::app_role) OR
  public.has_role(auth.uid(), 'recruiter'::app_role) OR
  public.has_role(auth.uid(), 'interviewer'::app_role)
);

-- =============================================
-- CANDIDATE_DETAILS TABLE POLICIES FOR ANON
-- =============================================

-- Allow anonymous users to SELECT candidate_details (needed for upsert)
DROP POLICY IF EXISTS "Anon can select candidate details" ON public.candidate_details;
CREATE POLICY "Anon can select candidate details"
ON public.candidate_details
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to insert candidate_details from Quick Apply form
DROP POLICY IF EXISTS "Public can insert candidate details" ON public.candidate_details;
DROP POLICY IF EXISTS "Anon can insert candidate details" ON public.candidate_details;

CREATE POLICY "Anon can insert candidate details"
ON public.candidate_details
FOR INSERT
TO anon
WITH CHECK (true);

-- Also allow authenticated users to insert
DROP POLICY IF EXISTS "Authenticated can insert candidate details" ON public.candidate_details;
CREATE POLICY "Authenticated can insert candidate details"
ON public.candidate_details
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow anonymous users to update candidate_details (for upsert)
DROP POLICY IF EXISTS "Public can update candidate details" ON public.candidate_details;
DROP POLICY IF EXISTS "Anon can update candidate details" ON public.candidate_details;

CREATE POLICY "Anon can update candidate details"
ON public.candidate_details
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Also allow authenticated users to update
DROP POLICY IF EXISTS "Authenticated can update candidate details" ON public.candidate_details;
CREATE POLICY "Authenticated can update candidate details"
ON public.candidate_details
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
