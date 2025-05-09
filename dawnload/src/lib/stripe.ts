import { loadStripe } from '@stripe/stripe-js';
import { getEnv } from './env';
import { api } from './api';
import { AppError, ErrorType, withErrorHandling } from './error';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { StripePriceWithProduct, StripePortalSession } from '../types';

// Load Stripe singleton
let stripePromise: ReturnType<typeof loadStripe> | null = null;

/**
 * Get the Stripe instance
 */
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(getEnv('VITE_STRIPE_PUBLISHABLE_KEY'));
  }
  return stripePromise;
}

/**
 * Securely create a Stripe Checkout session
 */
export async function createCheckoutSession(priceId: string): Promise<string> {
  return withErrorHandling(async () => {
    // Get the Stripe Checkout session from the server
    const response = await api.post<{ sessionId: string }>(
      '/api/stripe/create-checkout-session',
      { priceId },
      {},
      { retries: 2 }
    );

    if (!response || !response.sessionId) {
      throw new AppError(
        'Failed to create checkout session',
        ErrorType.PAYMENT,
        { priceId }
      );
    }

    return response.sessionId;
  }, {
    retries: 1,
    errorMessage: 'Failed to create checkout session',
    errorType: ErrorType.PAYMENT
  });
}

/**
 * Securely redirect to Stripe Checkout
 */
export async function redirectToCheckout(priceId: string): Promise<void> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new AppError('Stripe failed to load', ErrorType.PAYMENT);
    }

    const sessionId = await createCheckoutSession(priceId);
    
    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw new AppError(
        error.message || 'Failed to redirect to checkout',
        ErrorType.PAYMENT,
        { sessionId }
      );
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
}

/**
 * Securely create a Stripe Customer Portal session
 */
export async function createPortalSession(): Promise<StripePortalSession> {
  return withErrorHandling(async () => {
    // Get the Stripe Customer Portal URL from the server
    const response = await api.post<StripePortalSession>(
      '/api/stripe/create-portal-session',
      {},
      {},
      { retries: 2 }
    );

    if (!response || !response.url) {
      throw new AppError(
        'Failed to create portal session',
        ErrorType.PAYMENT
      );
    }

    return response;
  }, {
    retries: 1,
    errorMessage: 'Failed to create portal session',
    errorType: ErrorType.PAYMENT
  });
}

/**
 * Securely redirect to Stripe Customer Portal
 */
export async function redirectToCustomerPortal(): Promise<void> {
  try {
    const session = await createPortalSession();
    
    if (session.url) {
      window.location.href = session.url;
    } else {
      throw new AppError('No portal URL provided', ErrorType.PAYMENT);
    }
  } catch (error) {
    console.error('Stripe portal error:', error);
    throw error;
  }
}

/**
 * Update payment method using Stripe Elements
 */
export async function updatePaymentMethod(paymentMethodId: string): Promise<void> {
  return withErrorHandling(async () => {
    // Update the payment method on the server
    await api.post(
      '/api/stripe/update-payment-method',
      { paymentMethodId },
      {},
      { retries: 2 }
    );
    
    // Refresh subscription data
    await useSubscriptionStore.getState().fetchSubscription();
  }, {
    retries: 1,
    errorMessage: 'Failed to update payment method',
    errorType: ErrorType.PAYMENT
  });
}

/**
 * Get available subscription plans
 */
export async function getSubscriptionPlans(): Promise<StripePriceWithProduct[]> {
  return withErrorHandling(async () => {
    // Get subscription plans from the server
    const response = await api.get<{ prices: StripePriceWithProduct[] }>(
      '/api/stripe/subscription-plans',
      {},
      { requireAuth: false, retries: 2 }
    );
    
    if (!response || !response.prices) {
      throw new AppError(
        'Failed to fetch subscription plans',
        ErrorType.API
      );
    }
    
    return response.prices.filter(price => price.active && price.product.active);
  }, {
    retries: 2,
    errorMessage: 'Failed to fetch subscription plans',
    errorType: ErrorType.API
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  return withErrorHandling(async () => {
    // Cancel the subscription on the server
    await api.post(
      '/api/stripe/cancel-subscription',
      { subscriptionId },
      {},
      { retries: 1 }
    );
    
    // Refresh subscription data
    await useSubscriptionStore.getState().fetchSubscription();
  }, {
    retries: 1,
    errorMessage: 'Failed to cancel subscription',
    errorType: ErrorType.PAYMENT
  });
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<void> {
  return withErrorHandling(async () => {
    // Reactivate the subscription on the server
    await api.post(
      '/api/stripe/reactivate-subscription',
      { subscriptionId },
      {},
      { retries: 1 }
    );
    
    // Refresh subscription data
    await useSubscriptionStore.getState().fetchSubscription();
  }, {
    retries: 1,
    errorMessage: 'Failed to reactivate subscription',
    errorType: ErrorType.PAYMENT
  });
}

/**
 * Check if a transaction is secure (for fraud prevention)
 */
export function isTransactionSecure(): boolean {
  // Check if we're on a secure connection
  if (window.location.protocol !== 'https:') {
    console.warn('Payment attempted on non-secure connection');
    return false;
  }
  
  // Check for suspicious browser features that might indicate a bot
  const navigatorCheck = 
    'navigator' in window && 
    'webdriver' in navigator && 
    !(navigator as any).webdriver;
  
  if (!navigatorCheck) {
    console.warn('Payment attempted with suspicious browser configuration');
    return false;
  }
  
  return true;
} 