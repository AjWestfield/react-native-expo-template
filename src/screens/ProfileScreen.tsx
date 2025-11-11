import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const settingsItems = [
    {
      icon: 'card-outline',
      title: 'Billing & Subscription',
      subtitle: 'Manage your plan and payments',
      value: null,
      action: 'billing',
    },
    {
      icon: 'videocam-outline',
      title: 'Video Quality',
      subtitle: 'Set default video quality',
      value: 'HD',
    },
    {
      icon: 'color-palette-outline',
      title: 'Default Style',
      subtitle: 'Choose your preferred style',
      value: 'Cinematic',
    },
    {
      icon: 'film-outline',
      title: 'Export Settings',
      subtitle: 'Configure video exports',
      value: 'MP4',
    },
    {
      icon: 'settings-outline',
      title: 'Advanced',
      subtitle: 'Advanced generation settings',
      value: null,
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and tutorials',
      value: null,
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      subtitle: 'App information',
      value: null,
    },
  ];

  const handleSettingPress = (title: string, action?: string) => {
    if (action === 'billing') {
      navigation.navigate('Billing' as never);
    } else {
      Alert.alert(title, 'This setting would open in a full app');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.section}>
          <GlassCard style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.avatar}
              >
                <Ionicons name="person" size={40} color={colors.text.primary} />
              </LinearGradient>
            </View>
            <Text style={styles.userName}>Creative Studio</Text>
            <Text style={styles.userEmail}>studio@example.com</Text>
          </GlassCard>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <Ionicons
                name="videocam"
                size={24}
                color={colors.text.primary}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Videos Created</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Ionicons
                name="time"
                size={24}
                color={colors.text.primary}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>5:32</Text>
              <Text style={styles.statLabel}>Total Duration</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Ionicons
                name="heart"
                size={24}
                color={colors.text.primary}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </GlassCard>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={() => handleSettingPress(item.title, item.action)}
            >
              <GlassCard style={styles.settingCard}>
                <View style={styles.settingIcon}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={colors.text.primary}
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.settingRight}>
                  {item.value && (
                    <Text style={styles.settingValue}>{item.value}</Text>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text.tertiary}
                  />
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Version */}
        <Text style={styles.version}>AI Video Generator v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    // paddingBottom is set dynamically with safe area insets
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.hero,
    color: colors.text.primary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  userCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    ...typography.title1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.subheadline,
    color: colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.title2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  settingItem: {
    marginBottom: spacing.sm,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.headline,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingValue: {
    ...typography.subheadline,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  version: {
    ...typography.caption1,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
