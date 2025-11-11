import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from '../types/onboarding';

const STORAGE_KEYS = {
  ONBOARDING_DATA: '@onboarding_data',
};

export const storageService = {
  // Get onboarding data
  getOnboardingData: async (): Promise<OnboardingData | null> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting onboarding data:', error);
      return null;
    }
  },

  // Save onboarding data
  saveOnboardingData: async (data: OnboardingData): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ONBOARDING_DATA,
        JSON.stringify(data)
      );
      return true;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      return false;
    }
  },

  // Check if user has completed onboarding
  hasCompletedOnboarding: async (): Promise<boolean> => {
    try {
      const data = await storageService.getOnboardingData();
      return data?.hasCompletedOnboarding || false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  // Mark onboarding as complete
  completeOnboarding: async (
    selectedGoals: string[],
    referralCode?: string,
    notificationsEnabled: boolean = false
  ): Promise<boolean> => {
    const data: OnboardingData = {
      hasCompletedOnboarding: true,
      selectedGoals,
      referralCode,
      notificationsEnabled,
    };
    return await storageService.saveOnboardingData(data);
  },

  // Reset onboarding (for testing)
  resetOnboarding: async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_DATA);
      return true;
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      return false;
    }
  },
};
