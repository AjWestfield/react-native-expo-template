import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/colors';

interface GlassPillProps {
  title: string;
  onPress?: () => void;
  active?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GlassPill: React.FC<GlassPillProps> = ({
  title,
  onPress,
  active = false,
  icon,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        active && styles.containerActive,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BlurView
        intensity={active ? 40 : 20}
        tint="dark"
        style={styles.blur}
      >
        {icon && <>{icon}</>}
        <Text
          style={[
            styles.text,
            active && styles.textActive,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginRight: spacing.sm,
    ...shadows.glassLight,
  },
  containerActive: {
    backgroundColor: colors.glass.backgroundLight,
    borderColor: colors.glass.borderLight,
  },
  blur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  text: {
    ...typography.subheadline,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  textActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});
