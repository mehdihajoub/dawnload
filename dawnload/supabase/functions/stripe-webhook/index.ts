import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Validate required environment variables
if (!stripeSecret) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

if (!stripeWebhookSecret) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Helper function to create consistent error responses
function createErrorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }

    // Verify Content-Type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return createErrorResponse('Invalid Content-Type. Expected application/json', 415);
    }

    // Get signature and raw body
    const signature = req.headers.get('Stripe-Signature'); // Use correct header casing
    const rawBody = await req.text();
    
    // Get webhook secret from environment variables
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    // --- START DETAILED DEBUG LOGGING ---
    console.log("--- Stripe Webhook Verification Debug --- START ---");
    console.log(`TIME: ${new Date().toISOString()}`);
    console.log(`METHOD: ${req.method}`);
    console.log(`HEADERS: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`); // Log all headers
    console.log(`SIGNATURE_HEADER: ${signature ? 'Present' : 'MISSING!'}`); 
    // Temporarily log the actual secret ONLY for debugging - REMOVE BEFORE PRODUCTION
    console.log(`SECRET_USED: ${endpointSecret ? endpointSecret : 'MISSING_OR_EMPTY!'}`); 
    console.log(`RAW_BODY_START: ${rawBody.slice(0, 500)}...`);
    console.log("--- Stripe Webhook Verification Debug --- END ---");
    // --- END DETAILED DEBUG LOGGING ---

    if (!signature) {
      console.error("FATAL: Missing Stripe-Signature header");
      return createErrorResponse('Missing Stripe-Signature header', 400);
    }
    if (!rawBody) {
      console.error("FATAL: Missing request body");
      return createErrorResponse('Missing request body', 400);
    }
    if (!endpointSecret) {
      console.error("FATAL: Missing STRIPE_WEBHOOK_SECRET environment variable inside function");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    let event: Stripe.Event;

    try {
      console.log("Attempting stripe.webhooks.constructEventAsync...");
      event = await stripe.webhooks.constructEventAsync(
        rawBody, // Use the raw string body
        signature,
        endpointSecret,
        undefined, // Use default tolerance
        Stripe.createSubtleCryptoProvider() // Recommended for non-Node environments
      );
      console.log("Webhook signature verification SUCCESSFUL");
    } catch (err) {    
      console.error('⚠️ Webhook signature verification FAILED:', err);
      // Log details specifically for signature error
      console.error(`Failure Details: Signature Header Received = ${signature}`); 
      console.error(`Failure Details: Endpoint Secret Used = ${endpointSecret}`); // Log secret on failure
      return createErrorResponse(
        `Webhook signature verification failed: ${err.message}`,
        400
      );
    }

    // --- Process Event (Only if verification succeeded) ---
    console.log(`Successfully verified event: ${event.id} (${event.type})`);
    EdgeRuntime.waitUntil(handleWebhookEvent(event)); // Process in background

    // Return success immediately
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
     console.error('💥 Unhandled error in webhook handler:', err);
     return createErrorResponse(
       'Internal server error',
       500
     );
  }
});

