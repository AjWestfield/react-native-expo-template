import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, borderRadius, shadows } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  blurType?: 'light' | 'default' | 'dark';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  blurType = 'dark',
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint={blurType} style={styles.blur}>
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.glass,
  },
  blur: {
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
  },
  content: {
    backgroundColor: colors.glass.background,
  },
});
