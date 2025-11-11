import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SelectableGlassCard, GlassButton } from '../../components';
import { colors, typography, spacing } from '../../theme/colors';
import { OnboardingNavigatorParamList, GoalOption } from '../../types/onboarding';

type GoalSelectionScreenProps = {
  navigation: NativeStackNavigationProp<
    OnboardingNavigatorParamList,
    'GoalSelection'
  >;
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

export const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({
  navigation,
}) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    navigation.navigate('ReferralCode', { selectedGoals });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What do you want to create?</Text>
          <Text style={styles.subtitle}>
            Select your goals to personalize your experience
          </Text>
        </View>

        {/* Goal Options */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {GOAL_OPTIONS.map((goal) => (
            <SelectableGlassCard
              key={goal.id}
              title={goal.title}
              description={goal.description}
              icon={goal.icon}
              selected={selectedGoals.includes(goal.id)}
              onPress={() => toggleGoal(goal.id)}
            />
          ))}
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <GlassButton
            title="Continue"
            onPress={handleContinue}
            variant="glow"
            size="large"
            disabled={selectedGoals.length === 0}
          />
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
  },
  header: {
    paddingHorizontal: spacing.xl,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
});
