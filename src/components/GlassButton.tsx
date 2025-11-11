import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/colors';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    styles[`button_${size}`],
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <BlurView intensity={30} tint="dark" style={styles.blur}>
        {loading ? (
          <ActivityIndicator color={colors.text.primary} />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.glass.backgroundLight,
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.glassLight,
  },
  button_small: {
    height: 36,
  },
  button_medium: {
    height: 48,
  },
  button_large: {
    height: 56,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  blur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  text: {
    ...typography.headline,
    color: colors.text.primary,
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 17,
  },
  text_large: {
    fontSize: 19,
  },
  text_primary: {
    fontWeight: '600',
  },
  text_secondary: {
    fontWeight: '500',
  },
  text_outline: {
    fontWeight: '500',
  },
  textDisabled: {
    opacity: 0.5,
  },
});
