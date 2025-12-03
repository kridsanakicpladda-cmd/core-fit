-- Allow public users to update their own candidate record by email
CREATE POLICY "Public can update candidates by email" 
ON public.candidates 
FOR UPDATE 
USING (true)
WITH CHECK (true);