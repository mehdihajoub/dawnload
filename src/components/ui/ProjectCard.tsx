import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { Music, Download, User } from 'lucide-react';

// Add a fallback placeholder image
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400?text=No+Image';

// Create a more lenient type for the project prop
interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    dawType?: string;
    daw_type?: string; // Database naming
    genre?: string;
    bpm: number;
    key: string;
    price: number;
    imageUrl?: string;
    image_url?: string; // Database naming
    author?: any;
    author_id?: string; // Database naming
    downloadCount?: number;
    download_count?: number; // Database naming
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Handle different property naming between frontend types and database
  const {
    id,
    title,
    dawType = project.daw_type, // Use dawType if available, otherwise fall back to daw_type
    genre = project.genre,
    bpm,
    key,
    price,
    imageUrl = project.image_url || PLACEHOLDER_IMAGE, // Fall back to placeholder if no image
    author,
    downloadCount = project.download_count || 0,
  } = project;
  
  return (
    <div className="card overflow-hidden group animate-fade-in">
      <Link to={`/project/${id}`} className="block">
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // If image fails to load, replace with placeholder
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <span className="text-white text-sm font-medium">View Details</span>
          </div>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1">
            <Music className="h-3 w-3" />
            <span>{dawType || 'Unknown DAW'}</span>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link to={`/project/${id}`} className="block">
            <h3 className="text-lg font-bold leading-tight line-clamp-1 hover:text-gray-600 transition-colors">
              {title}
            </h3>
          </Link>
          <div className="flex-shrink-0">
            {price > 0 ? (
              <span className="bg-black text-white text-xs font-medium rounded-full px-2 py-1">
                ${price.toFixed(2)}
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-xs font-medium rounded-full px-2 py-1">
                Free
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          {author && author.username ? (
            <Link to={`/profile/${author.username}`} className="font-medium hover:text-black transition-colors">
              {author.username}
            </Link>
          ) : (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Unknown Creator</span>
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>{bpm} BPM</span>
            <span>•</span>
            <span>Key: {key}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{downloadCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}