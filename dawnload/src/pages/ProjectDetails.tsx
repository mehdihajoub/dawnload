import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, Download, Tag, Music, Info, DollarSign, ShoppingCart,
  ExternalLink, ArrowLeft, Bug
} from 'lucide-react';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { Project, User } from '../types';
import { getProjectById, getProjects } from '../services/projects';
import { 
  createProjectCheckoutSession, 
  checkUserHasPurchased, 
  downloadProject, 
  listProjectFiles,
  listStorageBuckets
} from '../services/purchases';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

// Fallback image if project image is missing
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400?text=No+Image';

// Create a more flexible type for database results
interface ProjectData {
  id: string;
  title: string;
  description?: string | null;
  dawType?: string;
  daw_type?: string;
  genre: string;
  bpm: number;
  key: string;
  price: number;
  previewUrl?: string | null;
  preview_url?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  authorId?: string;
  author_id?: string;
  author?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
    avatar_url?: string | null;
  } | null;
  downloadCount?: number;
  download_count?: number;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [availableBuckets, setAvailableBuckets] = useState<any[]>([]);
  const [testFilePath, setTestFilePath] = useState('');
  const [testFileResult, setTestFileResult] = useState('');
  const { user } = useAuthStore();
  
  useEffect(() => {
    async function loadProject() {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch the project from Supabase
        const projectData = await getProjectById(id);
        
        if (!projectData) {
          setError('Project not found');
          setLoading(false);
          return;
        }
        
        // Cast the result to Project type
        setProject(projectData as unknown as Project);
        
        // Check if user has already purchased this project
        if (projectData.price > 0) {
          const purchased = await checkUserHasPurchased(projectData.id);
          setHasPurchased(purchased);
        }
        
        // Fetch related projects (same genre or DAW type)
        const relatedData = await getProjects({
          genre: [projectData.genre],
        });
        
        // Filter out the current project and limit to 3 related projects
        const filteredRelated = relatedData
          .filter(p => p.id !== id)
          .slice(0, 3);
        
        setRelatedProjects(filteredRelated);
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    }
    
    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mx-auto mb-6"></div>
          <div className="h-10 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <p className="mb-6 text-neutral-600">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/browse" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Browse</span>
        </Link>
      </div>
    );
  }
  
  const handlePurchase = async () => {
    if (!project || !id) return;
    
    try {
      setPurchaseLoading(true);
      
      // Generate success and cancel URLs based on current location
      const successUrl = `${window.location.origin}/purchases?success=true`;
      const cancelUrl = `${window.location.origin}/project/${id}?canceled=true`;
      
      // Call the purchase service to create a checkout session
      await createProjectCheckoutSession(id, successUrl, cancelUrl);
      
      // The createProjectCheckoutSession function handles the redirect to Stripe
    } catch (err) {
      console.error('Error creating checkout session:', err);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };
  
  const handleDownload = async () => {
    if (!project || !id) return;
    
    try {
      setPurchaseLoading(true);
      
      // For free projects or purchased projects, download directly
      if (project.price === 0 || hasPurchased) {
        try {
          const downloadUrl = await downloadProject(id);
          
          // Create a temporary link and click it to start the download
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `${project.title}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (downloadError) {
          console.error('Error downloading project:', downloadError);
          
          // Check for specific error types and provide more helpful messages
          if (downloadError instanceof Error) {
            if (downloadError.message.includes('Object not found')) {
              alert('The project file could not be found. Please contact support.');
            } else if (downloadError.message.includes('storage')) {
              alert('There was an issue accessing the file storage. Please try again later.');
            } else {
              alert(`Download failed: ${downloadError.message}`);
            }
          } else {
            alert('Failed to download project. Please try again.');
          }
        }
      } else {
        // If not purchased and not free, show purchase UI
        handlePurchase();
      }
    } catch (err) {
      console.error('Error in download handler:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };
  
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  // Helper function to get image URL from various properties
  const getImageUrl = (item: ProjectData) => {
    return item.imageUrl || item.image_url || PLACEHOLDER_IMAGE;
  };

  // Helper function to get DAW type
  const getDawType = (item: ProjectData) => {
    return item.dawType || item.daw_type || 'Unknown DAW';
  };
  
  // Function to check if a user is an admin
  const checkIsAdmin = async (userId: string) => {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();
        
      return data?.is_admin === true;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  };
  
  // Toggle debug mode
  const toggleDebugMode = async () => {
    if (!user) return;
    
    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      console.log('Debug mode is only available for admins');
      return;
    }
    
    setDebugMode(!debugMode);
    
    if (!debugMode) {
      // Load project files list when entering debug mode
      const files = await listProjectFiles();
      setProjectFiles(files || []);
      
      // List available buckets
      const buckets = await listStorageBuckets();
      setAvailableBuckets(buckets || []);
    }
  };
  
  return (
    <div className="container py-12">
      {/* Admin debug button - only visible to admins */}
      {user && (
        <button 
          onClick={toggleDebugMode}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
          title="Toggle Debug Mode"
        >
          <Bug size={20} />
        </button>
      )}
      
      {/* Debug information */}
      {debugMode && (
        <div className="mb-8 bg-gray-100 p-4 rounded-lg border border-gray-300">
          <h3 className="font-bold mb-2">Debug Information</h3>
          <p><strong>Project ID:</strong> {id}</p>
          {project && (
            <>
              <p><strong>File Information:</strong></p>
              <p className="pl-4">- URL in DB: {(project as any).project_file_url || 'Not available'}</p>
              <p className="pl-4">- Price: {project.price}</p>
              <p className="pl-4">- Has Purchased: {hasPurchased ? 'Yes' : 'No'}</p>
            </>
          )}
          
          <h4 className="font-bold mt-4 mb-1">Available Storage Buckets:</h4>
          <ul className="bg-white p-2 rounded text-sm mb-2">
            {availableBuckets.length === 0 ? (
              <li>No buckets found or not loaded yet</li>
            ) : (
              availableBuckets.map((bucket, index) => (
                <li key={index} className="mb-1">
                  {bucket.name} (Created: {new Date(bucket.created_at).toLocaleString()})
                </li>
              ))
            )}
          </ul>
          
          <button 
            onClick={async () => {
              const buckets = await listStorageBuckets();
              setAvailableBuckets(buckets || []);
            }}
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2"
          >
            Refresh Buckets
          </button>
          
          <h4 className="font-bold mt-4 mb-1">Available Files in Storage:</h4>
          <ul className="bg-white p-2 rounded text-sm">
            {projectFiles.length === 0 ? (
              <li>No files found in storage bucket</li>
            ) : (
              projectFiles.map((file, index) => (
                <li key={index} className="mb-1">
                  <strong>{file.name}</strong> ({Math.round(file.metadata?.size / 1024 || 0)} KB) - 
                  <span className="text-blue-600">Bucket: {file.bucketName}</span>
                </li>
              ))
            )}
          </ul>
          
          <button 
            onClick={async () => {
              const files = await listProjectFiles();
              setProjectFiles(files || []);
            }}
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm mt-2"
          >
            Refresh Files List
          </button>
          
          <h4 className="font-bold mt-4 mb-1">Test Direct File Access:</h4>
          <div className="bg-white p-3 rounded">
            <div className="flex mb-2">
              <input 
                type="text" 
                value={testFilePath}
                onChange={(e) => setTestFilePath(e.target.value)}
                placeholder="Enter file path to test" 
                className="flex-1 border border-gray-300 rounded-l px-2 py-1 text-sm"
              />
              <button 
                onClick={async () => {
                  try {
                    setTestFileResult('Testing...');
                    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pejsexfngypfhgdmfgeq.supabase.co';
                    
                    // Try direct file access
                    const directUrl = `${supabaseUrl}/storage/v1/object/public/${testFilePath}`;
                    const response = await fetch(directUrl, { method: 'HEAD' });
                    
                    const result = response.ok 
                      ? `✅ SUCCESS: File accessible (Status ${response.status})`
                      : `❌ FAILED: (Status ${response.status}) ${response.statusText}`;
                    
                    setTestFileResult(result);
                    console.log('Test result for path', testFilePath, result, directUrl);
                  } catch (err: any) {
                    setTestFileResult(`❌ ERROR: ${err.message || 'Unknown error'}`);
                    console.error('Test file access error:', err);
                  }
                }}
                className="bg-green-500 text-white px-3 py-1 rounded-r text-sm"
              >
                Test
              </button>
            </div>
            <div className="text-sm mt-1">
              {testFileResult ? (
                <p className={testFileResult.includes('SUCCESS') ? 'text-green-600' : 'text-red-600'}>
                  {testFileResult}
                </p>
              ) : (
                <p className="text-gray-500 italic">Enter a path and click Test to check accessibility</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Project Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="w-full md:w-2/3">
          <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-gray-100">
            <img 
              src={project.imageUrl || PLACEHOLDER_IMAGE} 
              alt={project.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-sm text-neutral-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
              <Music className="h-4 w-4" />
              <span>{project.dawType}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full">
              <Tag className="h-4 w-4" />
              <span>{project.genre}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-neutral-600">
              <Download className="h-4 w-4" />
              <span>{project.downloadCount} downloads</span>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/3 flex flex-col">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                {project.author?.username ? (
                  <Link 
                    to={`/profile/${project.author.username}`} 
                    className="font-medium hover:text-primary-600 transition-colors"
                  >
                    {project.author.username}
                  </Link>
                ) : (
                  <span className="text-neutral-600">Unknown Creator</span>
                )}
              </div>
              
              <div>
                {project.price > 0 ? (
                  <span className="text-2xl font-bold">${project.price.toFixed(2)}</span>
                ) : (
                  <span className="bg-success-100 text-success-800 text-sm font-medium px-3 py-1 rounded-full">
                    Free
                  </span>
                )}
              </div>
            </div>
            
            {project.previewUrl ? (
              <AudioPlayer src={project.previewUrl} className="mb-6" />
            ) : (
              <div className="bg-gray-100 rounded-md p-4 text-center mb-6">
                <p className="text-gray-500 text-sm">No audio preview available</p>
              </div>
            )}
            
            {project.price > 0 && !hasPurchased ? (
              <button 
                onClick={handlePurchase} 
                className="btn-primary w-full mb-3"
                disabled={purchaseLoading}
              >
                {purchaseLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Purchase Now</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handleDownload} 
                className="btn-primary w-full mb-3"
                disabled={purchaseLoading}
              >
                {purchaseLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>{project.price > 0 ? 'Download' : 'Download Now'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Project Description */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-600" />
          <span>Description</span>
        </h2>
        <p className="text-neutral-700 whitespace-pre-line">
          {project.description || 'No description provided.'}
        </p>
      </div>
      
      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Related Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects.map((related) => (
              <Link 
                key={related.id} 
                to={`/project/${related.id}`}
                className="card overflow-hidden group"
              >
                <div className="aspect-video relative">
                  <img 
                    src={getImageUrl(related)} 
                    alt={related.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-primary-600 transition-colors">
                    {related.title}
                  </h3>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-600">{getDawType(related)}</span>
                    {related.price > 0 ? (
                      <span className="font-medium">${related.price.toFixed(2)}</span>
                    ) : (
                      <span className="text-success-600 font-medium">Free</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}