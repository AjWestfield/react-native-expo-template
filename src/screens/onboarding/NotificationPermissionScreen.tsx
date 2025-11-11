import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { GlassButton, BenefitItem, NotificationMockup } from '../../components';
import { colors, typography, spacing } from '../../theme/colors';
import { OnboardingNavigatorParamList } from '../../types/onboarding';
import { storageService } from '../../utils/storage';

type NotificationPermissionScreenProps = {
  navigation: NativeStackNavigationProp<
    OnboardingNavigatorParamList,
    'NotificationPermission'
  >;
  route: RouteProp<OnboardingNavigatorParamList, 'NotificationPermission'>;
};

export const NotificationPermissionScreen: React.FC<
  NotificationPermissionScreenProps
> = ({ navigation, route }) => {
  const { selectedGoals, referralCode } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    // TODO: Request actual notification permissions using Expo Notifications
    // For now, we'll simulate the request
    try {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Save onboarding data with notifications enabled
      await storageService.completeOnboarding(
        selectedGoals,
        referralCode,
        true
      );

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
      // Save onboarding data without notifications
      await storageService.completeOnboarding(
        selectedGoals,
        referralCode,
        false
      );

      navigation.navigate('WelcomeCompletion');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Get Notified</Text>
          <Text style={styles.subtitle}>
            We'll notify you when your videos finish generating
          </Text>
        </View>

        {/* Notification Mockup */}
        <NotificationMockup />

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <BenefitItem text="Instant alerts when videos complete" />
          <BenefitItem text="Never miss a finished generation" />
          <BenefitItem text="Watch your videos as soon as they're done" />
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <GlassButton
            title="Enable Notifications"
            onPress={handleEnableNotifications}
            variant="glow"
            size="large"
            loading={isLoading}
            style={styles.enableButton}
          />

          <TouchableOpacity
            onPress={handleMaybeLater}
            style={styles.maybeLaterButton}
            disabled={isLoading}
          >
            <Text style={styles.maybeLaterText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.title2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  benefitsContainer: {
    marginTop: spacing.xl,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: spacing.xxxl,
  },
  enableButton: {
    marginBottom: spacing.lg,
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
