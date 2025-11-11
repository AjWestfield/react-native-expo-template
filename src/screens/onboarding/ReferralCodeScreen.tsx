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
import { GlassButton, GlassInput } from '../../components';
import { colors, typography, spacing } from '../../theme/colors';
import { OnboardingNavigatorParamList } from '../../types/onboarding';

type ReferralCodeScreenProps = {
  navigation: NativeStackNavigationProp<
    OnboardingNavigatorParamList,
    'ReferralCode'
  >;
  route: RouteProp<OnboardingNavigatorParamList, 'ReferralCode'>;
};

export const ReferralCodeScreen: React.FC<ReferralCodeScreenProps> = ({
  navigation,
  route,
}) => {
  const { selectedGoals } = route.params;
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');

  const handleApply = () => {
    // Simple validation - you can add your own logic here
    if (referralCode.trim().length > 0 && referralCode.trim().length < 4) {
      setError('Referral code must be at least 4 characters');
      return;
    }

    navigation.navigate('NotificationPermission', {
      selectedGoals,
      referralCode: referralCode.trim() || undefined,
    });
  };

  const handleSkip = () => {
    navigation.navigate('NotificationPermission', {
      selectedGoals,
      referralCode: undefined,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Referral Code</Text>
          <Text style={styles.subtitle}>
            Have a referral code? Enter it below or continue to skip
          </Text>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <GlassInput
            label="Enter referral code"
            value={referralCode}
            onChangeText={(text) => {
              setReferralCode(text);
              setError('');
            }}
            error={error}
            placeholder="Enter code"
            autoCapitalize="characters"
          />
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <GlassButton
            title="Apply"
            onPress={handleApply}
            variant="primary"
            size="large"
            disabled={referralCode.trim().length === 0}
            style={styles.applyButton}
          />

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
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
    paddingBottom: spacing.lg,
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
  inputContainer: {
    marginTop: spacing.xl,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: spacing.xxxl,
  },
  applyButton: {
    marginBottom: spacing.lg,
  },
  skipButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
