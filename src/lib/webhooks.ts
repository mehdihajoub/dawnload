import { supabase } from './supabase';
import { api } from './api';
import { AppError, ErrorType, withErrorHandling } from './error';
import { StripeWebhookEvent, UserSubscription, SubscriptionStatus } from '../types';
import { useSubscriptionStore } from '../store/subscriptionStore';

/**
 * Process a Stripe webhook event
 */
export async function processWebhookEvent(event: StripeWebhookEvent): Promise<void> {
  // Log the webhook event for debugging
  console.log(`Processing webhook event: ${event.type}`, { 
    id: event.id,
    type: event.type,
    created: new Date(event.created * 1000).toISOString(),
  });

  try {
    await withErrorHandling(async () => {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionChange(event);
          break;
        
        case 'customer.subscription.deleted':
          await handleSubscriptionDeletion(event);
          break;
        
        case 'invoice.paid':
          await handleInvoicePaid(event);
          break;
        
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event);
          break;
        
        case 'payment_method.attached':
        case 'payment_method.updated':
          await handlePaymentMethodChange(event);
          break;
        
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }
    }, { 
      retries: 3, 
      retryDelay: 2000,
      errorMessage: `Failed to process webhook event: ${event.type}`,
      errorType: ErrorType.API
    });
  } catch (error) {
    // Log the error and rethrow
    console.error(`Webhook processing error: ${event.type}`, error);
    
    // Store the failed event in the database for later retry
    await storeFailedWebhook(event, error);
    
    throw error;
  }
}

/**
 * Handle subscription creation or update events
 */
async function handleSubscriptionChange(event: StripeWebhookEvent): Promise<void> {
  const subscription = event.data.object;
  const customerId = subscription.customer as string;
  
  // Get user ID from customer ID
  const { data: userData, error: userError } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();
  
  if (userError) {
    throw new AppError(
      `Failed to find user for customer: ${customerId}`,
      ErrorType.API,
      { customerId },
      userError
    );
  }
  
  const userId = userData.user_id;
  
  // Get payment method details if available
  const paymentMethodId = subscription.default_payment_method;
  let paymentMethodBrand = null;
  let paymentMethodLast4 = null;
  
  if (paymentMethodId) {
    try {
      const paymentMethodResponse = await api.get(
        `/api/stripe/payment-methods/${paymentMethodId}`,
        {},
        { requireAuth: false }
      );
      
      if (paymentMethodResponse.card) {
        paymentMethodBrand = paymentMethodResponse.card.brand;
        paymentMethodLast4 = paymentMethodResponse.card.last4;
      }
    } catch (error) {
      console.error('Failed to fetch payment method details:', error);
      // Continue without payment method details
    }
  }
  
  // Prepare subscription data
  const subscriptionData = {
    user_id: userId,
    customer_id: customerId,
    subscription_id: subscription.id,
    subscription_status: subscription.status,
    price_id: subscription.items.data[0]?.price.id || null,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    cancel_at_period_end: subscription.cancel_at_period_end,
    payment_method_brand: paymentMethodBrand,
    payment_method_last4: paymentMethodLast4,
    trial_end: subscription.trial_end || null,
    updated_at: new Date().toISOString(),
  };
  
  // Update subscription in database using upsert
  const { error: upsertError } = await supabase
    .from('stripe_user_subscriptions')
    .upsert(subscriptionData);
  
  if (upsertError) {
    throw new AppError(
      'Failed to update subscription in database',
      ErrorType.API,
      { 
        userId,
        subscriptionId: subscription.id 
      },
      upsertError
    );
  }
  
  // Update subscription in global state if needed
  if (useSubscriptionStore.getState().subscription?.user_id === userId) {
    useSubscriptionStore.getState().setSubscription(subscriptionData as UserSubscription);
  }
}

/**
 * Handle subscription deletion events
 */
async function handleSubscriptionDeletion(event: StripeWebhookEvent): Promise<void> {
  const subscription = event.data.object;
  const customerId = subscription.customer as string;
  
  // Get user ID from customer ID
  const { data: userData, error: userError } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();
  
  if (userError) {
    throw new AppError(
      `Failed to find user for customer: ${customerId}`,
      ErrorType.API,
      { customerId },
      userError
    );
  }
  
  const userId = userData.user_id;
  
  // Update subscription status to 'canceled'
  const { error: updateError } = await supabase
    .from('stripe_user_subscriptions')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  
  if (updateError) {
    throw new AppError(
      'Failed to mark subscription as canceled',
      ErrorType.API,
      { 
        userId,
        subscriptionId: subscription.id 
      },
      updateError
    );
  }
  
  // Update subscription in global state if needed
  if (useSubscriptionStore.getState().subscription?.user_id === userId) {
    const currentSubscription = useSubscriptionStore.getState().subscription;
    if (currentSubscription) {
      useSubscriptionStore.getState().setSubscription({
        ...currentSubscription,
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      });
    }
  }
}

