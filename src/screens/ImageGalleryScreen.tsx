import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassPill, ImageCard } from '../components';
import { colors, typography, spacing } from '../theme/colors';
import { GeneratedImage } from '../types/image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterType = 'all' | 'today' | 'week' | 'favorites';

// Mock data for demonstration
const mockImages: GeneratedImage[] = [
  {
    id: '1',
    prompt: 'A serene mountain landscape at golden hour',
    style: 'photorealistic',
    templateType: 'drone',
    aspectRatio: '16:9',
    quality: 'hd',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    thumbnailGradient: ['rgba(14, 165, 233, 0.5)', 'rgba(6, 182, 212, 0.5)'],
    isFavorite: true,
  },
  {
    id: '2',
    prompt: 'Person delivering a package to a front door',
    style: 'photorealistic',
    templateType: 'ring-camera',
    aspectRatio: '16:9',
    quality: 'ultra-hd',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    thumbnailGradient: ['rgba(59, 130, 246, 0.5)', 'rgba(147, 51, 234, 0.5)'],
    isFavorite: false,
  },
  {
    id: '3',
    prompt: 'Friends laughing at a coffee shop',
    style: 'artistic',
    templateType: 'smartphone',
    aspectRatio: '9:16',
    quality: 'hd',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    thumbnailGradient: ['rgba(34, 197, 94, 0.5)', 'rgba(59, 130, 246, 0.5)'],
    isFavorite: true,
  },
  {
    id: '4',
    prompt: 'Busy parking lot surveillance view',
    style: 'sketch',
    templateType: 'security-camera',
    aspectRatio: '16:9',
    quality: 'standard',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    thumbnailGradient: ['rgba(239, 68, 68, 0.5)', 'rgba(251, 146, 60, 0.5)'],
    isFavorite: false,
  },
  {
    id: '5',
    prompt: 'Coastal highway drive at sunset',
    style: 'oil-painting',
    templateType: 'dashcam',
    aspectRatio: '16:9',
    quality: 'hd',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    thumbnailGradient: ['rgba(245, 158, 11, 0.5)', 'rgba(239, 68, 68, 0.5)'],
    isFavorite: false,
  },
  {
    id: '6',
    prompt: 'Police patrol on city streets',
    style: 'photorealistic',
    templateType: 'body-cam',
    aspectRatio: '16:9',
    quality: 'hd',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
    thumbnailGradient: ['rgba(168, 85, 247, 0.5)', 'rgba(236, 72, 153, 0.5)'],
    isFavorite: true,
  },
];

export default function ImageGalleryScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [images, setImages] = useState<GeneratedImage[]>(mockImages);

  const getFilteredImages = () => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return images.filter((img) => {
          const diff = now.getTime() - img.createdAt.getTime();
          return diff < 24 * 60 * 60 * 1000; // Last 24 hours
        });
      case 'week':
        return images.filter((img) => {
          const diff = now.getTime() - img.createdAt.getTime();
          return diff < 7 * 24 * 60 * 60 * 1000; // Last 7 days
        });
      case 'favorites':
        return images.filter((img) => img.isFavorite);
      default:
        return images;
    }
  };

  const handleImagePress = (image: GeneratedImage) => {
    console.log('Image pressed:', image.id);
    // TODO: Navigate to image detail screen
  };

  const handleFavoriteToggle = (image: GeneratedImage) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === image.id ? { ...img, isFavorite: !img.isFavorite } : img
      )
    );
  };

  const filteredImages = getFilteredImages();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <View>
          <Text style={styles.title}>Image Gallery</Text>
          <Text style={styles.subtitle}>{filteredImages.length} images</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="options" size={24} color={colors.text.white} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        >
          <GlassPill
            title="All"
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <GlassPill
            title="Today"
            active={filter === 'today'}
            onPress={() => setFilter('today')}
          />
          <GlassPill
            title="This Week"
            active={filter === 'week'}
            onPress={() => setFilter('week')}
          />
          <GlassPill
            title="Favorites"
            active={filter === 'favorites'}
            onPress={() => setFilter('favorites')}
          />
        </ScrollView>
      </View>

      {/* Images Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + Math.max(insets.bottom, 10) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredImages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={colors.text.medium} />
            <Text style={styles.emptyTitle}>No images found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'favorites'
                ? 'No favorite images yet'
                : 'Generate your first image to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onPress={handleImagePress}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.title1,
    color: colors.text.white,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.medium,
    marginTop: spacing.xs,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filters: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filtersList: {
    gap: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.title3,
    color: colors.text.white,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.medium,
    textAlign: 'center',
    maxWidth: 250,
  },
});