async function handleWebhookEvent(event: Stripe.Event) {
  const { type, data, id } = event;

  try {
    console.log(`Processing webhook event: ${type}`);

    switch (type) {
      case 'checkout.session.completed': {
        const session = data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const invoice = data.object as Stripe.Invoice;
        await handleInvoicePayment(invoice, type === 'invoice.payment_succeeded');
        break;
      }

      default:
        console.log(`Unhandled event type: ${type}`);
    }
  } catch (err) {
    console.error(`Error processing webhook event ${type}:`, err);
    
    // Save failed event for retry
    try {
      await supabase.rpc('save_failed_webhook', {
        p_event_id: id,
        p_event_type: type,
        p_event_data: data.object as any,
        p_error_message: err.message || 'Unknown error',
        p_retries: 0,
        p_max_retries: 5
      });
      console.log(`Saved failed webhook event ${id} for retry`);
    } catch (saveErr) {
      console.error('Error saving failed webhook:', saveErr);
    }
    
    throw err; // Re-throw to mark the background task as failed
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { customer: customerId, mode } = session;

  if (!customerId || typeof customerId !== 'string') {
    throw new Error('Missing customer ID in session');
  }

  if (mode === 'subscription') {
    await syncCustomerSubscription(customerId);
  } else if (mode === 'payment') {
    await handleOneTimePayment(session);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { customer: customerId } = subscription;

  if (!customerId || typeof customerId !== 'string') {
    throw new Error('Missing customer ID in subscription');
  }

  await syncCustomerSubscription(customerId);
}

async function handleInvoicePayment(invoice: Stripe.Invoice, succeeded: boolean) {
  const { customer: customerId, subscription } = invoice;

  if (!customerId || typeof customerId !== 'string') {
    throw new Error('Missing customer ID in invoice');
  }

  if (subscription) {
    await syncCustomerSubscription(customerId);
  }

  // Update subscription status in database
  const { error } = await supabase
    .from('stripe_subscriptions')
    .update({
      status: succeeded ? 'active' : 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('customer_id', customerId);

  if (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

async function syncCustomerSubscription(customerId: string) {
  try {
    // Get latest subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    const subscription = subscriptions.data[0];

    // Update subscription in database
    const { error } = await supabase
      .from('stripe_subscriptions')
      .upsert({
        customer_id: customerId,
        subscription_id: subscription?.id ?? null,
        price_id: subscription?.items.data[0]?.price.id ?? null,
        status: subscription?.status ?? 'canceled',
        current_period_start: subscription?.current_period_start ?? null,
        current_period_end: subscription?.current_period_end ?? null,
        cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
        payment_method_brand: subscription?.default_payment_method?.card?.brand ?? null,
        payment_method_last4: subscription?.default_payment_method?.card?.last4 ?? null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'customer_id',
      });

    if (error) {
      console.error('Error syncing subscription:', error);
      throw error;
    }
  } catch (err) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, err);
    throw err;
  }
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  const {
    id: checkoutSessionId,
    payment_intent,
    customer: customerId,
    amount_subtotal,
    amount_total,
    currency,
    payment_status,
    metadata,
  } = session;

  if (!customerId || typeof customerId !== 'string') {
    throw new Error('Missing customer ID in session');
  }

  try {
    // Record the payment in stripe_orders table
    const { error: orderError } = await supabase
      .from('stripe_orders')
      .insert({
        checkout_session_id: checkoutSessionId,
        payment_intent_id: payment_intent as string,
        customer_id: customerId,
        amount_subtotal,
        amount_total,
        currency,
        payment_status,
        status: payment_status === 'paid' ? 'completed' : 'pending',
      });

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // If this is a project purchase (has projectId and userId in metadata)
    if (metadata?.projectId && metadata?.userId && payment_status === 'paid') {
      console.log(`Processing project purchase: ${metadata.projectId} for user ${metadata.userId}`);
      
      // Add entry to downloads table
      const { error: downloadError } = await supabase
        .from('downloads')
        .insert({
          project_id: metadata.projectId,
          user_id: metadata.userId,
          amount_paid: amount_total / 100, // Convert cents to dollars
          stripe_payment_id: payment_intent as string,
        });

      if (downloadError) {
        console.error('Error creating download record:', downloadError);
        throw downloadError;
      }
      
      // Increment project download count
      await supabase.rpc('increment_download_count', { 
        project_id: metadata.projectId 
      });
      
      // If there's an author ID, calculate and distribute revenue share
      if (metadata.authorId) {
        // Implementation for revenue share distribution
        const platformFeePercentage = 20; // 20% platform fee
        const authorSharePercentage = 100 - platformFeePercentage; // 80% to author
        
        const totalAmountInDollars = amount_total / 100; // Convert cents to dollars
        const platformFeeAmount = (totalAmountInDollars * platformFeePercentage) / 100;
        const authorEarnings = (totalAmountInDollars * authorSharePercentage) / 100;
        
        // Record the transaction in earnings table
        const { error: earningsError } = await supabase
          .from('earnings')
          .insert({
            user_id: metadata.authorId,
            project_id: metadata.projectId,
            order_id: checkoutSessionId,
            buyer_id: metadata.userId,
            amount: authorEarnings,
            platform_fee: platformFeeAmount,
            total_amount: totalAmountInDollars,
            payment_intent_id: payment_intent as string,
            status: 'completed',
            currency: currency,
          });
        
        if (earningsError) {
          console.error('Error recording earnings:', earningsError);
          // Don't throw here to ensure the purchase is still recorded
          // We can implement a separate recovery mechanism for failed earnings records
        }
        
        console.log(`Revenue share recorded for author ${metadata.authorId}: $${authorEarnings.toFixed(2)}`);
      }
    }
  } catch (err) {
    console.error('Error handling one-time payment:', err);
    throw err;
  }
}