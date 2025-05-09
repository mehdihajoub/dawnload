import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@12';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, X-Client-Info',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Get environment variables
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecret) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing STRIPE_SECRET_KEY environment variable'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Stripe client
    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2023-08-16',
    });

    // Simple test - fetch Stripe balance
    const balance = await stripe.balance.retrieve();

    return new Response(
      JSON.stringify({ 
        success: true,
        balance,
        apiKeyInfo: {
          lastFour: stripeSecret.slice(-4),
          type: stripeSecret.startsWith('sk_test') ? 'test' : 'live'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (err) {
    console.error('Stripe test error:', err);
    
    return new Response(
      JSON.stringify({ 
        error: 'Stripe API error',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 