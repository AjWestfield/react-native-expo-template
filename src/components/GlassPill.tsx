import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/colors';
import { useResponsive } from '../hooks/useResponsive';
import { getResponsiveFontSize } from '../utils/responsive';

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
  const responsive = useResponsive();

  // Scale pill size for desktop
  const horizontalPadding = responsive.isDesktop || responsive.isLargeDesktop ? 20 : spacing.md;
  const verticalPadding = responsive.isDesktop || responsive.isLargeDesktop ? 12 : spacing.sm;
  const fontSize = getResponsiveFontSize(14, responsive);

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
        style={[
          styles.blur,
          {
            paddingHorizontal: horizontalPadding,
            paddingVertical: verticalPadding,
          },
        ]}
      >
        {icon && <>{icon}</>}
        <Text
          style={[
            styles.text,
            { fontSize },
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
    gap: spacing.xs,
  },
  text: {
    color: colors.text.secondary,
    fontWeight: '500',
  },
  textActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});
