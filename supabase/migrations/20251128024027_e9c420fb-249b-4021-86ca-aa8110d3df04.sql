-- Add photo_url column to candidates table
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create storage bucket for profile photos (resumes bucket already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile photos (public)
CREATE POLICY "Anyone can upload profile photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Anyone can view profile photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-photos');