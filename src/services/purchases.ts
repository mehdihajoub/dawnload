import { supabase } from '../lib/supabase';

/**
 * Create a Stripe checkout session for purchasing a project
 * @param projectId - The ID of the project to purchase
 * @param successUrl - URL to redirect to after successful payment
 * @param cancelUrl - URL to redirect to if payment is cancelled
 */
export async function createProjectCheckoutSession(
  projectId: string,
  successUrl: string = window.location.origin + '/purchases?success=true',
  cancelUrl: string = window.location.origin + '/project/' + projectId
) {
  try {
    console.log(`Creating checkout session for project ${projectId}`);
    
    // Get the authenticated user and session
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Error getting session:', authError);
      throw new Error('Authentication error: ' + authError.message);
    }
    
    if (!authData.session || !authData.session.access_token) {
      console.error('No valid session found');
      throw new Error('You must be logged in to purchase a project');
    }
    
    console.log(`Authenticated session found`);
    
    // Call Supabase Edge Function to create checkout session
    console.log('Calling project-checkout function with:', { projectId, successUrl, cancelUrl });
    const response = await supabase.functions.invoke('project-checkout', {
      body: {
        projectId,
        successUrl,
        cancelUrl
      },
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`
      }
    });
    
    console.log('Function response:', response);

    if (response.error) {
      console.error('Error from project-checkout function:', response.error);
      throw new Error(`Checkout error: ${response.error.message || 'Unknown error'}`);
    }

    if (!response.data || !response.data.url) {
      console.error('Invalid response from project-checkout function:', response.data);
      throw new Error('No checkout URL returned from server');
    }

    console.log('Redirecting to checkout URL:', response.data.url);
    
    // Redirect to Stripe checkout
    window.location.href = response.data.url;
    return response.data;
  } catch (error) {
    console.error('Error in createProjectCheckoutSession:', error);
    throw error;
  }
}

/**
 * Get purchase history for the current user
 * This includes both purchased (paid) and free downloaded projects
 */
export async function getUserPurchases() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('downloads')
      .select(`
        *,
        project:projects(
          id,
          title,
          image_url,
          preview_url,
          daw_type,
          genre,
          price,
          author_id,
          author:users(id, username, avatar_url)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user purchases:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserPurchases:', error);
    throw error;
  }
}

/**
 * Check if the current user has purchased or downloaded a specific project
 * @param projectId - The ID of the project to check
 */
export async function checkUserHasPurchased(projectId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('downloads')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking purchase status:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkUserHasPurchased:', error);
    return false;
  }
}

/**
 * Debug function to list all available storage buckets
 * This helps identify the correct bucket name
 */
export async function listStorageBuckets() {
  try {
    const { data, error } = await supabase.storage
      .listBuckets();
    
    if (error) {
      console.error('Error listing storage buckets:', error);
      return null;
    }
    
    console.log('Available buckets:', data.map(bucket => bucket.name));
    return data;
  } catch (error) {
    console.error('Error in listStorageBuckets:', error);
    return null;
  }
}

/**
 * Debug function to list files in all available storage buckets
 * This can help diagnose file not found errors
 */
export async function listProjectFiles() {
  try {
    // First get all available buckets
    const { data: buckets, error: bucketsError } = await supabase.storage
      .listBuckets();
    
    if (bucketsError || !buckets || buckets.length === 0) {
      console.error('Error listing buckets or no buckets found:', bucketsError);
      return [];
    }
    
    // Try to list files from each bucket
    let allFiles: Array<{ name: string; id: string; bucketName: string; metadata?: any }> = [];
    for (const bucket of buckets) {
      try {
        console.log(`Listing files from bucket: ${bucket.name}`);
        
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list();
        
        if (files && !filesError) {
          // Add bucket name to each file for reference
          const filesWithBucket = files.map(file => ({
            ...file,
            bucketName: bucket.name
          }));
          
          allFiles = [...allFiles, ...filesWithBucket];
        } else {
          console.warn(`Could not list files from bucket ${bucket.name}:`, filesError);
        }
      } catch (err) {
        console.error(`Error listing files from bucket ${bucket.name}:`, err);
      }
    }
    
    return allFiles;
  } catch (error) {
    console.error('Error in listProjectFiles:', error);
    return [];
  }
}

/**
 * Download a purchased project
 * @param projectId - The ID of the project to download
 */
export async function downloadProject(projectId: string) {
  try {
    console.log(`[DEBUG] Starting download process for project ID: ${projectId}`);
    
    // Get project details to check if it's free
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('price, project_file_url, title')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('[DEBUG] Project query error:', projectError);
      throw projectError || new Error('Project not found');
    }

    console.log(`[DEBUG] Project data retrieved:`, project);

    if (!project.project_file_url) {
      console.error('[DEBUG] No project_file_url found in project data');
      throw new Error('Project file not available');
    }

    // Check if project is free or user has purchased it
    const isFree = project.price === 0;
    console.log(`[DEBUG] Project is free: ${isFree}`);
    
    if (!isFree) {
      // If not free, check if user has purchased the project
      const hasPurchased = await checkUserHasPurchased(projectId);
      console.log(`[DEBUG] User has purchased: ${hasPurchased}`);
      
      if (!hasPurchased) {
        throw new Error('You must purchase this project before downloading');
      }
    }

    // Extract just the filename from the file path if it's a full path
    let filePath = project.project_file_url;
    const originalPath = filePath;
    
    console.log(`[DEBUG] Original file path: "${filePath}"`);
    
    // If the file path contains slashes or backslashes, extract just the filename
    if (filePath.includes('/') || filePath.includes('\\')) {
      const pathParts = filePath.split('/');
      filePath = pathParts[pathParts.length - 1];
      if (filePath.includes('\\')) {
        const backslashParts = filePath.split('\\');
        filePath = backslashParts[backslashParts.length - 1];
      }
    }

    console.log(`[DEBUG] Extracted file path for download: "${filePath}"`);

    // Try to get buckets to find the correct one
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('[DEBUG] Available buckets:', buckets?.map(b => b.name));

    // Check if the bucket already exists in the URL
    const urlHasBucket = originalPath.startsWith('public/') || 
                         /^[a-zA-Z0-9_-]+\//.test(originalPath);
    
    console.log(`[DEBUG] URL appears to already include bucket: ${urlHasBucket}`);
    
    if (urlHasBucket) {
      console.log('[DEBUG] Attempting to use the original path with bucket included');
      try {
        // Try to directly use the provided URL if it already contains the bucket
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pejsexfngypfhgdmfgeq.supabase.co';
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${originalPath}`;
        console.log(`[DEBUG] Generated direct public URL: ${publicUrl}`);
        
        // Update download count
        await supabase.rpc('increment_download_count', { project_id: projectId });
        return publicUrl;
      } catch (err) {
        console.error('[DEBUG] Direct URL approach failed:', err);
      }
    }

    let downloadUrl = null;
    let error = null;
    
    // List of potential bucket names to try
    const bucketNames = buckets?.map(b => b.name) || ['projects', 'project_files', 'files', 'uploads'];
    console.log('[DEBUG] Will try these bucket names:', bucketNames);
    
    // Try each bucket name until we find one that works
    for (const bucketName of bucketNames) {
      try {
        console.log(`[DEBUG] Trying signed URL from bucket: ${bucketName}, file: ${filePath}`);
        const { data, error: bucketError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, 60);
          
        if (bucketError) {
          console.error(`[DEBUG] Error with bucket ${bucketName}:`, bucketError);
        }
        
        if (!bucketError && data?.signedUrl) {
          downloadUrl = data.signedUrl;
          console.log(`[DEBUG] Success with bucket: ${bucketName}`);
          console.log(`[DEBUG] Signed URL: ${downloadUrl}`);
          break;
        }
      } catch (err) {
        console.error(`[DEBUG] Failed with bucket ${bucketName}:`, err);
        error = err;
      }
    }
    
    // If no signed URL was created, try public URL of all buckets
    if (!downloadUrl) {
      for (const bucketName of bucketNames) {
        try {
          console.log(`[DEBUG] Trying public URL from bucket: ${bucketName}, file: ${filePath}`);
          const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
            
          if (data?.publicUrl) {
            downloadUrl = data.publicUrl;
            console.log(`[DEBUG] Success with public URL from bucket: ${bucketName}`);
            console.log(`[DEBUG] Public URL: ${downloadUrl}`);
            break;
          }
        } catch (err) {
          console.error(`[DEBUG] Failed with public URL from bucket ${bucketName}:`, err);
        }
      }
    }

    // Another approach: Try direct file access without bucket selection
    if (!downloadUrl) {
      try {
        console.log('[DEBUG] Trying direct file access as last resort');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pejsexfngypfhgdmfgeq.supabase.co';
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${filePath}`;
        console.log(`[DEBUG] Generated fallback public URL: ${publicUrl}`);
        downloadUrl = publicUrl;
      } catch (err) {
        console.error('[DEBUG] Direct file access failed:', err);
      }
    }

    if (!downloadUrl) {
      console.error('[DEBUG] Failed to generate any download URL');
      throw new Error('Could not generate download URL from any storage bucket');
    }

    // Update download count
    await supabase.rpc('increment_download_count', { project_id: projectId });

    return downloadUrl;
  } catch (error) {
    console.error('[DEBUG] Error in downloadProject:', error);
    throw error;
  }
} 