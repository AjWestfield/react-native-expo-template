import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function AddScreen() {
  const addOptions = [
    { icon: 'camera', title: 'Take Photo', description: 'Capture a new photo', color: colors.text.primary },
    { icon: 'images', title: 'Choose from Gallery', description: 'Select from your photos', color: colors.accent.lightGray },
    { icon: 'videocam', title: 'Record Video', description: 'Create a new video', color: colors.status.error },
    { icon: 'document-text', title: 'Create Document', description: 'Start a new document', color: colors.status.success },
    { icon: 'link', title: 'Add Link', description: 'Share a link', color: colors.status.warning },
    { icon: 'musical-notes', title: 'Add Audio', description: 'Upload or record audio', color: '#ec4899' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New</Text>
        <Text style={styles.subtitle}>Choose what you'd like to create</Text>
      </View>

      <View style={styles.optionsContainer}>
        {addOptions.map((option, index) => (
          <TouchableOpacity key={index} style={styles.optionCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
              <Ionicons name={option.icon as any} size={32} color={option.color} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.quaternary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Uploads</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.recentCard}>
            <View style={styles.recentThumbnail}>
              <Ionicons name="image" size={20} color={colors.text.quaternary} />
            </View>
            <View style={styles.recentContent}>
              <Text style={styles.recentTitle}>Recent Item {item}</Text>
              <Text style={styles.recentDate}>2 days ago</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  optionsContainer: {
    padding: 24,
    paddingTop: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  recentSection: {
    padding: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  recentThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.glass.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
});
