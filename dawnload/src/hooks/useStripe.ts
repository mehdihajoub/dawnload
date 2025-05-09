import { useState } from 'react';
import { AppError, ErrorType } from '../lib/error';
import { products } from '../stripe-config';
import { 
  redirectToCheckout, 
  cancelSubscription as cancelStripeSubscription,
  reactivateSubscription as reactivateStripeSubscription,
  redirectToCustomerPortal,
  getSubscriptionPlans,
  updatePaymentMethod,
  isTransactionSecure
} from '../lib/stripe';
import { StripePriceWithProduct } from '../types';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useAuthStore } from '../store/authStore';
import { getEnv } from '../lib/env';
import { api } from '../lib/api';

type Product = typeof products[keyof typeof products];

export function useStripe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<StripePriceWithProduct[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const { user } = useAuthStore();

  const createCheckoutSession = async (plan: any) => {
    if (!user) {
      setError('You must be logged in');
      return;
    }
    
      setLoading(true);
      setError(null);

    try {
      const apiUrl = getEnv('VITE_API_URL');
      const response = await fetch(`${apiUrl}/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}` // Simple auth for Edge Function
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          returnUrl: window.location.href
        })
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = result.url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to initiate checkout');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user) {
      setError('You must be logged in');
      return;
    }
    
      setLoading(true);
      setError(null);

    try {
      const apiUrl = getEnv('VITE_API_URL');
      const response = await fetch(`${apiUrl}/stripe-cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ userId: user.id })
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }

      window.location.reload(); // Reload to update UI
    } catch (err: any) {
      console.error('Cancel error:', err);
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const reactivateSubscription = async () => {
    if (!user) {
      setError('You must be logged in');
      return;
    }
    
      setLoading(true);
      setError(null);

    try {
      const apiUrl = getEnv('VITE_API_URL');
      const response = await fetch(`${apiUrl}/stripe-reactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ userId: user.id })
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reactivate subscription');
      }
      
      window.location.reload(); // Reload to update UI
    } catch (err: any) {
      console.error('Reactivate error:', err);
      setError(err.message || 'Failed to reactivate subscription');
    } finally {
      setLoading(false);
    }
  };

  const goToCustomerPortal = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for security issues
      if (!isTransactionSecure()) {
        throw new AppError('Portal cannot be accessed securely in this environment', ErrorType.PAYMENT);
      }

      await redirectToCustomerPortal();
      return true;
    } catch (err) {
      console.error('Customer portal error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethodById = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);

      await updatePaymentMethod(paymentMethodId);
      return true;
    } catch (err) {
      console.error('Payment method update error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      setLoadingPlans(true);
      const availablePlans = await getSubscriptionPlans();
      setPlans(availablePlans);
      return availablePlans;
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription plans');
      return [];
    } finally {
      setLoadingPlans(false);
    }
  };

  return {
    createCheckoutSession,
    cancelSubscription,
    reactivateSubscription,
    goToCustomerPortal,
    updatePaymentMethod: updatePaymentMethodById,
    fetchSubscriptionPlans,
    plans,
    loading,
    loadingPlans,
    error,
    clearError: () => setError(null),
  };
}