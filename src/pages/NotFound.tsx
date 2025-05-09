import { Link } from 'react-router-dom';
import { Music, Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <Music className="h-16 w-16 text-primary-600 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-neutral-800 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-neutral-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}