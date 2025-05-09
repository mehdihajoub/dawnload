import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

export function PayoutSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectDetails, setConnectDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadPayoutSettings() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Get user's Stripe Connect status
        const { data, error } = await supabase
          .from('users')
          .select('stripe_connect_id, payout_enabled')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setIsConnected(!!data.stripe_connect_id);
        setConnectDetails(data);
        
        if (data.stripe_connect_id) {
          // Get Stripe Connect account details - in a real implementation
          // You would create a function to fetch account details from Stripe
          // For now we'll just use what we have
          if (data.stripe_connect_id) {
            setConnectDetails({
              ...data,
              account_status: data.payout_enabled ? 'active' : 'pending'
            });
          }
        }
        
      } catch (err: any) {
        console.error('Error loading payout settings:', err);
        setError(err.message || 'Failed to load payout information');
      } finally {
        setLoading(false);
      }
    }
    
    loadPayoutSettings();
  }, []);
  
  const setupStripeConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current session
      const { data: session } = await supabase.auth.getSession();
      
      if (!session || !session.session) {
        throw new Error('You must be logged in to set up payments');
      }
      
      console.log('Calling stripe-connect-onboarding function...');
      
      // Call the function to create a Connect account and get onboarding URL
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
        body: { 
          returnUrl: window.location.origin + '/dashboard?setup=complete',
          session: {
            access_token: session.session.access_token
          }
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });
      
      if (error) {
        console.error('Error from stripe-connect-onboarding:', error);
        throw new Error(error.message || 'Failed to set up payment information');
      }
      
      if (!data || !data.url) {
        console.error('Invalid response from stripe-connect-onboarding:', data);
        throw new Error('Invalid response from server');
      }
      
      console.log('Redirecting to Stripe Connect onboarding...');
      
      // Redirect to Stripe Connect onboarding
      window.location.href = data.url;
      
    } catch (err: any) {
      console.error('Error in setupStripeConnect:', err);
      setError(err.message || 'Failed to set up payment information');
    } finally {
      setLoading(false);
    }
  };
  
  const dashboardLink = async () => {
    setError(null); // Clear previous errors
    setLoading(true);
    
    try {
      // Get current session for auth
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData || !sessionData.session) {
        throw new Error('You must be logged in to manage your Stripe account');
      }
      const token = sessionData.session.access_token;
      
      console.log('Calling stripe-express-dashboard function...');
      
      // Call the new function
      const { data, error } = await supabase.functions.invoke('stripe-express-dashboard', {
        // Include headers for authentication
        headers: {
          Authorization: `Bearer ${token}`
        }
        // Body might not be strictly needed if only using headers for auth, 
        // but can include session for consistency or future use
        // body: { session: { access_token: token } } 
      });

      if (error) {
        console.error('Error from stripe-express-dashboard:', error);
        throw new Error(error.message || 'Failed to create dashboard link');
      }

      if (!data || !data.url) {
        console.error('Invalid response from stripe-express-dashboard:', data);
        throw new Error('Invalid response from server when creating dashboard link');
      }

      console.log('Redirecting to Stripe Express dashboard...');
      // Redirect user to the generated Stripe login link
      window.location.href = data.url;

    } catch (err: any) {
      console.error('Error generating dashboard link:', err);
      setError(err.message || 'Failed to open Stripe dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h2 className="text-xl font-bold mb-4">Payout Settings</h2>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      
      {isConnected ? (
        <div>
          <div className="bg-green-50 text-green-800 p-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle size={18} />
            <span>Your Stripe account is connected</span>
          </div>
          
          <p className="mb-4">
            Your earnings will be automatically transferred to your bank account 
            on a monthly basis. We retain 20% of each sale as a platform fee and
            transfer 80% to your account.
          </p>
          
          {connectDetails?.payout_enabled === false && (
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg mb-4">
              Your account is connected but payments are not yet enabled. 
              Please complete your Stripe account setup.
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-3">
            <button 
              onClick={dashboardLink}
              className="btn-secondary flex items-center"
            >
              <span>Manage Stripe Account</span>
              <ExternalLink size={16} className="ml-2" />
            </button>
            
            <button 
              onClick={setupStripeConnect}
              className="btn-outline"
            >
              Update Account Information
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-4">
            To receive payments for your sold projects, you need to connect a Stripe account.
            This allows us to transfer your earnings directly to your bank account.
          </p>
          
          <button
            onClick={setupStripeConnect}
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Setting up...' : 'Connect Stripe Account'}
          </button>
          
          <p className="text-sm text-gray-500 mt-3">
            We use Stripe Connect to securely handle payments. You'll need to provide banking 
            information to receive your earnings. We never store your banking details on our servers.
          </p>
        </div>
      )}
    </div>
  );
} 