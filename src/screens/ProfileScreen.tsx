import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GlassCard } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { signOut, getToken } = useAuth();
  const navigation = useNavigation();
  const [credits, setCredits] = useState<number>(0);
  const [loadingCredits, setLoadingCredits] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchCredits();
    }, [])
  );

  const fetchCredits = async () => {
    try {
      setLoadingCredits(true);
      const token = await getToken();
      if (!token) {
        console.error('No auth token available');
        return;
      }

      const response = await fetch(`${API_URL}/api/credits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits || 0);
      } else {
        console.error('Failed to fetch credits');
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoadingCredits(false);
    }
  };

  const handleBuyCredits = () => {
    navigation.navigate('Pricing' as never);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'This would open edit profile screen');
  };

  const handleShare = () => {
    Alert.alert('Share', 'This would open share options');
  };

  const handleMyVideos = () => {
    navigation.navigate('Gallery' as never);
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'This would open settings screen');
  };

  const handleHelp = () => {
    Alert.alert('Help & Support', 'This would open help screen');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'This would open privacy settings');
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
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar with Badge */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.avatar}
            >
              <Ionicons name="person" size={60} color={colors.text.primary} />
            </LinearGradient>
            <View style={styles.verificationBadge}>
              <Ionicons name="checkmark" size={16} color="#000000" />
            </View>
          </View>

          {/* User Info */}
          <Text style={styles.userName}>
            {user?.fullName || user?.firstName || 'User'}
          </Text>
          <Text style={styles.username}>
            @{user?.username || 'username'}
          </Text>
          <Text style={styles.joinedDate}>
            Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={20} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Credits Card */}
        <View style={styles.section}>
          <GlassCard style={styles.creditsCard}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.creditsGradient}
            >
              <View style={styles.creditsHeader}>
                <Ionicons name="diamond" size={32} color="#FFFFFF" />
                <Text style={styles.creditsTitle}>Your Credits</Text>
              </View>

              {loadingCredits ? (
                <ActivityIndicator size="large" color="#FFFFFF" style={styles.creditsLoader} />
              ) : (
                <View style={styles.creditsContent}>
                  <Text style={styles.creditsAmount}>{credits.toLocaleString()}</Text>
                  <Text style={styles.creditsLabel}>Available Credits</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.buyCreditsButton}
                onPress={handleBuyCredits}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.buyCreditsText}>Buy More Credits</Text>
              </TouchableOpacity>
            </LinearGradient>
          </GlassCard>
        </View>

        {/* My Videos Section */}
        <View style={styles.section}>
          <GlassCard style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleMyVideos}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="videocam" size={24} color={colors.text.primary} />
              </View>
              <Text style={styles.menuText}>My Videos</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <GlassCard style={styles.menuCard}>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={handleSettings}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
              </View>
              <Text style={styles.menuText}>Settings</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={handleHelp}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="help-circle-outline" size={24} color={colors.text.primary} />
              </View>
              <Text style={styles.menuText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePrivacy}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="shield-outline" size={24} color={colors.text.primary} />
              </View>
              <Text style={styles.menuText}>Privacy</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Sign Out Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00FF00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  joinedDate: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
  },
  creditsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  creditsGradient: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  creditsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  creditsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  creditsContent: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  creditsAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  creditsLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  creditsLoader: {
    marginVertical: spacing.xl,
  },
  buyCreditsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  buyCreditsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
