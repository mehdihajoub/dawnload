import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@12';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, X-Client-Info',
};

// Basic logging helper
function log(message: string, obj?: any) {
  if (obj) {
    console.log(`[stripe-connect] ${message}`, JSON.stringify(obj));
  } else {
    console.log(`[stripe-connect] ${message}`);
  }
}

Deno.serve(async (req) => {
  log("Function invoked");
  
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    log("Environment variables check", { 
      hasStripeSecret: !!stripeSecret, 
      hasSupabaseUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseServiceKey 
    });

    // Validate environment variables
    if (!stripeSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          details: {
            stripeSecret: Boolean(stripeSecret),
            supabaseUrl: Boolean(supabaseUrl),
            supabaseServiceKey: Boolean(supabaseServiceKey)
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Stripe client with explicit API version
    try {
      log("Initializing Stripe client");
      const stripe = new Stripe(stripeSecret, {
        apiVersion: '2023-08-16', // Specify an older, stable API version
      });
      
      // Initialize Supabase client
      log("Initializing Supabase client");
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });

      // Parse request body
      let requestBody;
      try {
        requestBody = await req.json();
        log("Request body parsed", { ...requestBody, session: requestBody.session ? "PRESENT" : "MISSING" });
      } catch (e) {
        log("Error parsing request body", e);
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { session, returnUrl } = requestBody;

      // Extract token
      let token;
      if (session && session.access_token) {
        token = session.access_token;
        log("Using token from session object");
      } else {
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
          token = authHeader.replace('Bearer ', '');
          log("Using token from Authorization header");
        }
      }

      if (!token) {
        log("No authentication token provided");
        return new Response(
          JSON.stringify({ error: 'No authentication token provided' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Get user from token
      log("Getting user from token");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError) {
        log("Authentication error", authError);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid authentication token',
            details: authError
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!user) {
        log("No user found for token");
        return new Response(
          JSON.stringify({ error: 'User not found for provided token' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      log("User authenticated", { id: user.id, email: user.email });

      // Get user's database record
      log("Getting user database record");
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('stripe_connect_id, username, email')
        .eq('id', user.id)
        .single();

      if (userError) {
        log("Error fetching user data", userError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to get user database record',
            details: userError
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      log("User data fetched", userData);

      // Use existing Connect account or create new one
      let stripeConnectId = userData.stripe_connect_id;
      if (!stripeConnectId) {
        // Create Connect account
        log("Creating new Stripe Connect account");
        try {
          const account = await stripe.accounts.create({
            type: 'express',
            email: userData.email || user.email,
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true }
            },
            business_profile: {
              name: userData.username || 'Seller'
            },
            metadata: {
              supabaseUserId: user.id
            }
          });

          stripeConnectId = account.id;
          log("Stripe Connect account created", { id: account.id });

          // Store Connect ID in user record
          log("Updating user record with Connect ID");
          const { error: updateError } = await supabase
            .from('users')
            .update({ stripe_connect_id: stripeConnectId })
            .eq('id', user.id);
            
          if (updateError) {
            log("Error updating user with Connect ID", updateError);
            // Continue anyway since we have the Connect ID
          }
        } catch (stripeError) {
          log("Stripe account creation error", stripeError);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to create Stripe account',
              details: stripeError.message
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } else {
        log("Using existing Connect account", { id: stripeConnectId });
      }

      // Create account link for onboarding
      log("Creating account link for onboarding");
      const redirect = returnUrl || (req.headers.get('origin') + '/dashboard');
      try {
        const accountLink = await stripe.accountLinks.create({
          account: stripeConnectId,
          refresh_url: `${redirect}?setup=retry`,
          return_url: `${redirect}?setup=success`,
          type: 'account_onboarding'
        });

        log("Account link created", { url: accountLink.url });

        // Return success response with URL
        return new Response(
          JSON.stringify({ url: accountLink.url }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (linkError) {
        log("Error creating account link", linkError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create account link',
            details: linkError.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } catch (clientError) {
      log("Error initializing clients", clientError);
      return new Response(
        JSON.stringify({ 
          error: 'Error initializing API clients',
          details: clientError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (err) {
    log("Unhandled error", err);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
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