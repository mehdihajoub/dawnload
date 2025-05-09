import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, X-Client-Info',
};

function log(message: string, obj?: any) {
  if (obj) {
    console.log(`[stripe-dashboard] ${message}`, JSON.stringify(obj));
  } else {
    console.log(`[stripe-dashboard] ${message}`);
  }
}

Deno.serve(async (req) => {
  log("Function invoked");

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Get environment variables
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    log("Environment variables check");
    if (!stripeSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize clients
    log("Initializing clients");
    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-08-16' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // --- Authentication ---
    let token;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
       // Fallback: check body if no header (less common for GET/POST link generation)
      try {
        const body = await req.json();
        if (body?.session?.access_token) {
           token = body.session.access_token;
           log("Using token from session body");
        }
      } catch (e) { /* ignore parsing error if header missing */ }
    } else {
       token = authHeader.replace('Bearer ', '');
       log("Using token from Authorization header");
    }


    if (!token) {
      log("No authentication token provided");
      return new Response(
        JSON.stringify({ error: 'No authentication token provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log("Getting user from token");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      log("Authentication error", authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token', details: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    log("User authenticated", { id: user.id });

    // --- Get Stripe Connect ID ---
    log("Getting user database record for Connect ID");
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_connect_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      log("Error fetching user data", userError);
      return new Response(
        JSON.stringify({ error: 'Failed to get user database record', details: userError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripeConnectId = userData?.stripe_connect_id;

    if (!stripeConnectId) {
      log("User does not have a Stripe Connect ID");
      return new Response(
        JSON.stringify({ error: 'Stripe account not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    log("Found Stripe Connect ID", { stripeConnectId });

    // --- Create Login Link ---
    log("Creating Stripe login link");
    try {
      const loginLink = await stripe.accounts.createLoginLink(stripeConnectId);
      log("Login link created successfully");
      return new Response(
        JSON.stringify({ url: loginLink.url }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (stripeError) {
      log("Stripe login link creation error", stripeError);
      return new Response(
        JSON.stringify({ error: 'Failed to create Stripe dashboard link', details: stripeError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (err) {
    log("Unhandled error", err);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: err instanceof Error ? err.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 