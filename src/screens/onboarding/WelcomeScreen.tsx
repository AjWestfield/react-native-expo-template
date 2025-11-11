import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassButton } from '../../components';
import { colors, typography, spacing } from '../../theme/colors';
import { OnboardingNavigatorParamList } from '../../types/onboarding';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingNavigatorParamList, 'Welcome'>;
};

const { height } = Dimensions.get('window');

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Image/Visual */}
        <View style={styles.heroContainer}>
          <View style={styles.imagePlaceholder}>
            {/* TODO: Replace with actual hero image/illustration */}
            <Text style={styles.placeholderText}>🎬</Text>
          </View>
        </View>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>AI-Powered Video Creation</Text>
          <Text style={styles.subtitle}>
            Create engaging video content optimized for maximum reach with the
            power of AI
          </Text>
        </View>

        {/* CTA Button */}
        <View style={styles.buttonContainer}>
          <GlassButton
            title="Get Started"
            onPress={() => navigation.navigate('GoalSelection')}
            variant="glow"
            size="large"
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
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: spacing.xxxl,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  imagePlaceholder: {
    width: height * 0.4,
    height: height * 0.4,
    borderRadius: 20,
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
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
});
