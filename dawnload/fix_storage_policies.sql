-- Fix Storage Policies for uploaded files
-- These policies were having circular references that prevented uploads

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload preview images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload preview audio" ON storage.objects;

-- Create simpler policies that allow authenticated users to upload files
CREATE POLICY "Any authenticated user can upload project files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project_files');

CREATE POLICY "Any authenticated user can upload preview images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'preview_images');

CREATE POLICY "Any authenticated user can upload preview audio"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'preview_audio');

-- Add policies for users to update their own uploaded files
CREATE POLICY "Users can update their own project files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project_files' AND (owner = auth.uid() OR owner IS NULL));

CREATE POLICY "Users can update their own preview images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'preview_images' AND (owner = auth.uid() OR owner IS NULL));

CREATE POLICY "Users can update their own preview audio"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'preview_audio' AND (owner = auth.uid() OR owner IS NULL));

-- Add policies for users to delete their own uploaded files
CREATE POLICY "Users can delete their own project files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'project_files' AND (owner = auth.uid() OR owner IS NULL));

CREATE POLICY "Users can delete their own preview images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'preview_images' AND (owner = auth.uid() OR owner IS NULL));

CREATE POLICY "Users can delete their own preview audio"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'preview_audio' AND (owner = auth.uid() OR owner IS NULL)); 