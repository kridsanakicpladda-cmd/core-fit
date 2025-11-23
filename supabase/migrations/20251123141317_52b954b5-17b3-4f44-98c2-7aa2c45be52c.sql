-- Create storage bucket for job descriptions
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-descriptions', 'job-descriptions', false);

-- Add jd_file_url column to job_requisitions
ALTER TABLE public.job_requisitions
ADD COLUMN jd_file_url text;

-- RLS policies for job_descriptions bucket
CREATE POLICY "Authenticated users can view JD files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'job-descriptions' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can upload their own JD files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job-descriptions'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own JD files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'job-descriptions'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins and HR can delete JD files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'job-descriptions'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
);