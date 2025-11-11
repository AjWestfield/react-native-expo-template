import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/colors';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'glow';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
}

type ButtonVariant = NonNullable<GlassButtonProps['variant']>;

const variantTokens: Record<ButtonVariant, { backgroundColor: string; borderColor: string; textColor: string }> = {
  primary: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.surface.border,
    textColor: colors.text.primary,
  },
  secondary: {
    backgroundColor: colors.surface.secondary,
    borderColor: colors.surface.border,
    textColor: colors.text.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.surface.border,
    textColor: colors.text.primary,
  },
  glow: {
    backgroundColor: colors.accent.white,
    borderColor: colors.accent.white,
    textColor: '#000000',
  },
};

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
}) => {
  const tokens = variantTokens[variant] ?? variantTokens.primary;

  const containerStyles = [
    styles.button,
    styles[`button_${size}`],
    {
      backgroundColor: tokens.backgroundColor,
      borderColor: tokens.borderColor,
    },
    variant === 'glow' && styles.buttonGlow,
    disabled && styles.buttonDisabled,
    style,
  ];

  const labelStyles = [
    styles.text,
    styles[`text_${size}`],
    { color: tokens.textColor },
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      <View style={styles.content}>
        {leftIcon ? <View style={styles.iconSlot}>{leftIcon}</View> : null}
        {loading ? (
          <ActivityIndicator color={tokens.textColor} />
        ) : (
          <Text style={labelStyles}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    ...shadows.glassLight,
  },
  button_small: {
    height: 44,
  },
  button_medium: {
    height: 56,
  },
  button_large: {
    height: 60,
  },
  buttonGlow: {
    shadowColor: colors.accent.white,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    marginRight: spacing.sm,
  },
  text: {
    ...typography.headline,
    fontWeight: '700',
  },
  text_small: {
    fontSize: 15,
  },
  text_medium: {
    fontSize: 17,
  },
  text_large: {
    fontSize: 19,
  },
  textDisabled: {
    opacity: 0.7,
  },
});