/**
 * Handle invoice payment success events
 */
async function handleInvoicePaid(event: StripeWebhookEvent): Promise<void> {
  const invoice = event.data.object;
  const customerId = invoice.customer as string;
  
  // Only process subscription invoices
  if (!invoice.subscription) {
    return;
  }
  
  // Get user ID from customer ID
  const { data: userData, error: userError } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();
  
  if (userError) {
    throw new AppError(
      `Failed to find user for customer: ${customerId}`,
      ErrorType.API,
      { customerId },
      userError
    );
  }
  
  const userId = userData.user_id;
  
  // Update subscription status to 'active' if it was 'past_due' or 'unpaid'
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('stripe_user_subscriptions')
    .select('subscription_status')
    .eq('user_id', userId)
    .single();
  
  if (subscriptionError) {
    throw new AppError(
      'Failed to fetch subscription data',
      ErrorType.API,
      { userId },
      subscriptionError
    );
  }
  
  if (subscriptionData.subscription_status === 'past_due' || subscriptionData.subscription_status === 'unpaid') {
    const { error: updateError } = await supabase
      .from('stripe_user_subscriptions')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    
    if (updateError) {
      throw new AppError(
        'Failed to update subscription status',
        ErrorType.API,
        { userId },
        updateError
      );
    }
    
    // Update subscription in global state if needed
    if (useSubscriptionStore.getState().subscription?.user_id === userId) {
      const currentSubscription = useSubscriptionStore.getState().subscription;
      if (currentSubscription) {
        useSubscriptionStore.getState().setSubscription({
          ...currentSubscription,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        });
      }
    }
  }
}

/**
 * Handle invoice payment failure events
 */
async function handleInvoicePaymentFailed(event: StripeWebhookEvent): Promise<void> {
  const invoice = event.data.object;
  const customerId = invoice.customer as string;
  
  // Only process subscription invoices
  if (!invoice.subscription) {
    return;
  }
  
  // Get user ID from customer ID
  const { data: userData, error: userError } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();
  
  if (userError) {
    throw new AppError(
      `Failed to find user for customer: ${customerId}`,
      ErrorType.API,
      { customerId },
      userError
    );
  }
  
  const userId = userData.user_id;
  
  // Update subscription status to 'past_due'
  const { error: updateError } = await supabase
    .from('stripe_user_subscriptions')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  
  if (updateError) {
    throw new AppError(
      'Failed to update subscription status to past_due',
      ErrorType.API,
      { userId },
      updateError
    );
  }
  
  // Update subscription in global state if needed
  if (useSubscriptionStore.getState().subscription?.user_id === userId) {
    const currentSubscription = useSubscriptionStore.getState().subscription;
    if (currentSubscription) {
      useSubscriptionStore.getState().setSubscription({
        ...currentSubscription,
        subscription_status: 'past_due',
        updated_at: new Date().toISOString(),
      });
    }
  }
}

/**
 * Handle payment method change events
 */
