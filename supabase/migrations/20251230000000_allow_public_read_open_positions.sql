-- Allow public (anonymous) users to view open job positions
-- This is needed for the QuickApply page to show available positions

DROP POLICY IF EXISTS "Public can view open job positions" ON public.job_positions;

CREATE POLICY "Public can view open job positions"
  ON public.job_positions
  FOR SELECT
  TO anon
  USING (status = 'open');

-- Also allow authenticated users to view open positions
DROP POLICY IF EXISTS "Authenticated can view open job positions" ON public.job_positions;

CREATE POLICY "Authenticated can view open job positions"
  ON public.job_positions
  FOR SELECT
  TO authenticated
  USING (status = 'open');
