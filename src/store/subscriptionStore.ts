import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { AppError, ErrorType, withErrorHandling } from '../lib/error';
import { UserSubscription } from '../types';
import { useAuthStore } from './authStore';

interface SubscriptionState {
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchSubscription: () => Promise<void>;
  setSubscription: (subscription: UserSubscription | null) => void;
  clearSubscription: () => void;
  clearError: () => void;
}

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      loading: false,
      error: null,
      lastFetched: null,

      fetchSubscription: async () => {
        const { user } = useAuthStore.getState();
        
        if (!user) {
          set({ subscription: null, loading: false, error: null });
          return;
        }

        const lastFetched = get().lastFetched;
        const now = Date.now();
        
        // If we have a cached subscription and it's still valid, don't fetch again
        if (
          lastFetched && 
          now - lastFetched < CACHE_DURATION && 
          get().subscription
        ) {
          return;
        }
        
        set({ loading: true, error: null });
        
        try {
          await withErrorHandling(async () => {
            const { data: subscriptionData, error: subscriptionError } = await supabase
              .from('stripe_user_subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .single();

            if (subscriptionError) {
              // If no subscription exists, this is not an error
              if (subscriptionError.code === 'PGRST116') {
                set({ 
                  subscription: null, 
                  loading: false, 
                  error: null,
                  lastFetched: Date.now()
                });
                return;
              }
              throw new AppError(
                subscriptionError.message, 
                ErrorType.API, 
                { userId: user.id },
                subscriptionError
              );
            }

            set({ 
              subscription: subscriptionData, 
              loading: false, 
              error: null,
              lastFetched: Date.now()
            });
          }, { 
            retries: 2, 
            errorMessage: 'Failed to fetch subscription data',
            errorType: ErrorType.API
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription';
          console.error('Error fetching subscription:', err);
          set({ error: errorMessage, loading: false });
        }
      },
      
      setSubscription: (subscription: UserSubscription | null) => {
        set({ subscription, lastFetched: Date.now() });
      },
      
      clearSubscription: () => {
        set({ subscription: null, lastFetched: null });
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'subscription-storage',
      // Only persist the subscription data, not loading states or methods
      partialize: (state) => ({ 
        subscription: state.subscription,
        lastFetched: state.lastFetched
      }),
    }
  )
);

// Initialize subscription when auth state changes
export const initializeSubscription = () => {
  // Set up listener for auth state changes
  useAuthStore.subscribe((state, prevState) => {
    // If user just logged in or changed
    if (state.user && (!prevState.user || state.user.id !== prevState.user?.id)) {
      useSubscriptionStore.getState().fetchSubscription();
    }
    
    // If user logged out
    if (!state.user && prevState.user) {
      useSubscriptionStore.getState().clearSubscription();
    }
  });
  
  // Initial fetch if user is already logged in
  if (useAuthStore.getState().user) {
    useSubscriptionStore.getState().fetchSubscription();
  }
}; 