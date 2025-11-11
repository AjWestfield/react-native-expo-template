/**
 * BillingScreen
 *
 * Manage subscriptions, payment methods, and billing history
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme/colors';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { PaymentMethodCard } from '../components/PaymentMethodCard';
import { SUBSCRIPTION_PLANS } from '../config/stripe.config';
import { useSubscription, usePaymentMethods, useCreditBalance } from '../hooks/usePayment';
import { SubscriptionPlan } from '../types/payment';

const { width } = Dimensions.get('window');

type TabType = 'plans' | 'payment' | 'history';

export const BillingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('plans');

  // Mock user ID - replace with actual user authentication
  const userId = 'user_123';
  const customerId = 'cus_123';

  // Hooks
  const {
    subscription,
    loading: subscriptionLoading,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
  } = useSubscription(userId);

  const {
    paymentMethods,
    loading: paymentMethodsLoading,
    removePaymentMethod,
    setDefaultPaymentMethod,
  } = usePaymentMethods(customerId);

  const { balance, loading: balanceLoading } = useCreditBalance(userId);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.tier === 'free') {
      // Handle downgrade to free
      Alert.alert(
        'Downgrade to Free',
        'Are you sure you want to downgrade to the free plan?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Downgrade',
            style: 'destructive',
            onPress: async () => {
              try {
                if (subscription) {
                  await cancelSubscription(false);
                  Alert.alert('Success', 'Your subscription has been canceled.');
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
              }
            },
          },
        ]
      );
      return;
    }

    if (!subscription) {
      // Create new subscription
      Alert.alert(
        'Subscribe to ' + plan.name,
        `You'll be charged $${plan.price}/${plan.interval}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Subscribe',
            onPress: async () => {
              try {
                await createSubscription(plan);
                Alert.alert('Success', `You're now subscribed to ${plan.name}!`);
              } catch (error) {
                Alert.alert('Error', 'Failed to create subscription. Please try again.');
              }
            },
          },
        ]
      );
    } else {
      // Update existing subscription
      Alert.alert(
        'Change Plan',
        `Switch to ${plan.name} for $${plan.price}/${plan.interval}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change',
            onPress: async () => {
              try {
                await updateSubscription(plan);
                Alert.alert('Success', `Your plan has been updated to ${plan.name}!`);
              } catch (error) {
                Alert.alert('Error', 'Failed to update subscription. Please try again.');
              }
            },
          },
        ]
      );
    }
  };

  const handleRemovePaymentMethod = async (id: string) => {
    Alert.alert('Remove Payment Method', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removePaymentMethod(id);
            Alert.alert('Success', 'Payment method removed.');
          } catch (error) {
            Alert.alert('Error', 'Failed to remove payment method.');
          }
        },
      },
    ]);
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      Alert.alert('Success', 'Default payment method updated.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update default payment method.');
    }
  };

  const handleAddPaymentMethod = () => {
    Alert.alert('Add Payment Method', 'Payment sheet integration would open here.');
    // TODO: Integrate with Stripe Payment Sheet
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Your subscription will remain active until the end of the billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription(true);
              Alert.alert('Success', 'Your subscription will be canceled at period end.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription.');
            }
          },
        },
      ]
    );
  };

  const currentTier = subscription?.plan.tier || 'free';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={styles.header}
      >
        <Text style={styles.title}>Billing & Plans</Text>
        <Text style={styles.subtitle}>Manage your subscription and payment methods</Text>

        {/* Credit Balance */}
        <GlassCard style={styles.creditCard}>
          <View style={styles.creditContent}>
            <View style={styles.creditInfo}>
              <Ionicons name="videocam" size={24} color="#8B5CF6" />
              <View style={styles.creditText}>
                <Text style={styles.creditLabel}>Available Credits</Text>
                {balanceLoading ? (
                  <ActivityIndicator size="small" color={colors.text.primary} />
                ) : (
                  <Text style={styles.creditBalance}>{balance} videos</Text>
                )}
              </View>
            </View>
            <Pressable style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Buy More</Text>
            </Pressable>
          </View>
        </GlassCard>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setActiveTab('plans')}
          style={[styles.tab, activeTab === 'plans' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'plans' && styles.tabTextActive]}>
            Plans
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('payment')}
          style={[styles.tab, activeTab === 'payment' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'payment' && styles.tabTextActive]}>
            Payment Methods
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('history')}
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'plans' && (
          <View>
            {subscriptionLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.text.primary} />
                <Text style={styles.loadingText}>Loading plans...</Text>
              </View>
            ) : (
              <>
                {subscription && subscription.cancelAtPeriodEnd && (
                  <GlassCard style={styles.warningCard}>
                    <Ionicons name="warning" size={24} color="#F59E0B" />
                    <View style={styles.warningContent}>
                      <Text style={styles.warningTitle}>Subscription Ending</Text>
                      <Text style={styles.warningText}>
                        Your subscription will end on{' '}
                        {subscription.currentPeriodEnd.toLocaleDateString()}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => reactivateSubscription()}
                      style={styles.reactivateButton}
                    >
                      <Text style={styles.reactivateText}>Reactivate</Text>
                    </Pressable>
                  </GlassCard>
                )}

                {SUBSCRIPTION_PLANS.map((plan, index) => (
                  <SubscriptionCard
                    key={plan.id}
                    plan={plan}
                    isCurrentPlan={plan.tier === currentTier}
                    isPopular={plan.tier === 'pro'}
                    onSelect={handleSelectPlan}
                  />
                ))}

                {subscription && subscription.tier !== 'free' && (
                  <GlassButton
                    variant="outline"
                    onPress={handleCancelSubscription}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                  </GlassButton>
                )}
              </>
            )}
          </View>
        )}

        {activeTab === 'payment' && (
          <View>
            {paymentMethodsLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.text.primary} />
                <Text style={styles.loadingText}>Loading payment methods...</Text>
              </View>
            ) : (
              <>
                {paymentMethods.length === 0 ? (
                  <GlassCard style={styles.emptyState}>
                    <Ionicons name="card-outline" size={48} color={colors.text.tertiary} />
                    <Text style={styles.emptyTitle}>No Payment Methods</Text>
                    <Text style={styles.emptyText}>
                      Add a payment method to subscribe to a plan
                    </Text>
                  </GlassCard>
                ) : (
                  paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      paymentMethod={method}
                      onRemove={handleRemovePaymentMethod}
                      onSetDefault={handleSetDefaultPaymentMethod}
                    />
                  ))
                )}

                <GlassButton onPress={handleAddPaymentMethod} style={styles.addButton}>
                  <Ionicons name="add-circle-outline" size={20} color={colors.text.primary} />
                  <Text style={styles.addButtonText}>Add Payment Method</Text>
                </GlassButton>
              </>
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <GlassCard style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Payment History</Text>
            <Text style={styles.emptyText}>Your payment history will appear here</Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  creditCard: {
    padding: spacing.md,
  },
  creditContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creditInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  creditText: {
    gap: spacing.xs,
  },
  creditLabel: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
  creditBalance: {
    ...typography.headline,
    color: colors.text.primary,
    fontWeight: '700',
  },
  buyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: borderRadius.lg,
  },
  buyButtonText: {
    ...typography.callout,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    ...typography.callout,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...typography.callout,
    color: '#F59E0B',
    fontWeight: '600',
  },
  warningText: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  reactivateButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: borderRadius.lg,
  },
  reactivateText: {
    ...typography.callout,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: spacing.lg,
  },
  cancelButtonText: {
    ...typography.callout,
    color: colors.status.error,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.text.primary,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  addButton: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  addButtonText: {
    ...typography.callout,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
