import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.greeting}>Welcome Back</Text>
        <Text style={styles.username}>John Doe</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trending-up" size={24} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>2,456</Text>
          <Text style={styles.statLabel}>Total Views</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="heart" size={24} color={colors.accent} />
          </View>
          <Text style={styles.statValue}>1,234</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#6366f120' }]}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Create</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#8b5cf620' }]}>
              <Ionicons name="images-outline" size={24} color={colors.accent} />
            </View>
            <Text style={styles.actionText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="share-social-outline" size={24} color={colors.success} />
            </View>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="settings-outline" size={24} color={colors.warning} />
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {[1, 2, 3].map((item) => (
          <TouchableOpacity key={item} style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="document-text-outline" size={24} color={colors.text.secondary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Activity Item {item}</Text>
              <Text style={styles.activityDescription}>
                This is a description of the activity that happened
              </Text>
              <Text style={styles.activityTime}>{item}h ago</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    padding: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  username: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    width: (width - 48 - 16) / 2,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: colors.text.muted,
  },
});
