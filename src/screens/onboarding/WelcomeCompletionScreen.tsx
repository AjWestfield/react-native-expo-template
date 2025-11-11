import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { GlassButton } from '../../components';
import { colors, typography, spacing } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

type WelcomeCompletionScreenProps = {
  onComplete: () => void;
};

export const WelcomeCompletionScreen: React.FC<WelcomeCompletionScreenProps> = ({
  onComplete,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon/Celebration */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={80} color={colors.text.primary} />
          </View>
        </View>

        {/* Message */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome aboard!</Text>
          <Text style={styles.subtitle}>
            You're all set up and ready to create amazing videos with AI. Let's
            make something incredible!
          </Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* CTA Button */}
        <View style={styles.buttonContainer}>
          <GlassButton
            title="Explore the app"
            onPress={onComplete}
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
    paddingTop: spacing.xxxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxxl,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.glass.backgroundMedium,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
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
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: spacing.xxxl,
  },
});
