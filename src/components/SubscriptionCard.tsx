/**
 * SubscriptionCard Component
 *
 * Displays a subscription plan with glassmorphic design
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionPlan } from '../types/payment';
import { colors, typography, spacing, borderRadius } from '../theme/colors';
import { GlassCard } from './GlassCard';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  isCurrentPlan = false,
  isPopular = false,
  onSelect,
}) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return ['#666666', '#444444'];
      case 'starter':
        return ['#3B82F6', '#2563EB'];
      case 'pro':
        return ['#8B5CF6', '#7C3AED'];
      case 'enterprise':
        return ['#F59E0B', '#D97706'];
      default:
        return ['#3B82F6', '#2563EB'];
    }
  };

  const gradientColors = getTierColor(plan.tier);

  return (
    <Pressable
      onPress={() => onSelect(plan)}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.popularGradient}>
            <Ionicons name="star" size={12} color={colors.text.primary} />
            <Text style={styles.popularText}>Most Popular</Text>
          </LinearGradient>
        </View>
      )}

      <GlassCard style={[styles.card, isCurrentPlan && styles.currentPlan]}>
        {/* Header */}
        <LinearGradient colors={gradientColors} style={styles.header}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.price}>{plan.price}</Text>
            <Text style={styles.interval}>/{plan.interval}</Text>
          </View>
          <Text style={styles.credits}>{plan.credits} credits per month</Text>
        </LinearGradient>

        {/* Features */}
        <View style={styles.features}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={gradientColors[0]} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Action Button */}
        {isCurrentPlan ? (
          <View style={styles.currentBadge}>
            <Text style={styles.currentText}>Current Plan</Text>
          </View>
        ) : (
          <LinearGradient colors={gradientColors} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>
              {plan.tier === 'free' ? 'Downgrade' : 'Select Plan'}
            </Text>
          </LinearGradient>
        )}
      </GlassCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  currentPlan: {
    borderWidth: 2,
    borderColor: colors.glass.border,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.lg,
    zIndex: 10,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  popularGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  popularText: {
    ...typography.caption1,
    color: colors.text.primary,
    fontWeight: '600',
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  planName: {
    ...typography.title2,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  currency: {
    ...typography.headline,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  price: {
    ...typography.hero,
    color: colors.text.primary,
    fontWeight: '700',
  },
  interval: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  credits: {
    ...typography.callout,
    color: colors.text.secondary,
  },
  features: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  selectButton: {
    margin: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  selectButtonText: {
    ...typography.callout,
    color: colors.text.primary,
    fontWeight: '600',
  },
  currentBadge: {
    margin: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.medium,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
  },
  currentText: {
    ...typography.callout,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
