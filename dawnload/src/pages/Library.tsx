import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Library as LibraryIcon, Music, Tag, ExternalLink, AlertCircle, Filter, Search } from 'lucide-react';
import { getUserPurchases, downloadProject } from '../services/purchases';
import { Project } from '../types';

// Fallback image if project image is missing
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400?text=No+Image';

interface PurchaseItem {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
  project: Project;
}

export function Library() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Load user's purchases
  useEffect(() => {
    async function loadPurchases() {
      try {
        setLoading(true);
        const data = await getUserPurchases();
        setPurchases(data as PurchaseItem[]);
      } catch (err) {
        console.error('Error loading library:', err);
        setError('Failed to load your library');
      } finally {
        setLoading(false);
      }
    }
    
    loadPurchases();
  }, []);
  
  // Handle project download
  const handleDownload = async (projectId: string) => {
    try {
      setDownloadingId(projectId);
      const downloadUrl = await downloadProject(projectId);
      
      // Create a temporary link and click it to start the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `project-${projectId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading project:', err);
      alert('Failed to download project. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };
  
  // Filter and search purchases
  const filteredPurchases = purchases.filter(purchase => {
    // Apply search query
    const matchesSearch = searchQuery === '' || 
      purchase.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.project.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.project.dawType?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply filter
    const matchesFilter = activeFilter === null || 
      purchase.project.genre === activeFilter || 
      purchase.project.dawType === activeFilter;
      
    return matchesSearch && matchesFilter;
  });
  
  // Get unique genres and DAW types for filters
  const genres = [...new Set(purchases.map(p => p.project.genre))];
  const dawTypes = [...new Set(purchases.map(p => p.project.dawType).filter(Boolean))];
  
  // Loading state
  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Your Library</h1>
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 mb-4 flex">
              <div className="w-32 h-20 bg-gray-200 rounded mr-4"></div>
              <div className="flex-1">
                <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Your Library</h1>
        
        {/* Search and filter bar */}
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              onChange={(e) => setActiveFilter(e.target.value || null)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Projects</option>
              <optgroup label="Genres">
                {genres.map(genre => (
                  <option key={`genre-${genre}`} value={genre}>{genre}</option>
                ))}
              </optgroup>
              <optgroup label="DAW Types">
                {dawTypes.map(dawType => (
                  <option key={`daw-${dawType}`} value={dawType}>{dawType}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-error-100 text-error-800 p-4 rounded-xl mb-8 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}
      
      {purchases.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center">
          <LibraryIcon className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
          <h2 className="text-xl font-semibold mb-2">Your library is empty</h2>
          <p className="text-neutral-600 mb-6">You haven't purchased any projects yet.</p>
          <Link to="/browse" className="btn-primary">
            Browse Projects
          </Link>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
          <h2 className="text-xl font-semibold mb-2">No projects found</h2>
          <p className="text-neutral-600 mb-6">Try adjusting your search or filters.</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setActiveFilter(null);
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPurchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col">
              <Link to={`/project/${purchase.project_id}`} className="block">
                <div className="aspect-video relative">
                  <img 
                    src={purchase.project.imageUrl || PLACEHOLDER_IMAGE} 
                    alt={purchase.project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
              </Link>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Link 
                    to={`/project/${purchase.project_id}`}
                    className="text-lg font-semibold hover:text-primary-600 transition-colors line-clamp-1"
                  >
                    {purchase.project.title}
                  </Link>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-1 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                    <Music className="h-3 w-3" />
                    <span>{purchase.project.dawType}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full">
                    <Tag className="h-3 w-3" />
                    <span>{purchase.project.genre}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Added {new Date(purchase.created_at).toLocaleDateString()}
                  </div>
                  
                  <button 
                    onClick={() => handleDownload(purchase.project_id)}
                    className="btn-sm btn-outline-primary"
                    disabled={downloadingId === purchase.project_id}
                  >
                    {downloadingId === purchase.project_id ? (
                      <span>Downloading...</span>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 