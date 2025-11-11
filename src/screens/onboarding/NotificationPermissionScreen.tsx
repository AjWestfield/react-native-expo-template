import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import {
  GlassButton,
  BenefitItem,
  NotificationMockup,
  OnboardingLayout,
} from '../../components';
import { colors, typography, spacing, borderRadius } from '../../theme/colors';
import { OnboardingNavigatorParamList } from '../../types/onboarding';
import { storageService } from '../../utils/storage';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsiveSpacing, getResponsiveFontSize } from '../../utils/responsive';

type NotificationPermissionScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingNavigatorParamList, 'NotificationPermission'>;
  route: RouteProp<OnboardingNavigatorParamList, 'NotificationPermission'>;
};

export const NotificationPermissionScreen: React.FC<NotificationPermissionScreenProps> = ({
  navigation,
  route,
}) => {
  const { selectedGoals, referralCode } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const responsive = useResponsive();
  const responsiveSpacing = getResponsiveSpacing(responsive);

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await storageService.completeOnboarding(selectedGoals, referralCode, true);
      navigation.navigate('WelcomeCompletion');
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaybeLater = async () => {
    setIsLoading(true);

    try {
      await storageService.completeOnboarding(selectedGoals, referralCode, false);
      navigation.navigate('WelcomeCompletion');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sideContent = (
    <View style={styles.mockupWrapper}>
      <NotificationMockup />
    </View>
  );

  return (
    <OnboardingLayout
      sideContent={sideContent}
      contentWidth="small"
      style={[styles.panel, { padding: responsiveSpacing.vertical }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: getResponsiveFontSize(30, responsive) }]}>Get Notified</Text>
        <Text style={[styles.subtitle, { fontSize: getResponsiveFontSize(16, responsive) }]}>
          We'll notify you when your videos finish generating
        </Text>
      </View>

      <View style={styles.benefitsContainer}>
        <BenefitItem text="Instant alerts when videos complete" />
        <BenefitItem text="Never miss a finished generation" />
        <BenefitItem text="Watch your videos as soon as they're done" />
      </View>

      <View style={styles.spacer} />

      <View style={styles.buttonContainer}>
        <GlassButton
          title="Enable Notifications"
          onPress={handleEnableNotifications}
          variant="glow"
          size="large"
          loading={isLoading}
          style={styles.enableButton}
        />

        <TouchableOpacity onPress={handleMaybeLater} style={styles.maybeLaterButton} disabled={isLoading}>
          <Text style={styles.maybeLaterText}>Maybe later</Text>
        </TouchableOpacity>
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
    minHeight: 480,
  },
  mockupWrapper: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.xl,
  },
  header: {
    gap: spacing.md,
  },
  title: {
    ...typography.title2,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  benefitsContainer: {
    gap: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
  },
  enableButton: {
    marginBottom: spacing.md,
  },
  maybeLaterButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  maybeLaterText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
