import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { UserSubscription } from '../types';

/**
 * Hook for accessing and managing subscription data
 * This now uses the global subscription store for state management
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          // If the error is that no rows were returned, that's ok (user has no subscription)
          if (fetchError.code === 'PGRST116') {
            setSubscription(null);
          } else {
            console.error('Error fetching subscription:', fetchError);
            setError('Failed to load subscription data');
          }
        } else {
          setSubscription(data);
        }
      } catch (err) {
        console.error('Subscription fetch error:', err);
        setError('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  return { subscription, loading, error };
}