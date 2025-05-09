import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Music, Upload as UploadIcon, FileAudio, AlertTriangle, ExternalLink, DollarSign } from 'lucide-react';
import { DAWType, Genre, MusicalKey } from '../types';
import { useAuthStore } from '../store/authStore';
import { mockUsers } from '../data/mockProjects';
import { createProject } from '../services/projects';
import { getCurrentUserProfile } from '../services/users';
import type { Database } from '../types/supabase';

// Explicitly define the UserProfile type including Stripe fields
type UserProfile = Database['public']['Tables']['users']['Row'] & {
  stripe_connect_id?: string | null;
  payout_enabled?: boolean | null;
};

export function Upload() {
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const isAuthenticated = !!user;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dawType, setDawType] = useState<DAWType>('Logic Pro');
  const [genre, setGenre] = useState<Genre>('Electronic');
  const [bpm, setBpm] = useState<number>(120);
  const [key, setKey] = useState<MusicalKey>('C');
  const [price, setPrice] = useState<number>(0);
  const [isPaid, setIsPaid] = useState(false);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [stripeError, setStripeError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchProfile() {
      if (!isAuthenticated) {
        setLoadingProfile(false);
        return;
      }
      setLoadingProfile(true);
      try {
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);
        console.log("Fetched profile:", profile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setStripeError('Could not load your profile information.');
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [isAuthenticated]);
  
  const isStripeConnected = !!userProfile?.stripe_connect_id;
  const isPayoutEnabled = !!userProfile?.payout_enabled;
  const requiresStripeSetup = isPaid && (!isStripeConnected || !isPayoutEnabled);

  const dawOptions: DAWType[] = [
    'Logic Pro',
    'FL Studio',
    'Ableton Live',
    'Cubase',
    'Pro Tools',
    'Studio One',
    'Bitwig Studio',
    'Reason',
    'Reaper',
    'GarageBand',
  ];
  
  const genreOptions: Genre[] = [
    'Hip-Hop',
    'Electronic',
    'Pop',
    'Rock',
    'R&B',
    'EDM',
    'Trap',
    'House',
    'Techno',
    'Ambient',
    'Jazz',
    'Classical',
    'Folk',
    'World',
    'Other',
  ];

  const keyOptions: MusicalKey[] = [
    'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B',
    'Am', 'A#m/Bbm', 'Bm', 'Cm', 'C#m/Dbm', 'Dm', 'D#m/Ebm', 'Em', 'Fm', 'F#m/Gbm', 'Gm', 'G#m/Abm'
  ];
  
  const handleDemoLogin = async () => {
    try {
      await login('demo@example.com', 'password123');
      window.location.reload();
    } catch (error) {
      console.error('Demo login failed:', error);
      alert('Demo login failed. Please try again.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requiresStripeSetup) {
      setError('Please connect your Stripe account before uploading a paid project.');
      document.getElementById('stripe-connect-prompt')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    if (!title || !description || !projectFile || !previewFile) {
      setError('Please fill in all required fields and select files.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setStripeError(null);
    
    try {
      await createProject({
        title,
        description,
        daw_type: dawType,
        genre,
        bpm,
        key,
        price: isPaid ? price : 0,
        projectFile: projectFile || undefined,
        previewFile: previewFile || undefined,
        imageFile: imageFile || undefined,
      });
      
      alert(`Project "${title}" uploaded successfully!`);
      navigate('/browse');
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to upload project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to upload your project</h1>
          <p className="text-gray-600 mb-8">
            You need to be signed in to upload and share your DAW projects with the community.
          </p>
          <div className="flex flex-col gap-4">
            <button onClick={handleDemoLogin} className="btn-primary">
              Demo Login (for testing)
            </button>
            <span className="text-sm text-gray-500">or</span>
            <button onClick={() => navigate('/login')} className="btn-secondary">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Your Project</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {stripeError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{stripeError}</span>
          </div>
        )}

        {isPaid && loadingProfile && (
           <div className="card p-6 mb-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
           </div>
        )}
        {requiresStripeSetup && !loadingProfile && (
          <div id="stripe-connect-prompt" className="card p-6 mb-6 bg-primary-50 border border-primary-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold mb-2 text-primary-800">Connect Stripe to Sell</h2>
                <p className="text-primary-700 mb-4">
                  To sell this project for ${price.toFixed(2)}, you need to connect your Stripe account 
                  to receive payouts. Free projects don't require Stripe.
                </p>
                <Link to="/payouts" className="btn-primary inline-flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Connect or Manage Stripe Account
                </Link>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Project Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your project a descriptive title"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project, included instruments, techniques, etc."
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dawType" className="block text-sm font-medium text-gray-700 mb-1">
                    DAW Type *
                  </label>
                  <select
                    id="dawType"
                    value={dawType}
                    onChange={(e) => setDawType(e.target.value as DAWType)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    required
                  >
                    {dawOptions.map((daw) => (
                      <option key={daw} value={daw}>{daw}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                    Genre *
                  </label>
                  <select
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as Genre)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    required
                  >
                    {genreOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bpm" className="block text-sm font-medium text-gray-700 mb-1">
                    BPM *
                  </label>
                  <input
                    id="bpm"
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    min="20"
                    max="999"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
                    Key *
                  </label>
                  <select
                    id="key"
                    value={key}
                    onChange={(e) => setKey(e.target.value as MusicalKey)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    required
                  >
                    {keyOptions.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pricing Section */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Pricing</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="free"
                  name="pricingType"
                  type="radio"
                  checked={!isPaid}
                  onChange={() => { setIsPaid(false); setPrice(0); }}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="free" className="ml-2 block text-sm font-medium text-gray-700">
                  Free
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="pricingType"
                  type="radio"
                  checked={isPaid}
                  onChange={() => setIsPaid(true)}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="paid" className="ml-2 block text-sm font-medium text-gray-700">
                  Paid
                </label>
              </div>
            </div>
            
            {isPaid && (
              <div className="mt-4">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (USD)
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="0.00"
                    aria-describedby="price-currency"
                    step="0.01"
                    min="0.50"
                    required={isPaid}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm" id="price-currency">
                      USD
                    </span>
                  </div>
                </div>
                 {price > 0 && price < 0.50 && (
                   <p className="mt-1 text-xs text-red-600">Price must be at least $0.50.</p>
                 )}
              </div>
            )}
          </div>
          
          {/* Project Files */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Project Files</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="projectFile"
                    className="hidden"
                    onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
                    accept=".zip"
                  />
                  <label htmlFor="projectFile" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-700 mb-1">
                        {projectFile ? projectFile.name : 'Drag and drop or click to upload your project file'}
                      </p>
                      <p className="text-xs text-gray-500">
                        ZIP files only (max. 500MB)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio Preview *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="previewFile"
                    className="hidden"
                    onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                    accept="audio/*"
                  />
                  <label htmlFor="previewFile" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <FileAudio className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-700 mb-1">
                        {previewFile ? previewFile.name : 'Drag and drop or click to upload an audio preview'}
                      </p>
                      <p className="text-xs text-gray-500">
                        MP3, WAV or OGG (max. 20MB)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="imageFile"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <label htmlFor="imageFile" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-48 mx-auto rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-700 mb-1">
                          Upload a cover image (optional)
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG or GIF (recommended: 1280x720)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (requiresStripeSetup && !loadingProfile)}
                className={`ml-3 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${requiresStripeSetup && !loadingProfile ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'}`}
              >
                {isSubmitting ? 'Uploading...' : 'Upload Project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}