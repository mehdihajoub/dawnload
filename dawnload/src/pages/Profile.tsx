import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Edit, ExternalLink, Crown, DollarSign } from 'lucide-react';
import { ProjectCard } from '../components/ui/ProjectCard';
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus';
import { User } from '../types';
import { useAuthStore } from '../store/authStore';
import { getUserByUsername, getUserProjects } from '../services/users';

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuthStore();
  
  const isOwnProfile = currentUser?.user_metadata?.username === username;
  
  useEffect(() => {
    async function fetchUserData() {
      if (!username) return;
      
      setLoading(true);
      try {
        // Fetch user from database
        const userData = await getUserByUsername(username);
        
        if (userData) {
          // Convert to app User type
          const appUser: User = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            avatarUrl: userData.avatar_url || undefined,
            bio: userData.bio || undefined,
            is_premium: userData.is_premium,
            createdAt: userData.created_at
          };
          
          setUser(appUser);
          
          // Fetch user's projects
          const projects = await getUserProjects(userData.id);
          setUserProjects(projects || []);
        } else {
          setUser(null);
          setUserProjects([]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
        setUserProjects([]);
      } finally {
        setLoading(false);
    }
    }
    
    fetchUserData();
  }, [username]);
  
  if (loading) {
    return (
      <div className="container py-12 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <p className="mb-6 text-neutral-600">
          The user you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    );
  }
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };
  
  return (
    <div className="container py-12">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-12">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 bg-neutral-200">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-neutral-500">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="text-sm text-neutral-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
            
            {user.bio && (
              <p className="text-neutral-700 mb-4 max-w-2xl">
                {user.bio}
              </p>
            )}
            
            {isOwnProfile && (
              <div className="flex gap-3">
                <button className="btn-secondary">
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
                {!user.is_premium && (
                  <Link to="/pricing" className="btn-primary">
                    <Crown className="h-4 w-4" />
                    <span>Upgrade to Pro</span>
                  </Link>
                )}
                <Link to="/payouts" className="btn-secondary">
                  <DollarSign className="h-4 w-4" />
                  <span>Manage Payouts</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Status (only shown on own profile) */}
        {isOwnProfile && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4">Subscription</h2>
            <SubscriptionStatus />
          </div>
        )}
      </div>
      
      {/* User Projects */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Projects</h2>
          
          {isOwnProfile && (
            <Link to="/upload" className="btn-primary">
              <ExternalLink className="h-4 w-4" />
              <span>Upload New Project</span>
            </Link>
          )}
        </div>
        
        {userProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-neutral-600 mb-6">
              {isOwnProfile 
                ? "You haven't uploaded any projects yet." 
                : `${user.username} hasn't uploaded any projects yet.`
              }
            </p>
            
            {isOwnProfile && (
              <Link to="/upload" className="btn-primary">
                Upload Your First Project
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}