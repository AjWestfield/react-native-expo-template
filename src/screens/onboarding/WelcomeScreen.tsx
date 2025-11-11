import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassButton, OnboardingLayout } from '../../components';
import { colors, typography, spacing, borderRadius } from '../../theme/colors';
import { OnboardingNavigatorParamList } from '../../types/onboarding';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsiveFontSize, getResponsiveSpacing } from '../../utils/responsive';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingNavigatorParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const responsive = useResponsive();
  const responsiveSpacing = getResponsiveSpacing(responsive);
  const isDesktop = responsive.isDesktop || responsive.isLargeDesktop;
  const heroSize = isDesktop ? 420 : 260;
  const titleFontSize = getResponsiveFontSize(36, responsive);
  const subtitleFontSize = getResponsiveFontSize(16, responsive);

  const sideContent = (
    <View style={styles.heroOuter}>
      <View
        style={[
          styles.imagePlaceholder,
          {
            width: heroSize,
            height: heroSize,
            borderRadius: Math.max(borderRadius.xl, heroSize * 0.15),
          },
        ]}
      >
        <Text style={[styles.placeholderText, { fontSize: heroSize * 0.35 }]}>🎬</Text>
      </View>
    </View>
  );

  return (
    <OnboardingLayout
      sideContent={sideContent}
      contentWidth="small"
      style={[styles.panel, { padding: responsiveSpacing.vertical * 1.25 }]}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.title, { fontSize: titleFontSize }]}>AI-Powered Video Creation</Text>
        <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>
          Create engaging video content optimized for maximum reach with the power of AI
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <GlassButton
          title="Get Started"
          onPress={() => navigation.navigate('GoalSelection')}
          variant="glow"
          size="large"
        />
      </View>
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
  },
  heroOuter: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  imagePlaceholder: {
    backgroundColor: colors.glass.backgroundMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  placeholderText: {
    fontSize: 120,
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
  buttonContainer: {
    width: '100%',
  },
});
