import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Project = Database['public']['Tables']['projects']['Row'];

export async function getProjects(filters: {
  dawType?: string[];
  genre?: string[];
  key?: string;
  bpmMin?: number;
  bpmMax?: number;
  exactBpm?: number;
  price?: 'free' | 'paid';
  search?: string;
}) {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        author:users(
          id,
          username,
          avatar_url
        )
      `)
      .eq('status', 'published');

    // Apply filters
    if (filters.dawType?.length) {
      query = query.in('daw_type', filters.dawType);
    }

    if (filters.genre?.length) {
      query = query.in('genre', filters.genre);
    }

    if (filters.key) {
      query = query.eq('key', filters.key);
    }

    if (filters.exactBpm) {
      query = query.eq('bpm', filters.exactBpm);
    } else if (filters.bpmMin || filters.bpmMax) {
      if (filters.bpmMin) {
        query = query.gte('bpm', filters.bpmMin);
      }
      if (filters.bpmMax) {
        query = query.lte('bpm', filters.bpmMax);
      }
    }

    if (filters.price === 'free') {
      query = query.eq('price', 0);
    } else if (filters.price === 'paid') {
      query = query.gt('price', 0);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Only log in development environment and not in production
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGGING === 'true') {
      console.log('Projects data from Supabase:', data);
    }
    
    // Return an empty array if data is null
    if (!data) return [];
    
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return []; // Return empty array on error to avoid infinite loading
  }
}

export async function createProject(project: {
  title: string;
  description: string;
  daw_type: string;
  genre: string;
  bpm: number;
  key: string;
  price?: number;
  projectFile?: File;
  previewFile?: File;
  imageFile?: File;
}) {
  try {
    // Extract variables
    const { 
      title, description, daw_type, genre, bpm, key, price = 0,
      projectFile, previewFile, imageFile
    } = project;

    // Get the user ID from the current session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create a unique project ID
    const projectId = crypto.randomUUID();

    // Initialize URL variables
    let projectFileUrl = null;
    let previewUrl = null;
    let imageUrl = null;

    // Create the project record first
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        title,
        description,
        daw_type,
        genre,
        bpm,
        key,
        price,
        status: 'published',
        author_id: user.id,
        download_count: 0
      })
      .select()
      .single();

    if (projectError) {
      throw projectError;
    }

    // Upload files after the project is created
    try {
      // Upload project file if provided
      if (projectFile) {
        const fileName = `${projectId}_${Date.now()}_${projectFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const projectFilePath = `${projectId}/${fileName}`;
        
        const { error: projectFileError } = await supabase.storage
          .from('project_files')
          .upload(projectFilePath, projectFile);
        
        if (projectFileError) {
          console.error('Project file upload error:', projectFileError);
        } else {
          projectFileUrl = projectFilePath;
        }
      }

      // Upload preview file if provided
      if (previewFile) {
        const fileName = `${projectId}_${Date.now()}_${previewFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const previewFilePath = `${projectId}/${fileName}`;
        
        const { error: previewFileError } = await supabase.storage
          .from('preview_audio')
          .upload(previewFilePath, previewFile);
        
        if (previewFileError) {
          console.error('Preview file upload error:', previewFileError);
        } else {
          // Get the public URL for the preview audio
          const { data: previewData } = supabase.storage
            .from('preview_audio')
            .getPublicUrl(previewFilePath);
          
          previewUrl = previewData.publicUrl;
        }
      }

      // Upload image file if provided
      if (imageFile) {
        const fileName = `${projectId}_${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const imageFilePath = `${projectId}/${fileName}`;
        
        const { error: imageFileError } = await supabase.storage
          .from('preview_images')
          .upload(imageFilePath, imageFile);
        
        if (imageFileError) {
          console.error('Image file upload error:', imageFileError);
        } else {
          // Get the public URL for the image
          const { data: imageData } = supabase.storage
            .from('preview_images')
            .getPublicUrl(imageFilePath);
          
          imageUrl = imageData.publicUrl;
        }
      }

      // Update the project with file URLs if any uploads were successful
      if (projectFileUrl || previewUrl || imageUrl) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            preview_url: previewUrl || null,
            image_url: imageUrl || null,
            project_file_url: projectFileUrl || null
          })
          .eq('id', projectId);

        if (updateError) {
          console.error('Error updating project with file URLs:', updateError);
        }
      }

      return projectData;
    } catch (fileError) {
      console.error('File upload error:', fileError);
      return projectData; // Return project data even if file uploads fail
    }
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

// Add a testing function for direct queries
let testQueryCache: any = null;

export async function testFetchProjects() {
  // If we already have results, don't query again
  if (testQueryCache) {
    return testQueryCache;
  }
  
  try {
    // Execute a simple query to get all projects
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(10);
    
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGGING === 'true') {
      console.log('Direct query test results:', { data, error });
    }
    
    // Also try with joins to check if that's the issue
    const { data: joinData, error: joinError } = await supabase
      .from('projects')
      .select(`
        *,
        author:users(id, username)
      `)
      .limit(10);
    
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGGING === 'true') {
      console.log('Join query test results:', { joinData, joinError });
    }
    
    testQueryCache = { 
      simpleQuery: { data, error },
      joinQuery: { data: joinData, error: joinError }
    };
    
    return testQueryCache;
  } catch (error) {
    console.error('Test query error:', error);
    
    testQueryCache = { error };
    return testQueryCache;
  }
}

// Add a function to get a single project by ID
export async function getProjectById(id: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        author:users(
          id,
          username,
          avatar_url
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single();
    
    if (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Transform the data to match the expected Project type
    const project = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      dawType: data.daw_type,
      genre: data.genre,
      bpm: data.bpm,
      key: data.key,
      price: data.price,
      previewUrl: data.preview_url || '',
      imageUrl: data.image_url || '',
      authorId: data.author_id,
      author: data.author ? {
        id: data.author.id,
        username: data.author.username,
        avatarUrl: data.author.avatar_url,
      } : null,
      downloadCount: data.download_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    return project;
  } catch (error) {
    console.error('Error in getProjectById:', error);
    return null;
  }
}