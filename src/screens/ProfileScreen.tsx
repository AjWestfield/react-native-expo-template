import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme/colors';
import { useResponsive } from '../hooks/useResponsive';
import {
  createCenteredContainer,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getHeaderButtonSize,
  getIconSize,
} from '../utils/responsive';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const responsive = useResponsive();
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigation = useNavigation();

  // Responsive centered container style
  const responsiveSpacing = getResponsiveSpacing(responsive);
  const containerStyle = createCenteredContainer(
    responsive.isDesktop || responsive.isLargeDesktop ? 'medium' : 'small',
    responsive
  );
  const headerButtonSize = getHeaderButtonSize(responsive);
  const headerIconSize = getIconSize(24, responsive);
  const actionIconSize = getIconSize(20, responsive);
  const menuIconSize = getIconSize(24, responsive);
  const titleFontSize = getResponsiveFontSize(20, responsive);
  const nameFontSize = getResponsiveFontSize(28, responsive);
  const usernameFontSize = getResponsiveFontSize(16, responsive);
  const captionFontSize = getResponsiveFontSize(14, responsive);

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
    navigation.navigate('Gallery');
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
            paddingTop: insets.top + responsiveSpacing.vertical,
            paddingBottom:
              insets.bottom + (responsive.shouldUseSidebar ? responsiveSpacing.vertical : 100),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={containerStyle}>
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                marginBottom: responsiveSpacing.gap,
                justifyContent: responsive.shouldUseSidebar ? 'flex-start' : 'space-between',
              },
            ]}
          >
            {!responsive.shouldUseSidebar && (
              <TouchableOpacity
                style={[
                  styles.headerButton,
                  {
                    width: headerButtonSize,
                    height: headerButtonSize,
                    borderRadius: headerButtonSize / 2,
                  },
                ]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={headerIconSize} color={colors.text.primary} />
              </TouchableOpacity>
            )}
            <Text
              style={[
                styles.headerTitle,
                {
                  fontSize: titleFontSize,
                  textAlign: responsive.shouldUseSidebar ? 'left' : 'center',
                  flex: responsive.shouldUseSidebar ? undefined : 1,
                },
              ]}
            >
              Profile
            </Text>
            {!responsive.shouldUseSidebar && (
              <TouchableOpacity
                style={[
                  styles.headerButton,
                  {
                    width: headerButtonSize,
                    height: headerButtonSize,
                    borderRadius: headerButtonSize / 2,
                  },
                ]}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={headerIconSize}
                  color={colors.text.primary}
                />
              </TouchableOpacity>
            )}
          </View>

        {/* Profile Section */}
        <View
          style={[
            styles.profileSection,
            {
              marginBottom: responsiveSpacing.gap,
              alignItems:
                responsive.isDesktop || responsive.isLargeDesktop ? 'flex-start' : 'center',
            },
          ]}
        >
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
          <Text
            style={[
              styles.userName,
              {
                fontSize: nameFontSize,
                textAlign: responsive.isDesktop || responsive.isLargeDesktop ? 'left' : 'center',
              },
            ]}
          >
            {user?.fullName || user?.firstName || 'User'}
          </Text>
          <Text
            style={[
              styles.username,
              {
                fontSize: usernameFontSize,
                textAlign: responsive.isDesktop || responsive.isLargeDesktop ? 'left' : 'center',
              },
            ]}
          >
            @{user?.username || 'username'}
          </Text>
          <Text
            style={[
              styles.joinedDate,
              {
                fontSize: captionFontSize,
                textAlign: responsive.isDesktop || responsive.isLargeDesktop ? 'left' : 'center',
              },
            ]}
          >
            Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Action Buttons */}
        <View
          style={[
            styles.actionButtons,
            { marginBottom: responsiveSpacing.gap, gap: responsiveSpacing.gap },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={actionIconSize} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={actionIconSize} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* My Videos Section */}
        <View style={[styles.section, { marginBottom: responsiveSpacing.gap }]}>
          <GlassCard style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleMyVideos}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="videocam" size={menuIconSize} color={colors.text.primary} />
              </View>
              <Text style={styles.menuText}>My Videos</Text>
              <Ionicons name="chevron-forward" size={menuIconSize} color={colors.text.tertiary} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Settings Section */}
        <View style={[styles.section, { marginBottom: responsiveSpacing.gap }]}>
          <GlassCard style={styles.menuCard}>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={handleSettings}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="settings-outline" size={menuIconSize} color={colors.text.primary} />
              </View>
              <Text style={styles.menuText}>Settings</Text>
              <Ionicons name="chevron-forward" size={menuIconSize} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={handleHelp}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons
                  name="help-circle-outline"
                  size={menuIconSize}
                  color={colors.text.primary}
                />
              </View>
              <Text style={styles.menuText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={menuIconSize} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePrivacy}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="shield-outline" size={menuIconSize} color={colors.text.primary} />
              </View>
              <Text style={styles.menuText}>Privacy</Text>
              <Ionicons name="chevron-forward" size={menuIconSize} color={colors.text.tertiary} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Sign Out Button */}
        <View style={[styles.section, { marginBottom: responsiveSpacing.vertical }]}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={actionIconSize} color="#FF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    alignItems: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
    width: '100%',
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
    width: '100%',
    gap: spacing.md,
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
    width: '100%',
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
});
