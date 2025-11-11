import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigatorParamList } from '../types/onboarding';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { GoalSelectionScreen } from '../screens/onboarding/GoalSelectionScreen';
import { ReferralCodeScreen } from '../screens/onboarding/ReferralCodeScreen';
import { NotificationPermissionScreen } from '../screens/onboarding/NotificationPermissionScreen';
import { WelcomeCompletionScreen } from '../screens/onboarding/WelcomeCompletionScreen';

const Stack = createNativeStackNavigator<OnboardingNavigatorParamList>();

type OnboardingNavigatorProps = {
  onComplete: () => void;
};

export const OnboardingNavigator: React.FC<OnboardingNavigatorProps> = ({
  onComplete,
}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="ReferralCode" component={ReferralCodeScreen} />
      <Stack.Screen
        name="NotificationPermission"
        component={NotificationPermissionScreen}
      />
      <Stack.Screen name="WelcomeCompletion">
        {() => <WelcomeCompletionScreen onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
