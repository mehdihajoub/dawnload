import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, initialized, loading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Refresh session when component mounts
    const { refreshSession } = useAuthStore.getState();
    refreshSession().catch(console.error);
  }, []);
  
  // Show loading indicator while authentication is being checked
  if (!initialized || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // For routes that require authentication
  if (requireAuth) {
    // If not authenticated, redirect to login
    if (!user) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    
    // If roles are specified, check if user has required role
    if (allowedRoles.length > 0) {
      // Get user roles from user metadata
      const userRoles = user.app_metadata?.roles || [];
      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        // Redirect to home if the user doesn't have the required role
        return <Navigate to="/" replace />;
      }
    }
    
    // User is authenticated and has required roles
    return <>{children}</>;
  } 
  
  // For routes that require the user to be logged out (like login page)
  else {
    // If already authenticated, redirect to home
    if (user) {
      return <Navigate to="/" replace />;
    }
    
    // User is not authenticated
    return <>{children}</>;
  }
} 