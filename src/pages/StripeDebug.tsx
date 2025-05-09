import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function StripeDebug() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Auth error: ${sessionError.message}`);
      }
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`User error: ${userError.message}`);
      }
      
      setOutput({
        sessionData,
        userData
      });
      
      setStep(2);
    } catch (err: any) {
      console.error('Auth check error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const checkUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!output?.userData?.user?.id) {
        throw new Error('User ID not found');
      }
      
      // Get user DB record
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', output.userData.user.id)
        .single();
        
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      setOutput((prev: Record<string, any> | null) => ({
        ...(prev || {}),
        userDbData: data
      }));
      
      setStep(3);
    } catch (err: any) {
      console.error('User check error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const testStripeConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!output?.sessionData?.session) {
        throw new Error('No session data available');
      }
      
      const token = output.sessionData.session.access_token;
      
      // Call the stripe-connect-onboarding function directly with debugging info
      console.log('Calling stripe-connect-onboarding function directly...');
      
      // Always use the deployed functions URL
      const projectRef = 'pejsexfngypfhgdmfgeq'; // Your Supabase project reference
      const functionsUrl = `https://${projectRef}.supabase.co/functions/v1`;
      
      // First try with direct fetch to get more error details
      try {
        console.log(`Attempting fetch to: ${functionsUrl}/stripe-connect-onboarding`); // Add log for the target URL
        const response = await fetch(
          `${functionsUrl}/stripe-connect-onboarding`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              returnUrl: window.location.origin + '/stripe-debug?setup=complete',
              debug: true,
              session: {
                access_token: token
              }
            })
          }
        );
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { raw: responseText };
        }
        
        if (!response.ok) {
          setOutput((prev: Record<string, any> | null) => ({
            ...(prev || {}),
            stripeConnectError: {
              status: response.status,
              statusText: response.statusText,
              data: responseData
            }
          }));
          
          throw new Error(`Function error: ${response.status} ${response.statusText}`);
        }
        
        setOutput((prev: Record<string, any> | null) => ({
          ...(prev || {}),
          stripeConnectResponse: responseData
        }));
        
        setStep(4);
        return;
      } catch (directFetchError) {
        console.error('Direct fetch error:', directFetchError);
        // Fallback to supabase.functions.invoke
      }
      
      // Fallback to supabase client
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
        body: { 
          returnUrl: window.location.origin + '/stripe-debug?setup=complete',
          debug: true,
          session: {
            access_token: token
          }
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }
      
      setOutput((prev: Record<string, any> | null) => ({
        ...(prev || {}),
        stripeConnectResponse: data
      }));
      
      setStep(4);
    } catch (err: any) {
      console.error('Stripe Connect test error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const testStripeAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!output?.sessionData?.session) {
        throw new Error('No session data available');
      }
      
      const token = output.sessionData.session.access_token;
      
      console.log('Testing basic Stripe API access...');
      
      // Always use the deployed functions URL
      const projectRef = 'pejsexfngypfhgdmfgeq'; // Your Supabase project reference
      const functionsUrl = `https://${projectRef}.supabase.co/functions/v1`;

      // Add logging here
      console.log(`Generated functions URL: ${functionsUrl}`);
      
      const response = await fetch(
        `${functionsUrl}/stripe-test`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const responseText = await response.text();
      console.log('Stripe test raw response:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText };
      }
      
      setOutput((prev: Record<string, any> | null) => ({
        ...(prev || {}),
        stripeAPITest: {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        }
      }));
      
      if (!response.ok) {
        throw new Error(`Stripe API test failed: ${response.status} ${response.statusText}`);
      }
      
    } catch (err: any) {
      console.error('Stripe API test error:', err);
      setError(`Stripe API test error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const redirectToStripe = () => {
    if (output?.stripeConnectResponse?.url) {
      window.location.href = output.stripeConnectResponse.url;
    } else {
      setError('No Stripe URL available');
    }
  };
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Stripe Connect Debug</h1>
        <p className="mb-6">
          This page helps debug issues with the Stripe Connect integration.
          Follow the steps in order.
        </p>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="space-y-6">
          {/* Step 1: Check Authentication */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Step 1: Check Authentication</h2>
            <p className="mb-4">Verify that you're properly authenticated with Supabase.</p>
            <button
              onClick={checkAuth}
              disabled={loading || step > 1}
              className={`btn-primary w-full ${step > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading && step === 1 ? 'Checking...' : step > 1 ? 'Completed' : 'Check Authentication'}
            </button>
            
            {step > 1 && output?.userData && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p className="font-semibold">✓ Authenticated as:</p>
                <p>User ID: {output.userData.user.id}</p>
                <p>Email: {output.userData.user.email}</p>
              </div>
            )}
          </div>
          
          {/* Step 2: Check User Data */}
          <div className={`border rounded-lg p-4 ${step < 2 ? 'opacity-50' : ''}`}>
            <h2 className="text-lg font-semibold mb-2">Step 2: Check User Database Record</h2>
            <p className="mb-4">Verify that your user record exists in the database.</p>
            <button
              onClick={checkUser}
              disabled={loading || step !== 2}
              className={`btn-primary w-full ${step !== 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading && step === 2 ? 'Checking...' : step > 2 ? 'Completed' : 'Check User Record'}
            </button>
            
            {step > 2 && output?.userDbData && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p className="font-semibold">✓ User record found:</p>
                <p>Username: {output.userDbData.username}</p>
                <p>Stripe Connect ID: {output.userDbData.stripe_connect_id || 'Not set'}</p>
                <p>Payout Enabled: {output.userDbData.payout_enabled ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
          
          {/* Step 3: Test Stripe Connect Function */}
          <div className={`border rounded-lg p-4 ${step < 3 ? 'opacity-50' : ''}`}>
            <h2 className="text-lg font-semibold mb-2">Step 3: Test Stripe Connect Function</h2>
            <p className="mb-4">Test the Edge Function without redirecting.</p>
            <button
              onClick={testStripeConnect}
              disabled={loading || step !== 3}
              className={`btn-primary w-full ${step !== 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading && step === 3 ? 'Testing...' : step > 3 ? 'Completed' : 'Test Function'}
            </button>
            
            {step > 3 && output?.stripeConnectResponse && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p className="font-semibold">✓ Function response:</p>
                <pre className="whitespace-pre-wrap">{JSON.stringify(output.stripeConnectResponse, null, 2)}</pre>
              </div>
            )}

            {output?.stripeConnectError && (
              <div className="mt-4 p-3 bg-red-50 rounded text-sm border border-red-200">
                <p className="font-semibold text-red-700">✗ Function error details:</p>
                <p className="mb-2">Status: {output.stripeConnectError.status} {output.stripeConnectError.statusText}</p>
                {output.stripeConnectError.data && (
                  <pre className="whitespace-pre-wrap bg-white p-2 rounded border border-red-100">{JSON.stringify(output.stripeConnectError.data, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
          
          {/* Add this new button after step 3 but before step 4: */}
          <div className={`border rounded-lg p-4 ${step < 3 ? 'opacity-50' : ''}`}>
            <h2 className="text-lg font-semibold mb-2">Stripe API Connection Test</h2>
            <p className="mb-4">Test basic Stripe API connectivity (independent of Connect setup).</p>
            <button
              onClick={testStripeAPI}
              disabled={loading || !output?.sessionData}
              className="btn-secondary w-full"
            >
              {loading ? 'Testing...' : 'Test Stripe API Connection'}
            </button>
            
            {output?.stripeAPITest && (
              <div className={`mt-4 p-3 rounded text-sm border ${output.stripeAPITest.status === 200 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`font-semibold ${output.stripeAPITest.status === 200 ? 'text-green-700' : 'text-red-700'}`}>
                  {output.stripeAPITest.status === 200 ? '✓ Stripe API test passed' : '✗ Stripe API test failed'}:
                </p>
                <p className="mb-2">Status: {output.stripeAPITest.status} {output.stripeAPITest.statusText}</p>
                {output.stripeAPITest.data && (
                  <pre className="whitespace-pre-wrap bg-white p-2 rounded border">{JSON.stringify(output.stripeAPITest.data, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
          
          {/* Step 4: Redirect to Stripe */}
          <div className={`border rounded-lg p-4 ${step < 4 ? 'opacity-50' : ''}`}>
            <h2 className="text-lg font-semibold mb-2">Step 4: Redirect to Stripe</h2>
            <p className="mb-4">Redirect to the Stripe Connect onboarding URL.</p>
            <button
              onClick={redirectToStripe}
              disabled={step !== 4 || !output?.stripeConnectResponse?.url}
              className={`btn-primary w-full ${step !== 4 || !output?.stripeConnectResponse?.url ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Redirect to Stripe
            </button>
          </div>
        </div>
      </div>
      
      {/* Raw Data Display */}
      {output && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Debug Data</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-xs">
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 