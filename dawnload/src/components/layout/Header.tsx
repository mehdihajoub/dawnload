import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Library, Home, Compass, Upload as UploadIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isAuthenticated = !!user; // Properly derive authentication state

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { to: '/browse', label: 'Browse', icon: <Compass className="h-4 w-4" /> },
    { to: '/library', label: 'Library', protected: true, icon: <Library className="h-4 w-4" /> },
    { to: '/upload', label: 'Upload', protected: true, icon: <UploadIcon className="h-4 w-4" /> }
  ];

  // Get username from user metadata if available
  const username = user?.user_metadata?.username || 'profile';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-black">.dawnload</Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            (!link.protected || isAuthenticated) && (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => 
                  `text-base font-medium transition-colors flex items-center gap-1 ${
                    isActive 
                      ? 'text-black' 
                      : 'text-gray-600 hover:text-black'
                  }`
                }
              >
                {link.icon && <span className="mr-1">{link.icon}</span>}
                {link.label}
              </NavLink>
            )
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={`/profile/${username}`} className="btn-primary">
                Profile
              </Link>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2" 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              (!link.protected || isAuthenticated) && (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className={({ isActive }) => 
                    `text-lg font-medium py-2 transition-colors flex items-center gap-2 ${
                      isActive 
                        ? 'text-black' 
                        : 'text-gray-600 hover:text-black'
                    }`
                  }
                >
                  {link.icon && <span>{link.icon}</span>}
                  {link.label}
                </NavLink>
              )
            ))}
            
            <div className="border-t border-gray-200 pt-4 mt-2 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to={`/profile/${username}`} onClick={closeMenu} className="btn-primary w-full justify-center">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary w-full justify-center">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu} className="btn-secondary w-full justify-center">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={closeMenu} className="btn-primary w-full justify-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}