import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, ShoppingBag, Music, Tag, ExternalLink, AlertCircle } from 'lucide-react';
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

export function Purchases() {
  const [searchParams] = useSearchParams();
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Check if user just completed a purchase
  const showSuccess = searchParams.get('success') === 'true';
  
  useEffect(() => {
    async function loadPurchases() {
      try {
        setLoading(true);
        const data = await getUserPurchases();
        setPurchases(data as PurchaseItem[]);
      } catch (err) {
        console.error('Error loading purchases:', err);
        setError('Failed to load your purchases');
      } finally {
        setLoading(false);
      }
    }
    
    loadPurchases();
  }, []);
  
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
  
  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Your Purchases</h1>
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
      <h1 className="text-3xl font-bold mb-8">Your Purchases</h1>
      
      {showSuccess && (
        <div className="bg-success-100 text-success-800 p-4 rounded-xl mb-8 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <span>Thank you for your purchase! Your project is now available for download.</span>
        </div>
      )}
      
      {error && (
        <div className="bg-error-100 text-error-800 p-4 rounded-xl mb-8 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}
      
      {purchases.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
          <h2 className="text-xl font-semibold mb-2">No purchases yet</h2>
          <p className="text-neutral-600 mb-6">You haven't purchased any projects yet.</p>
          <Link to="/browse" className="btn-primary">
            Browse Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col md:flex-row">
              <div className="w-full md:w-32 h-20 mb-4 md:mb-0 md:mr-4">
                <Link to={`/project/${purchase.project_id}`}>
                  <img 
                    src={purchase.project.imageUrl || PLACEHOLDER_IMAGE} 
                    alt={purchase.project.title}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </Link>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                  <Link 
                    to={`/project/${purchase.project_id}`}
                    className="text-lg font-medium hover:text-primary-600 transition-colors"
                  >
                    {purchase.project.title}
                  </Link>
                  
                  <div className="text-sm text-neutral-600 mt-1 md:mt-0">
                    Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                  </div>
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
                
                <div className="flex justify-between items-center">
                  <div>
                    <Link 
                      to={`/profile/${purchase.project.author?.username}`}
                      className="text-sm text-neutral-600 hover:text-primary-600 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>by {purchase.project.author?.username || 'Unknown'}</span>
                    </Link>
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