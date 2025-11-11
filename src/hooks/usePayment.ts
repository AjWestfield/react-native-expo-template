/**
 * Payment Hooks
 *
 * Custom React hooks for integrating Stripe payments into components
 */

import { useState, useEffect, useCallback } from 'react';
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';
import { getStripeAgent } from '../services/stripeAgent';
import {
  UserSubscription,
  PaymentMethod,
  PaymentHistory,
  SubscriptionPlan,
  PaymentIntent,
} from '../types/payment';

/**
 * Hook for managing subscription state
 */
export const useSubscription = (userId?: string) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSubscription = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const agent = getStripeAgent();
      const subscriptionId = await agent.getCustomerId(); // In real app, get subscription ID

      if (subscriptionId) {
        const sub = await agent.getSubscription(subscriptionId);
        setSubscription(sub);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load subscription'));
      console.error('Error loading subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const createSubscription = async (plan: SubscriptionPlan, paymentMethodId?: string) => {
    try {
      setLoading(true);
      const agent = getStripeAgent();
      const customerId = await agent.getCustomerId();

      if (!customerId) {
        throw new Error('No customer ID found');
      }

      if (!plan.stripePriceId) {
        throw new Error('Plan does not have a Stripe price ID');
      }

      const newSubscription = await agent.createSubscription(
        customerId,
        plan.stripePriceId,
        paymentMethodId
      );

      setSubscription(newSubscription);
      return newSubscription;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create subscription'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (newPlan: SubscriptionPlan) => {
    try {
      if (!subscription?.stripeSubscriptionId) {
        throw new Error('No active subscription');
      }

      if (!newPlan.stripePriceId) {
        throw new Error('Plan does not have a Stripe price ID');
      }

      setLoading(true);
      const agent = getStripeAgent();
      const updatedSubscription = await agent.updateSubscription(
        subscription.stripeSubscriptionId,
        newPlan.stripePriceId
      );

      setSubscription(updatedSubscription);
      return updatedSubscription;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update subscription'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
    try {
      if (!subscription?.stripeSubscriptionId) {
        throw new Error('No active subscription');
      }

      setLoading(true);
      const agent = getStripeAgent();
      await agent.cancelSubscription(subscription.stripeSubscriptionId, cancelAtPeriodEnd);

      // Update local state
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cancel subscription'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reactivateSubscription = async () => {
    try {
      if (!subscription?.stripeSubscriptionId) {
        throw new Error('No subscription to reactivate');
      }

      setLoading(true);
      const agent = getStripeAgent();
      const reactivated = await agent.reactivateSubscription(subscription.stripeSubscriptionId);

      setSubscription(reactivated);
      return reactivated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reactivate subscription'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    loading,
    error,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    refresh: loadSubscription,
  };
};

/**
 * Hook for managing payment methods
 */
export const usePaymentMethods = (customerId?: string) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPaymentMethods = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const agent = getStripeAgent();
      const methods = await agent.getPaymentMethods(customerId);
      setPaymentMethods(methods);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load payment methods'));
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      const agent = getStripeAgent();
      await agent.removePaymentMethod(paymentMethodId);
      await loadPaymentMethods();
    } catch (err) {
      throw err;
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      if (!customerId) {
        throw new Error('No customer ID');
      }

      const agent = getStripeAgent();
      await agent.setDefaultPaymentMethod(customerId, paymentMethodId);
      await loadPaymentMethods();
    } catch (err) {
      throw err;
    }
  };

  return {
    paymentMethods,
    loading,
    error,
    removePaymentMethod,
    setDefaultPaymentMethod,
    refresh: loadPaymentMethods,
  };
};

/**
 * Hook for payment sheet integration
 */
export const usePaymentSheetSetup = () => {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [loading, setLoading] = useState(false);

  const setupPaymentSheet = async (clientSecret: string, customerId: string) => {
    try {
      setLoading(true);

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        customerId,
        merchantDisplayName: 'AI Video Generator',
        style: 'automatic',
        returnURL: 'yourapp://payment-result',
      });

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      console.error('Error setting up payment sheet:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      console.error('Error processing payment:', err);
      throw err;
    }
  };

  return {
    setupPaymentSheet,
    processPayment,
    loading,
  };
};

/**
 * Hook for payment history
 */
export const usePaymentHistory = (customerId?: string) => {
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!customerId) {
        setLoading(false);
        return;
      }

      try {
        const agent = getStripeAgent();
        const payments = await agent.getPaymentHistory(customerId);
        setHistory(payments);
      } catch (err) {
        console.error('Error loading payment history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [customerId]);

  return { history, loading };
};

/**
 * Hook for credit balance management
 */
export const useCreditBalance = (userId?: string) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadBalance = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const agent = getStripeAgent();
      const currentBalance = await agent.getCreditBalance(userId);
      setBalance(currentBalance);
    } catch (err) {
      console.error('Error loading credit balance:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  return {
    balance,
    loading,
    refresh: loadBalance,
  };
};
