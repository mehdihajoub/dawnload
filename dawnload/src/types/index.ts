export type DAWType = 
  | 'Logic Pro'
  | 'FL Studio'
  | 'Ableton Live'
  | 'Cubase'
  | 'Pro Tools'
  | 'Studio One'
  | 'Bitwig Studio'
  | 'Reason'
  | 'Reaper'
  | 'GarageBand';

export type Genre =
  | 'Hip-Hop'
  | 'Electronic'
  | 'Pop'
  | 'Rock'
  | 'R&B'
  | 'EDM'
  | 'Trap'
  | 'House'
  | 'Techno'
  | 'Ambient'
  | 'Jazz'
  | 'Classical'
  | 'Folk'
  | 'World'
  | 'Other';

export type MusicalKey =
  | 'C'
  | 'C#/Db'
  | 'D'
  | 'D#/Eb'
  | 'E'
  | 'F'
  | 'F#/Gb'
  | 'G'
  | 'G#/Ab'
  | 'A'
  | 'A#/Bb'
  | 'B'
  | 'Am'
  | 'A#m/Bbm'
  | 'Bm'
  | 'Cm'
  | 'C#m/Dbm'
  | 'Dm'
  | 'D#m/Ebm'
  | 'Em'
  | 'Fm'
  | 'F#m/Gbm'
  | 'Gm'
  | 'G#m/Abm';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  is_premium?: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  dawType: DAWType;
  genre: Genre;
  bpm: number;
  key: MusicalKey;
  price: number;
  previewUrl: string;
  imageUrl: string;
  authorId: string;
  author: User;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Stripe Types

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'unpaid'
  | 'paused';

export interface StripeSubscription {
  id: string;
  customer: string;
  status: SubscriptionStatus;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
      };
    }>;
  };
  default_payment_method?: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata: Record<string, string>;
  invoice_settings?: {
    default_payment_method?: string;
  };
}

export interface StripePaymentMethod {
  id: string;
  type: 'card' | 'sepa_debit' | 'ideal' | 'bancontact' | 'sofort';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    email?: string;
    name?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  };
}

export interface StripeInvoice {
  id: string;
  customer: string;
  subscription?: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  created: number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
}

export interface StripePriceWithProduct {
  id: string;
  active: boolean;
  currency: string;
  unit_amount: number;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count: number;
    trial_period_days?: number;
  };
  product: {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    metadata: Record<string, string>;
  };
  metadata: Record<string, string>;
}

// Webhook event types
export type StripeWebhookEventType =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.updated'
  | 'customer.deleted'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'payment_method.attached'
  | 'payment_method.updated'
  | 'payment_method.detached'
  | 'checkout.session.completed';

export interface StripeWebhookEvent {
  id: string;
  object: 'event';
  type: StripeWebhookEventType;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
  api_version?: string;
}

// Customer portal types
export interface StripePortalSession {
  id: string;
  object: 'billing_portal.session';
  created: number;
  customer: string;
  livemode: boolean;
  return_url: string;
  url: string;
}

// Database representation of a subscription
export interface UserSubscription {
  user_id: string;
  customer_id: string;
  subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
  trial_end: number | null;
  created_at: string;
  updated_at: string;
}