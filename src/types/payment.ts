/**
 * Payment and Subscription Types
 */

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'canceled'
  | 'past_due'
  | 'trialing';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  credits: number; // Number of video generation credits per billing period
  stripePriceId?: string; // Stripe Price ID
}

export interface UserSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  creditsRemaining: number;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  clientSecret?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string; // e.g., 'visa', 'mastercard'
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string;
  createdAt: Date;
  invoiceUrl?: string;
}

export interface StripeConfig {
  publishableKey: string;
  merchantIdentifier?: string; // For Apple Pay
  urlScheme?: string; // For redirects
}
