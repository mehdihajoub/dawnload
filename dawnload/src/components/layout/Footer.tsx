import { Link } from 'react-router-dom';
import { Music, Github, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-8 mt-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <Music className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold">BeatShare</span>
            </Link>
            <p className="mt-4 text-sm text-neutral-600">
              Share and discover DAW projects from creators around the world.
            </p>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-base font-bold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/browse" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link to="/browse?dawType=Logic+Pro" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Logic Pro
                </Link>
              </li>
              <li>
                <Link to="/browse?dawType=FL+Studio" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  FL Studio
                </Link>
              </li>
              <li>
                <Link to="/browse?dawType=Ableton+Live" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Ableton Live
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-base font-bold mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Upload Project
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-base font-bold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} BeatShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}