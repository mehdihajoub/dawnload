import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');

// Validate required environment variables
if (!stripeSecret) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

// This function is designed to be run on a schedule by Supabase
Deno.serve(async (req) => {
  // Only allow authenticated scheduler requests
  const authHeader = req.headers.get('Authorization');
  const expectedAuth = `Bearer ${Deno.env.get('PAYOUT_PROCESSING_SECRET')}`;
  
  if (authHeader !== expectedAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Starting monthly payout process');
    
    // Calculate date range for the previous month
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Format dates for SQL query
    const startDate = firstDayLastMonth.toISOString();
    const endDate = lastDayLastMonth.toISOString();
    
    console.log(`Processing payouts for period: ${startDate} to ${endDate}`);
    
    // Get users with connected Stripe accounts
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, stripe_connect_id, username, email')
      .not('stripe_connect_id', 'is', null);
      
    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }
    
    console.log(`Found ${users?.length || 0} users with connected Stripe accounts`);
    
    // Process each user
    const results = [];
    
    for (const user of users || []) {
      try {
        // Calculate earnings for the period
        const { data: earnings, error: earningsError } = await supabase
          .from('earnings')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', startDate)
          .lte('created_at', endDate);
          
        if (earningsError) {
          throw new Error(`Error calculating earnings for user ${user.id}: ${earningsError.message}`);
        }
        
        // Sum the earnings
        const totalAmount = earnings?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
        
        // Skip if no earnings
        if (totalAmount <= 0) {
          console.log(`User ${user.id} has no earnings for this period, skipping`);
          continue;
        }
        
        // Convert to cents for Stripe (assuming USD)
        const amountInCents = Math.round(totalAmount * 100);
        
        console.log(`Processing payout of $${totalAmount.toFixed(2)} to user ${user.id}`);
        
        // Create a payout using Stripe Connect
        const transfer = await stripe.transfers.create({
          amount: amountInCents,
          currency: 'usd',
          destination: user.stripe_connect_id,
          metadata: {
            supabaseUserId: user.id,
            periodStart: startDate,
            periodEnd: endDate
          },
          description: `Monthly payout for ${firstDayLastMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`
        });
        
        // Record the payout in our database
        const { data: payout, error: payoutError } = await supabase
          .from('payouts')
          .insert({
            user_id: user.id,
            amount: totalAmount,
            currency: 'usd',
            stripe_payout_id: transfer.id,
            status: 'completed',
            period_start: startDate,
            period_end: endDate
          })
          .select()
          .single();
          
        if (payoutError) {
          console.error(`Error recording payout for user ${user.id}:`, payoutError);
        }
        
        // Update earnings records to mark them as paid
        const { error: updateError } = await supabase
          .from('earnings')
          .update({ status: 'paid' })
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', startDate)
          .lte('created_at', endDate);
          
        if (updateError) {
          console.error(`Error updating earnings status for user ${user.id}:`, updateError);
        }
        
        results.push({
          userId: user.id,
          amount: totalAmount,
          payoutId: payout?.id,
          status: 'success'
        });
        
      } catch (err) {
        console.error(`Error processing payout for user ${user.id}:`, err);
        results.push({
          userId: user.id,
          error: err.message,
          status: 'failed'
        });
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Processed payouts for ${results.length} users`,
      period: `${startDate} to ${endDate}`,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error('Error in payout process:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 