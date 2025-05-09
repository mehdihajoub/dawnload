export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url: string | null
          bio: string | null
          is_premium: boolean
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          avatar_url?: string | null
          bio?: string | null
          is_premium?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          avatar_url?: string | null
          bio?: string | null
          is_premium?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          daw_type: string
          genre: string
          bpm: number
          key: string
          price: number
          preview_url: string | null
          image_url: string | null
          project_file_url: string | null
          status: 'draft' | 'published' | 'archived'
          author_id: string
          download_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          daw_type: string
          genre: string
          bpm: number
          key: string
          price?: number
          preview_url?: string | null
          image_url?: string | null
          project_file_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          author_id: string
          download_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          daw_type?: string
          genre?: string
          bpm?: number
          key?: string
          price?: number
          preview_url?: string | null
          image_url?: string | null
          project_file_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          author_id?: string
          download_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      downloads: {
        Row: {
          id: string
          project_id: string
          user_id: string
          amount_paid: number | null
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          amount_paid?: number | null
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          amount_paid?: number | null
          stripe_payment_id?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          status: 'active' | 'canceled' | 'past_due'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          status?: 'active' | 'canceled' | 'past_due'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          status?: 'active' | 'canceled' | 'past_due'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}