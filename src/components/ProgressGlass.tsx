import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

interface ProgressGlassProps {
  progress: number; // 0-100
  label?: string;
}

export const ProgressGlass: React.FC<ProgressGlassProps> = ({
  progress,
  label = 'Generating...',
}) => {
  const progressWidth = `${Math.max(0, Math.min(100, progress))}%`;

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.subheadline,
    color: colors.text.primary,
    fontWeight: '500',
  },
  percentage: {
    ...typography.subheadline,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.text.primary,
    borderRadius: borderRadius.sm,
  },
});
