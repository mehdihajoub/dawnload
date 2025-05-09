import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Validate required environment variables
if (!stripeSecret) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
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

// This function is designed to be run on a schedule by Supabase
Deno.serve(async (req) => {
  // Authentication check - require a secret key to prevent unauthorized access
  const authHeader = req.headers.get('Authorization');
  const expectedAuth = `Bearer ${Deno.env.get('WEBHOOK_RETRY_SECRET')}`;
  
  if (authHeader !== expectedAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Starting webhook retry process');
    
    // Get failed webhooks that are due for retry
    const { data: failedWebhooks, error } = await supabase
      .from('failed_webhooks')
      .select('*')
      .lt('next_retry', new Date().toISOString())
      .lt('retries', 'max_retries')
      .limit(10); // Process a batch at a time
    
    if (error) {
      throw new Error(`Failed to fetch webhooks: ${error.message}`);
    }
    
    if (!failedWebhooks || failedWebhooks.length === 0) {
      console.log('No failed webhooks to retry');
      return new Response(JSON.stringify({ status: 'No webhooks to retry' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Found ${failedWebhooks.length} failed webhooks to retry`);
    
    // Process each failed webhook
    const results = await Promise.allSettled(
      failedWebhooks.map(async (webhook) => {
        try {
          console.log(`Retrying webhook ${webhook.id} (event: ${webhook.event_id}, attempt: ${webhook.retries + 1})`);
          
          // Reconstruct the event
          const event = {
            id: webhook.event_id,
            type: webhook.event_type,
            data: {
              object: webhook.event_data
            }
          };
          
          // Import the webhook handler and reprocess the event
          const { handleWebhookEvent } = await import('../stripe-webhook/index.ts');
          await handleWebhookEvent(event as any);
          
          // Success - remove from failed_webhooks
          const { error: deleteError } = await supabase
            .from('failed_webhooks')
            .delete()
            .eq('id', webhook.id);
            
          if (deleteError) {
            console.error(`Error deleting successful webhook ${webhook.id}:`, deleteError);
          }
          
          return { id: webhook.id, status: 'success' };
        } catch (err) {
          console.error(`Error retrying webhook ${webhook.id}:`, err);
          
          // Increment retry count and schedule next attempt
          const { error: updateError } = await supabase.rpc('save_failed_webhook', {
            p_event_id: webhook.event_id,
            p_event_type: webhook.event_type,
            p_event_data: webhook.event_data,
            p_error_message: err.message || 'Unknown error',
            p_retries: webhook.retries + 1,
            p_max_retries: webhook.max_retries
          });
          
          if (updateError) {
            console.error(`Error updating failed webhook ${webhook.id}:`, updateError);
          }
          
          return { 
            id: webhook.id, 
            status: 'failed', 
            error: err.message,
            retries: webhook.retries + 1 
          };
        }
      })
    );
    
    // Summarize results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length;
    const failed = results.filter(r => r.status === 'rejected' || r.value.status === 'failed').length;
    
    console.log(`Retry process completed. Success: ${successful}, Failed: ${failed}`);
    
    return new Response(JSON.stringify({
      processed: results.length,
      successful,
      failed,
      details: results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error in webhook retry process:', err);
    
    return new Response(JSON.stringify({
      error: 'Failed to process webhook retries',
      details: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 