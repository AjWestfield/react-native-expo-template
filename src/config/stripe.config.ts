/**
 * Stripe Configuration
 *
 * Configure your Stripe keys and subscription plans here.
 * For production, use environment variables to store sensitive keys.
 */

import { SubscriptionPlan } from '../types/payment';

// Stripe API Configuration
export const STRIPE_CONFIG = {
  // IMPORTANT: Replace with your actual Stripe publishable key
  // In production, use environment variables (e.g., process.env.EXPO_PUBLIC_STRIPE_KEY)
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE',

  // Your backend API URL for Stripe operations
  // In production, use environment variables (e.g., process.env.EXPO_PUBLIC_API_URL)
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/stripe',

  // Apple Pay merchant identifier (iOS only)
  merchantIdentifier: 'merchant.com.yourapp',

  // URL scheme for payment redirects
  urlScheme: 'yourapp',
};

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    currency: 'usd',
    interval: 'month',
    credits: 3,
    features: [
      '3 video generations per month',
      'Up to 30 seconds per video',
      'Standard quality (720p)',
      'Basic styles',
      'Watermark on videos',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    tier: 'starter',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    credits: 25,
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_STARTER || 'price_starter_monthly',
    features: [
      '25 video generations per month',
      'Up to 60 seconds per video',
      'HD quality (1080p)',
      'All styles including Cinematic & Anime',
      'No watermark',
      'Priority queue',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    price: 29.99,
    currency: 'usd',
    interval: 'month',
    credits: 100,
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_PRO || 'price_pro_monthly',
    features: [
      '100 video generations per month',
      'Up to 120 seconds per video',
      '4K quality',
      'All styles + Custom templates',
      'No watermark',
      'Priority queue',
      'Advanced editing tools',
      'Export to multiple formats',
      'Commercial license',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    price: 99.99,
    currency: 'usd',
    interval: 'month',
    credits: 500,
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly',
    features: [
      'Unlimited video generations',
      'Up to 300 seconds per video',
      '8K quality',
      'All features + API access',
      'No watermark',
      'Highest priority queue',
      'Custom AI model training',
      'Dedicated support',
      'Team collaboration (up to 10 users)',
      'Commercial license',
      'White-label option',
    ],
  },
];

// Credit packages for one-time purchases
export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 4.99,
    currency: 'usd',
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_CREDITS_10 || 'price_credits_10',
  },
  {
    id: 'credits_25',
    name: '25 Credits',
    credits: 25,
    price: 9.99,
    currency: 'usd',
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_CREDITS_25 || 'price_credits_25',
    popular: true,
  },
  {
    id: 'credits_50',
    name: '50 Credits',
    credits: 50,
    price: 17.99,
    currency: 'usd',
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_CREDITS_50 || 'price_credits_50',
  },
  {
    id: 'credits_100',
    name: '100 Credits',
    credits: 100,
    price: 29.99,
    currency: 'usd',
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_CREDITS_100 || 'price_credits_100',
    bestValue: true,
  },
];

// Get plan by tier
export const getPlanByTier = (tier: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.tier === tier);
};

// Get plan by ID
export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
};
