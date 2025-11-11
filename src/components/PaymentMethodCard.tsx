/**
 * PaymentMethodCard Component
 *
 * Displays a payment method (card) with glassmorphic design
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethod } from '../types/payment';
import { colors, typography, spacing, borderRadius } from '../theme/colors';
import { GlassCard } from './GlassCard';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onRemove: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onRemove,
  onSetDefault,
}) => {
  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const formatExpiry = (month?: number, year?: number) => {
    if (!month || !year) return '';
    return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.content}>
        {/* Card Icon */}
        <View
          style={[
            styles.iconContainer,
            paymentMethod.isDefault && styles.iconContainerDefault,
          ]}
        >
          <Ionicons
            name={getCardIcon(paymentMethod.brand) as any}
            size={24}
            color={paymentMethod.isDefault ? '#3B82F6' : colors.text.secondary}
          />
        </View>

        {/* Card Info */}
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.brand}>
              {paymentMethod.brand?.toUpperCase() || 'CARD'}
            </Text>
            {paymentMethod.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.number}>•••• {paymentMethod.last4}</Text>
          {paymentMethod.expiryMonth && paymentMethod.expiryYear && (
            <Text style={styles.expiry}>
              Expires {formatExpiry(paymentMethod.expiryMonth, paymentMethod.expiryYear)}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!paymentMethod.isDefault && onSetDefault && (
            <Pressable
              onPress={() => onSetDefault(paymentMethod.id)}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <Ionicons name="star-outline" size={20} color={colors.text.secondary} />
            </Pressable>
          )}
          <Pressable
            onPress={() => onRemove(paymentMethod.id)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDefault: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brand: {
    ...typography.callout,
    color: colors.text.primary,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: borderRadius.sm,
  },
  defaultText: {
    ...typography.caption2,
    color: '#3B82F6',
    fontWeight: '600',
  },
  number: {
    ...typography.body,
    color: colors.text.secondary,
  },
  expiry: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  pressed: {
    opacity: 0.5,
  },
});
