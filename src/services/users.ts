import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type User = Database['public']['Tables']['users']['Row'];

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
  
  return data;
}

export async function getUserProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('author_id', userId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }
  
  return data;
}

// New function to get the current authenticated user's full profile
export async function getCurrentUserProfile(): Promise<User | null> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    console.error('Error getting session or no user:', sessionError);
    return null; // Not logged in
  }
  
  const userId = session.user.id;
  
  const { data, error } = await supabase
    .from('users')
    .select('*') // Select all columns including stripe_connect_id, payout_enabled
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    return null;
  }
  
  return data;
} 