import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoCard } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme/colors';
import { GeneratedVideo } from '../types/video';

type FilterType = 'all' | 'today' | 'week' | 'favorites';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'favorites', label: 'Favorites' },
];

// Mock video data
const MOCK_VIDEOS: GeneratedVideo[] = [
  {
    id: '1',
    prompt: 'A cinematic drone shot of a futuristic city at sunset',
    style: 'cinematic',
    duration: 10,
    aspectRatio: '16:9',
    fps: 30,
    createdAt: new Date('2025-11-11'),
    thumbnailGradient: ['#FF6B6B', '#4ECDC4'],
    isFavorite: true,
  },
  {
    id: '2',
    prompt: 'Anime style magical girl transformation sequence',
    style: 'anime',
    duration: 15,
    aspectRatio: '9:16',
    fps: 24,
    createdAt: new Date('2025-11-10'),
    thumbnailGradient: ['#A8E6CF', '#FFD3B6'],
    isFavorite: false,
  },
  {
    id: '3',
    prompt: 'Realistic ocean waves crashing on a beach',
    style: 'realistic',
    duration: 20,
    aspectRatio: '16:9',
    fps: 60,
    createdAt: new Date('2025-11-09'),
    thumbnailGradient: ['#667EEA', '#764BA2'],
    isFavorite: true,
  },
  {
    id: '4',
    prompt: 'Abstract flowing particles in vibrant colors',
    style: 'abstract',
    duration: 30,
    aspectRatio: '1:1',
    fps: 30,
    createdAt: new Date('2025-11-08'),
    thumbnailGradient: ['#F093FB', '#F5576C'],
    isFavorite: false,
  },
  {
    id: '5',
    prompt: 'Cinematic slow motion of coffee being poured',
    style: 'cinematic',
    duration: 8,
    aspectRatio: '16:9',
    fps: 60,
    createdAt: new Date('2025-11-07'),
    thumbnailGradient: ['#4FACFE', '#00F2FE'],
    isFavorite: false,
  },
  {
    id: '6',
    prompt: 'Realistic time-lapse of a flower blooming',
    style: 'realistic',
    duration: 12,
    aspectRatio: '4:3',
    fps: 30,
    createdAt: new Date('2025-11-06'),
    thumbnailGradient: ['#43E97B', '#38F9D7'],
    isFavorite: true,
  },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [videos, setVideos] = useState<GeneratedVideo[]>(MOCK_VIDEOS);

  const handleVideoPress = (video: GeneratedVideo) => {
    Alert.alert('Video Preview', `Playing: ${video.prompt}`);
  };

  const handleFavoriteToggle = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, isFavorite: !v.isFavorite } : v
      )
    );
  };

  const filteredVideos = videos.filter((video) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const videoDate = new Date(video.createdAt);
    videoDate.setHours(0, 0, 0, 0);

    switch (selectedFilter) {
      case 'today':
        return videoDate.getTime() === today.getTime();
      case 'week':
        return videoDate >= weekAgo;
      case 'favorites':
        return video.isFavorite;
      default:
        return true;
    }
  });

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
          <Text style={styles.headerTitle}>Gallery</Text>
          <Text style={styles.headerSubtitle}>
            {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.value && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.value && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <View style={styles.grid}>
            {filteredVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                onPress={() => handleVideoPress(video)}
                onFavorite={() => handleFavoriteToggle(video.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="videocam-off-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No videos found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'favorites'
                ? 'Favorite videos to see them here'
                : 'Generate your first video to get started'}
            </Text>
          </View>
        )}
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
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.subheadline,
    color: colors.text.secondary,
  },
  filtersContainer: {
    marginBottom: spacing.lg,
  },
  filtersScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.glass.backgroundLight,
    borderColor: colors.glass.borderLight,
  },
  filterText: {
    ...typography.subheadline,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.title2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