async function handlePaymentMethodChange(event: StripeWebhookEvent): Promise<void> {
  const paymentMethod = event.data.object;
  const customerId = paymentMethod.customer as string;
  
  if (!customerId) {
    console.log('Ignoring payment method event without customer ID');
    return;
  }
  
  // Get user ID from customer ID
  const { data: userData, error: userError } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();
  
  if (userError) {
    throw new AppError(
      `Failed to find user for customer: ${customerId}`,
      ErrorType.API,
      { customerId },
      userError
    );
  }
  
  const userId = userData.user_id;
  
  // Get payment method details based on type
  let paymentDetails: {
    payment_method_brand: string | null;
    payment_method_last4: string | null;
    payment_method_type: string;
    subscription_status?: SubscriptionStatus;
  } = {
    payment_method_brand: null,
    payment_method_last4: null,
    payment_method_type: paymentMethod.type,
  };
  
  // Extract details based on payment method type
  if (paymentMethod.type === 'card' && paymentMethod.card) {
    paymentDetails = {
      payment_method_brand: paymentMethod.card.brand,
      payment_method_last4: paymentMethod.card.last4,
      payment_method_type: 'card',
    };
  } else if (paymentMethod.type === 'sepa_debit' && paymentMethod.sepa_debit) {
    paymentDetails = {
      payment_method_brand: 'sepa',
      payment_method_last4: paymentMethod.sepa_debit.last4,
      payment_method_type: 'sepa_debit',
    };
  } else if (paymentMethod.type === 'us_bank_account' && paymentMethod.us_bank_account) {
    paymentDetails = {
      payment_method_brand: paymentMethod.us_bank_account.bank_name || 'bank',
      payment_method_last4: paymentMethod.us_bank_account.last4,
      payment_method_type: 'us_bank_account',
    };
  }
  
  // Only update if we have valid payment details
  if (paymentDetails.payment_method_last4) {
    // Get current subscription to check if we need to update status
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('stripe_user_subscriptions')
      .select('subscription_status')
      .eq('user_id', userId)
      .single();
      
    if (subscriptionError) {
      console.error('Failed to fetch subscription data:', subscriptionError);
      // Continue with payment method update even if we can't get current status
    }
    
    // If the subscription was in past_due status, update it
    const updateData = {
      ...paymentDetails,
      updated_at: new Date().toISOString(),
    };
    
    // If this is a new payment method and subscription was past_due, set it to active
    if (subscriptionData?.subscription_status === 'past_due') {
      updateData.subscription_status = 'active';
    }
    
    const { error: updateError } = await supabase
      .from('stripe_user_subscriptions')
      .update(updateData)
      .eq('user_id', userId);
    
    if (updateError) {
      throw new AppError(
        'Failed to update payment method information',
        ErrorType.API,
        { userId },
        updateError
      );
    }
    
    // Update subscription in global state if needed
    if (useSubscriptionStore.getState().subscription?.user_id === userId) {
      const currentSubscription = useSubscriptionStore.getState().subscription;
      if (currentSubscription) {
        useSubscriptionStore.getState().setSubscription({
          ...currentSubscription,
          ...updateData,
        });
      }
    }
    
    console.log(`Successfully updated payment method for user ${userId}`);
  }
}

/**
 * Store failed webhook event for later retry
 */
async function storeFailedWebhook(event: StripeWebhookEvent, error: unknown): Promise<void> {
  try {
    const { error: insertError } = await supabase
      .from('failed_webhooks')
      .insert({
        event_id: event.id,
        event_type: event.type,
        event_data: event.data,
        error_message: error instanceof Error ? error.message : String(error),
        created_at: new Date().toISOString(),
        retries: 0,
        max_retries: 5,
        next_retry: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Retry in 5 minutes
      });
    
    if (insertError) {
      console.error('Failed to store failed webhook:', insertError);
    }
  } catch (storeError) {
    console.error('Error storing failed webhook:', storeError);
  }
}

/**
 * Retry processing failed webhooks
 */
export async function retryFailedWebhooks(): Promise<void> {
  const now = new Date().toISOString();
  
  // Get failed webhooks that are ready for retry
  const { data: failedWebhooks, error: fetchError } = await supabase
    .from('failed_webhooks')
    .select('*')
    .lt('next_retry', now)
    .lt('retries', 'max_retries')
    .order('created_at', { ascending: true })
    .limit(10);
  
  if (fetchError) {
    console.error('Failed to fetch failed webhooks:', fetchError);
    return;
  }
  
  if (!failedWebhooks || failedWebhooks.length === 0) {
    return;
  }
  
  console.log(`Retrying ${failedWebhooks.length} failed webhooks`);
  
  // Process each failed webhook
  for (const failedWebhook of failedWebhooks) {
    try {
      const event: StripeWebhookEvent = {
        id: failedWebhook.event_id,
        object: 'event',
        type: failedWebhook.event_type as any,
        data: failedWebhook.event_data,
        created: Math.floor(new Date(failedWebhook.created_at).getTime() / 1000),
        livemode: true,
      };
      
      await processWebhookEvent(event);
      
      // Delete the failed webhook on success
      await supabase
        .from('failed_webhooks')
        .delete()
        .eq('id', failedWebhook.id);
      
      console.log(`Successfully reprocessed webhook: ${failedWebhook.event_id}`);
    } catch (error) {
      console.error(`Failed to retry webhook: ${failedWebhook.event_id}`, error);
      
      // Update retry count and next retry time
      const retries = failedWebhook.retries + 1;
      const backoffMinutes = Math.pow(2, retries) * 5; // Exponential backoff
      const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
      
      await supabase
        .from('failed_webhooks')
        .update({
          retries,
          next_retry: nextRetry,
          last_error: error instanceof Error ? error.message : String(error),
        })
        .eq('id', failedWebhook.id);
    }
  }
} 