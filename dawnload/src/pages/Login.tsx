import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Music, LogIn } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
    if (email && password) {
        await login(email, password);
      navigate('/');
    } else {
      setError('Please enter both email and password');
    }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use real demo credentials
      await login('demo@example.com', 'password123');
    navigate('/');
    } catch (err: any) {
      console.error('Demo login error:', err);
      setError('Demo login failed. Please try again or use your own credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Music className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-neutral-600">
            Sign in to your account
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-50 text-error-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <Link to="#" className="text-xs text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Demo Login Option */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-sm text-neutral-600 mb-4">
            <strong>Quick Access:</strong> Try the app with a demo account
          </p>
            <button 
            onClick={handleDemoLogin} 
            className="btn-secondary w-full"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In with Demo Account'}
            </button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}