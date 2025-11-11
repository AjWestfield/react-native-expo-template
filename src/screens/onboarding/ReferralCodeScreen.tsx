import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { GlassButton, GlassInput, OnboardingLayout } from '../../components';
import { colors, typography, spacing, borderRadius } from '../../theme/colors';
import { OnboardingNavigatorParamList } from '../../types/onboarding';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsiveSpacing, getResponsiveFontSize } from '../../utils/responsive';

type ReferralCodeScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingNavigatorParamList, 'ReferralCode'>;
  route: RouteProp<OnboardingNavigatorParamList, 'ReferralCode'>;
};

export const ReferralCodeScreen: React.FC<ReferralCodeScreenProps> = ({
  navigation,
  route,
}) => {
  const { selectedGoals } = route.params;
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const responsive = useResponsive();
  const responsiveSpacing = getResponsiveSpacing(responsive);

  const handleApply = () => {
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
    <OnboardingLayout
      contentWidth="small"
      style={[styles.panel, { padding: responsiveSpacing.vertical }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: getResponsiveFontSize(28, responsive) }]}>
          Referral Code
        </Text>
        <Text style={[styles.subtitle, { fontSize: getResponsiveFontSize(16, responsive) }]}>
          Have a referral code? Enter it below or continue to skip
        </Text>
      </View>

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

      <View style={styles.spacer} />

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
    minHeight: 420,
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
  inputContainer: {
    marginTop: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
  },
  applyButton: {
    marginBottom: spacing.md,
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
