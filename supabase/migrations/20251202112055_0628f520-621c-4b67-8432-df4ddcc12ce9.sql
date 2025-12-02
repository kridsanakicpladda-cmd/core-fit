-- Allow public to insert candidates from job application form
CREATE POLICY "Public can insert candidates from job application"
ON public.candidates
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow public to upload resumes
CREATE POLICY "Public can upload resumes"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'resumes');

-- Allow public to upload profile photos
CREATE POLICY "Public can upload profile photos"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'profile-photos');