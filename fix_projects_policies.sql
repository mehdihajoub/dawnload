-- Fix Project RLS Policies
-- Drop the existing policy that's causing issues
DROP POLICY IF EXISTS "Authors can CRUD their own projects" ON projects;

-- Create more granular policies
CREATE POLICY "Anyone can read published projects"
  ON projects
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can read all their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Authors can insert their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create Project Helper Function with safer type handling
CREATE OR REPLACE FUNCTION create_project(
  title text,
  description text,
  daw_type text,
  genre text,
  bpm integer,
  key text,
  price decimal DEFAULT 0,
  preview_url text DEFAULT NULL,
  image_url text DEFAULT NULL,
  project_file_url text DEFAULT NULL,
  status text DEFAULT 'published'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_id uuid := gen_random_uuid();
  project_row projects%ROWTYPE;
  status_value project_status;
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Safely convert status to enum type
  BEGIN
    status_value := status::project_status;
  EXCEPTION WHEN OTHERS THEN
    -- Default to 'published' if conversion fails
    status_value := 'published'::project_status;
  END;

  -- Insert the project
  INSERT INTO projects (
    id,
    title,
    description,
    daw_type,
    genre,
    bpm,
    key,
    price,
    preview_url,
    image_url,
    project_file_url,
    status,
    author_id,
    download_count
  ) VALUES (
    project_id,
    title,
    description,
    daw_type,
    genre,
    bpm,
    key,
    price,
    preview_url,
    image_url,
    project_file_url,
    status_value,
    auth.uid(),
    0
  )
  RETURNING * INTO project_row;

  -- Return the newly created project as JSON
  RETURN row_to_json(project_row);
END;
$$; 