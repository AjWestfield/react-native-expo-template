/**
 * Stripe Payment Agent
 *
 * This service handles all Stripe payment operations including:
 * - Payment initialization and processing
 * - Subscription management
 * - Payment method handling
 * - Customer operations
 */

import { StripeProvider, useStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import * as SecureStore from 'expo-secure-store';
import {
  PaymentIntent,
  PaymentMethod,
  PaymentHistory,
  UserSubscription,
  SubscriptionPlan,
  PaymentStatus,
  SubscriptionStatus,
} from '../types/payment';

// Secure storage keys
const STORAGE_KEYS = {
  CUSTOMER_ID: 'stripe_customer_id',
  SUBSCRIPTION_ID: 'stripe_subscription_id',
  PAYMENT_METHODS: 'stripe_payment_methods',
} as const;

/**
 * StripeAgent - Main payment processing service
 */
export class StripeAgent {
  private static instance: StripeAgent;
  private apiBaseUrl: string;
  private publishableKey: string;

  private constructor(apiBaseUrl: string, publishableKey: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.publishableKey = publishableKey;
  }

  /**
   * Initialize the Stripe Agent singleton
   */
  static initialize(apiBaseUrl: string, publishableKey: string): StripeAgent {
    if (!StripeAgent.instance) {
      StripeAgent.instance = new StripeAgent(apiBaseUrl, publishableKey);
    }
    return StripeAgent.instance;
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): StripeAgent {
    if (!StripeAgent.instance) {
      throw new Error('StripeAgent not initialized. Call initialize() first.');
    }
    return StripeAgent.instance;
  }

  /**
   * Get publishable key for StripeProvider
   */
  getPublishableKey(): string {
    return this.publishableKey;
  }

  // ==================== Customer Operations ====================

  /**
   * Create or retrieve Stripe customer
   */
  async createCustomer(userId: string, email: string, name?: string): Promise<string> {
    try {
      // Check if customer ID already exists
      const existingCustomerId = await SecureStore.getItemAsync(STORAGE_KEYS.CUSTOMER_ID);
      if (existingCustomerId) {
        return existingCustomerId;
      }

      // Create new customer via backend
      const response = await fetch(`${this.apiBaseUrl}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, name }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const { customerId } = await response.json();

      // Store customer ID securely
      await SecureStore.setItemAsync(STORAGE_KEYS.CUSTOMER_ID, customerId);

      return customerId;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Get stored customer ID
   */
  async getCustomerId(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.CUSTOMER_ID);
  }

  // ==================== Payment Methods ====================

  /**
   * Add a new payment method
   */
  async addPaymentMethod(customerId: string): Promise<PaymentMethod> {
    try {
      // Get setup intent from backend
      const response = await fetch(`${this.apiBaseUrl}/payment-methods/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }

      const { clientSecret, ephemeralKey } = await response.json();

      // Return setup details for use with Payment Sheet
      return {
        id: clientSecret,
        type: 'card',
        last4: '',
        isDefault: false,
      };
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Get all payment methods for customer
   */
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment-methods/${customerId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const { paymentMethods } = await response.json();
      return paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment-methods/default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, paymentMethodId }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  /**
   * Remove a payment method
   */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove payment method');
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  // ==================== Subscriptions ====================

  /**
   * Create a new subscription
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId?: string
  ): Promise<UserSubscription> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          priceId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }

      const subscription = await response.json();

      // Store subscription ID
      await SecureStore.setItemAsync(STORAGE_KEYS.SUBSCRIPTION_ID, subscription.id);

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(subscriptionId: string): Promise<UserSubscription> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/subscriptions/${subscriptionId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription (upgrade/downgrade)
   */
  async updateSubscription(
    subscriptionId: string,
    newPriceId: string
  ): Promise<UserSubscription> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: newPriceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelAtPeriodEnd }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<UserSubscription> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/subscriptions/${subscriptionId}/reactivate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  // ==================== One-Time Payments ====================

  /**
   * Create a payment intent for one-time purchases
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    description?: string,
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      const customerId = await this.getCustomerId();

      const response = await fetch(`${this.apiBaseUrl}/payment-intents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          customerId,
          description,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment-intents/${paymentIntentId}/confirm`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }

      const { status } = await response.json();
      return status;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // ==================== Payment History ====================

  /**
   * Get payment history
   */
  async getPaymentHistory(customerId: string, limit: number = 10): Promise<PaymentHistory[]> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/payments/history/${customerId}?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  // ==================== Credits Management ====================

  /**
   * Purchase additional credits (one-time purchase)
   */
  async purchaseCredits(
    customerId: string,
    creditPackage: { credits: number; price: number }
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.createPaymentIntent(
        creditPackage.price * 100, // Convert to cents
        'usd',
        `Purchase ${creditPackage.credits} video generation credits`,
        { credits: creditPackage.credits.toString() }
      );

      return paymentIntent;
    } catch (error) {
      console.error('Error purchasing credits:', error);
      throw error;
    }
  }

  /**
   * Get current credit balance
   */
  async getCreditBalance(userId: string): Promise<number> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/credits/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch credit balance');
      }

      const { balance } = await response.json();
      return balance;
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      return 0;
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Clear all stored payment data (for logout)
   */
  async clearPaymentData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.CUSTOMER_ID);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SUBSCRIPTION_ID);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PAYMENT_METHODS);
    } catch (error) {
      console.error('Error clearing payment data:', error);
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

// Export singleton instance getter
export const getStripeAgent = () => StripeAgent.getInstance();
