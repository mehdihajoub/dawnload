import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AppError, ErrorType } from '../lib/error';
import { getEnv } from '../lib/env';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  initialized: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, username: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
      initialized: false,
      loading: true,

      setUser: (user: User | null) => set({ user, initialized: true, loading: false }),

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            throw new AppError(error.message, ErrorType.AUTHENTICATION, { email });
          }

          if (!data.user) {
            throw new AppError('User not found', ErrorType.AUTHENTICATION, { email });
          }

          set({ user: data.user, loading: false });
          return data.user;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, username: string) => {
        set({ loading: true });
        try {
          // Log the function call
          console.log('Starting registration process with username:', username, 'and email:', email);
          
          // First check if username is taken
          const { data: existingUsers, error: usernameCheckError } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

          if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
            console.error('Username check error:', usernameCheckError);
            throw new AppError(
              'Failed to check username availability',
              ErrorType.API,
              { username },
              usernameCheckError
            );
          }

          if (existingUsers) {
            console.log('Username already taken:', username);
            throw new AppError('Username is already taken', ErrorType.VALIDATION, { username });
          }

          // Register the user with Supabase Auth
          console.log('Registering user with email:', email, 'and username:', username);
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
              },
            },
          });

          if (error) {
            console.error('Registration error:', error);
            throw new AppError(error.message, ErrorType.AUTHENTICATION, { email });
          }

          if (!data.user) {
            console.error('No user returned from signUp call');
            throw new AppError('Registration failed', ErrorType.AUTHENTICATION);
          }

          console.log('Auth signup successful, user:', data.user.id);
          console.log('User metadata:', data.user.user_metadata);

          // Try three different approaches to create the user profile
          const userData = {
            id: data.user.id,
            username,
            email,
            avatar_url: null,
            bio: null,
            is_premium: false,
            stripe_customer_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Try 1: Direct DB insert
          console.log('Attempt 1: Direct insert to users table');
          const { error: directError } = await supabase.from('users').insert(userData);
          
          if (directError) {
            console.warn('Direct insert failed:', directError);
            
            // Try 2: Use Edge Function if available
            try {
              console.log('Attempt 2: Creating user profile using Edge Function');
              const apiUrl = getEnv('VITE_API_URL');
              const response = await fetch(`${apiUrl}/register-user`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: data.user.id,
                  username,
                  email,
                }),
              });

              // Check if the response is valid JSON
              const contentType = response.headers.get('content-type');
              let result;
              if (contentType && contentType.includes('application/json')) {
                result = await response.json();
              } else {
                const text = await response.text();
                console.error('Non-JSON response from Edge Function:', text);
                result = { error: 'Invalid response from server' };
              }
              
              if (!response.ok) {
                console.error('Edge function error:', result.error);
                throw new Error(result.error || 'Failed to create user profile');
              }
              
              console.log('Successfully created user profile with Edge Function:', result);
            } catch (profileError) {
              console.error('Edge Function attempt failed:', profileError);
              
              // Try 3: Use RPC function
              console.log('Attempt 3: Using RPC function');
              const { error: rpcError } = await supabase.rpc('create_user_profile', {
                p_user_id: data.user.id,
                p_username: username,
                p_email: email
              });
              
              if (rpcError) {
                console.error('All user creation attempts failed:', rpcError);
                throw new AppError(
                  'Failed to create user profile after multiple attempts',
                  ErrorType.API,
                  { userId: data.user.id }
                );
              }
            }
          } else {
            console.log('Successfully created user profile with direct insert');
          }

          set({ user: data.user, loading: false });
          return data.user;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            throw new AppError(error.message, ErrorType.AUTHENTICATION);
          }
          set({ user: null, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      refreshSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Session exists, check if it needs refresh
          const expiresAt = session.expires_at;
          const now = Math.floor(Date.now() / 1000);
          const threshold = 60 * 15; // 15 minutes before expiration
          
          if (expiresAt && expiresAt - now < threshold) {
            try {
              const { data, error } = await supabase.auth.refreshSession();
              
              if (error) {
                console.error('Failed to refresh session:', error);
                set({ user: null, loading: false });
                return;
              }
              
              if (data.user) {
                set({ user: data.user, loading: false });
              }
            } catch (error) {
              console.error('Error refreshing session:', error);
              set({ user: null, loading: false });
            }
          } else {
            // Session is still valid
            set({ user: session.user, loading: false });
          }
        } else {
          // No session
          set({ user: null, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Initialize auth state from stored session
export const initializeAuth = async () => {
  const { refreshSession, setUser } = useAuthStore.getState();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setUser(session.user);
    } else {
      setUser(null);
    }
    
    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });
    
    // Set up periodic session refresh
    setInterval(() => {
      refreshSession();
    }, 10 * 60 * 1000); // Check every 10 minutes
    
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    setUser(null);
  }
};