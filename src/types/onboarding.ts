export type GoalOption = {
  id: string;
  title: string;
  description: string;
  icon: string; // Ionicon name
};

export type OnboardingData = {
  hasCompletedOnboarding: boolean;
  selectedGoals: string[];
  referralCode?: string;
  notificationsEnabled: boolean;
};

export type OnboardingNavigatorParamList = {
  Welcome: undefined;
  GoalSelection: undefined;
  ReferralCode: { selectedGoals: string[] };
  NotificationPermission: { selectedGoals: string[]; referralCode?: string };
  WelcomeCompletion: undefined;
};
