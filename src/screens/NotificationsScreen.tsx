import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function NotificationsScreen() {
  const notifications = [
    {
      id: 1,
      icon: 'heart',
      iconColor: colors.error,
      title: 'New like on your post',
      description: 'John Smith liked your recent post',
      time: '5m ago',
      unread: true,
    },
    {
      id: 2,
      icon: 'person-add',
      iconColor: colors.primary,
      title: 'New follower',
      description: 'Sarah Johnson started following you',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      icon: 'chatbubble',
      iconColor: colors.accent,
      title: 'New comment',
      description: 'Mike Davis commented on your post',
      time: '2h ago',
      unread: false,
    },
    {
      id: 4,
      icon: 'trophy',
      iconColor: colors.warning,
      title: 'Achievement unlocked',
      description: 'You reached 1000 followers!',
      time: '1d ago',
      unread: false,
    },
    {
      id: 5,
      icon: 'mail',
      iconColor: colors.success,
      title: 'New message',
      description: 'Emma Wilson sent you a message',
      time: '2d ago',
      unread: false,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              notification.unread && styles.notificationCardUnread,
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${notification.iconColor}20` }]}>
              <Ionicons name={notification.icon as any} size={24} color={notification.iconColor} />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationDescription}>{notification.description}</Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            {notification.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}

        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color={colors.text.muted} />
          <Text style={styles.emptyStateText}>You're all caught up!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationCardUnread: {
    borderColor: colors.primary + '40',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.text.muted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.text.muted,
    marginTop: 16,
  },
});
