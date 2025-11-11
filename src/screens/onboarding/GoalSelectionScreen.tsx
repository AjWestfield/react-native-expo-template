import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SelectableGlassCard, GlassButton, OnboardingLayout } from '../../components';
import { colors, typography, spacing, borderRadius } from '../../theme/colors';
import { OnboardingNavigatorParamList, GoalOption } from '../../types/onboarding';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsiveSpacing, getResponsiveFontSize } from '../../utils/responsive';

type GoalSelectionScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingNavigatorParamList, 'GoalSelection'>;
};

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'viral',
    title: 'Create viral social media content',
    description: 'TikTok, Instagram, YouTube Shorts',
    icon: 'flash',
  },
  {
    id: 'marketing',
    title: 'Build marketing campaigns',
    description: 'Ads, product demos, brand videos',
    icon: 'trending-up',
  },
  {
    id: 'cinematic',
    title: 'Create cinematic scenes',
    description: 'Short films, dramatic scenes, storytelling',
    icon: 'film',
  },
  {
    id: 'educational',
    title: 'Produce educational videos',
    description: 'Tutorials, explainers, course content',
    icon: 'school',
  },
  {
    id: 'personal',
    title: 'Work on personal projects',
    description: 'Creative expression, hobby videos',
    icon: 'heart',
  },
  {
    id: 'business',
    title: 'Grow my business',
    description: 'Brand awareness, lead generation',
    icon: 'rocket',
  },
  {
    id: 'no-disclosure',
    title: 'No disclosure',
    description: 'I prefer not to say',
    icon: 'eye-off',
  },
];

export const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({ navigation }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const responsive = useResponsive();
  const responsiveSpacing = getResponsiveSpacing(responsive);
  const isDesktop = responsive.isDesktop || responsive.isLargeDesktop;

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    navigation.navigate('ReferralCode', { selectedGoals });
  };

  return (
    <OnboardingLayout
      contentWidth={isDesktop ? 'medium' : 'small'}
      style={[styles.panel, { padding: responsiveSpacing.vertical }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: getResponsiveFontSize(30, responsive) }]}>
          What do you want to create?
        </Text>
        <Text style={[styles.subtitle, { fontSize: getResponsiveFontSize(16, responsive) }]}>
          Select your goals to personalize your experience
        </Text>
      </View>

      <View style={[styles.goalGrid, isDesktop && styles.goalGridDesktop]}>
        {GOAL_OPTIONS.map((goal) => (
          <View
            key={goal.id}
            style={[styles.goalCardWrapper, isDesktop && styles.goalCardWrapperDesktop]}
          >
            <SelectableGlassCard
              title={goal.title}
              description={goal.description}
              icon={goal.icon}
              selected={selectedGoals.includes(goal.id)}
              onPress={() => toggleGoal(goal.id)}
            />
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <GlassButton
          title="Continue"
          onPress={handleContinue}
          variant="glow"
          size="large"
          disabled={selectedGoals.length === 0}
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
  goalGrid: {
    width: '100%',
    gap: spacing.md,
  },
  goalGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  goalCardWrapper: {
    width: '100%',
  },
  goalCardWrapperDesktop: {
    width: '50%',
    paddingHorizontal: spacing.sm,
  },
  buttonContainer: {
    width: '100%',
  },
});
