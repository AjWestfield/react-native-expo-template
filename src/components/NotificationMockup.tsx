import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

export const NotificationMockup: React.FC = () => {
  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="light" style={styles.blur}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="videocam" size={24} color={colors.background.primary} />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.header}>
              <Text style={styles.appName}>Your App Name</Text>
              <Text style={styles.time}>now</Text>
            </View>
            <Text style={styles.title}>Your video is ready!</Text>
            <Text style={styles.message}>
              Your video generation is complete and ready to watch
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginVertical: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  blur: {
    padding: spacing.lg,
  },
  content: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 140, 0, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  appName: {
    ...typography.footnote,
    color: colors.background.primary,
    fontWeight: '600',
  },
  time: {
    ...typography.caption2,
    color: colors.background.secondary,
  },
  title: {
    ...typography.headline,
    color: colors.background.primary,
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.subheadline,
    color: colors.background.secondary,
  },
});
