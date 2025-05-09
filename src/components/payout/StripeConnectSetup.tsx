import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function StripeConnectSetup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      console.error('Error setting up Stripe Connect:', err);
      setError(err.message || 'Failed to set up payment information');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h2 className="text-xl font-bold mb-4">Sell Your Projects</h2>
      
      <p className="mb-4">
        To sell projects and receive payments, you need to connect your Stripe account.
        This allows us to send your earnings directly to your bank account.
      </p>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <button
        onClick={setupStripeConnect}
        disabled={loading}
        className="w-full btn-primary"
      >
        {loading ? 'Setting up...' : 'Connect Stripe Account'}
      </button>
      
      <p className="text-sm text-gray-500 mt-3">
        We use Stripe to handle payments securely. You'll need to provide banking information
        to receive your earnings. We never store your banking details on our servers.
      </p>
    </div>
  );
} 