import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { getEnv } from './env';

// Get environment variables using our type-safe accessor
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);