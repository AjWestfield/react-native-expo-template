import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassButton, OnboardingLayout } from '../../components';
import { colors, typography, spacing, borderRadius } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsiveSpacing, getResponsiveFontSize } from '../../utils/responsive';

type WelcomeCompletionScreenProps = {
  onComplete: () => void;
};

export const WelcomeCompletionScreen: React.FC<WelcomeCompletionScreenProps> = ({
  onComplete,
}) => {
  const responsive = useResponsive();
  const responsiveSpacing = getResponsiveSpacing(responsive);

  return (
    <OnboardingLayout
      contentWidth="small"
      style={[styles.panel, { padding: responsiveSpacing.vertical * 1.25 }]}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={80} color={colors.text.primary} />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { fontSize: getResponsiveFontSize(34, responsive) }]}>Welcome aboard!</Text>
        <Text style={[styles.subtitle, { fontSize: getResponsiveFontSize(16, responsive) }]}>
          You're all set up and ready to create amazing videos with AI. Let's make something incredible!
        </Text>
      </View>

      <GlassButton title="Explore the app" onPress={onComplete} variant="glow" size="large" />
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
    gap: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: '100%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.glass.backgroundMedium,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
