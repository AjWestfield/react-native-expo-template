import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useFilming } from '../context/FilmingContext';

interface AddScreenProps {
  navigation: any;
}

export default function AddScreen({ navigation }: AddScreenProps) {
  const { selectedFilmingType, filmingTypes } = useFilming();

  const getSelectedFilmingTypeName = () => {
    if (!selectedFilmingType) return null;
    return filmingTypes.find(t => t.id === selectedFilmingType)?.name;
  };

  const addOptions = [
    {
      icon: 'film',
      title: 'Select Filming Type',
      description: selectedFilmingType
        ? `Current: ${getSelectedFilmingTypeName()}`
        : 'Choose your camera type',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('FilmingType'),
    },
    { icon: 'camera', title: 'Take Photo', description: 'Capture a new photo', color: colors.primary },
    { icon: 'images', title: 'Choose from Gallery', description: 'Select from your photos', color: colors.accent },
    { icon: 'videocam', title: 'Record Video', description: 'Create a new video', color: colors.error },
    { icon: 'document-text', title: 'Create Document', description: 'Start a new document', color: colors.success },
    { icon: 'link', title: 'Add Link', description: 'Share a link', color: colors.warning },
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
          <TouchableOpacity
            key={index}
            style={styles.optionCard}
            onPress={option.onPress || (() => {})}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
              <Ionicons name={option.icon as any} size={32} color={option.color} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.muted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Uploads</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.recentCard}>
            <View style={styles.recentThumbnail}>
              <Ionicons name="image" size={20} color={colors.text.muted} />
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.cardHover,
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
    color: colors.text.muted,
  },
});
