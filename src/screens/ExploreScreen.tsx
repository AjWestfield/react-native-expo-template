import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Dimensions,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { VideoCard, GlassPill } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme/colors';
import { GeneratedVideo } from '../types/video';
import {
  useGalleryVideos,
  toggleGalleryFavorite,
  updateGalleryVideo,
  removeGalleryVideo,
} from '../hooks/useGalleryStore';
import { useResponsive } from '../hooks/useResponsive';
import { useSupabase } from '../hooks/useSupabase';
import { StorageService } from '../services/storageService';
import { VideoService } from '../services/videoService';
import {
  getGridColumns,
  getResponsiveSpacing,
  createResponsiveTextStyle,
} from '../utils/responsive';
import { CONTENT_MAX_WIDTHS, RESPONSIVE_SPACING } from '../constants/responsive';
import * as VideoThumbnails from 'expo-video-thumbnails';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    aspectRatio: '9:16',
    fps: 30,
    createdAt: new Date('2025-11-11').toISOString(),
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
    createdAt: new Date('2025-11-10').toISOString(),
    thumbnailGradient: ['#A8E6CF', '#FFD3B6'],
    isFavorite: false,
  },
  {
    id: '3',
    prompt: 'Realistic ocean waves crashing on a beach',
    style: 'realistic',
    duration: 20,
    aspectRatio: '9:16',
    fps: 60,
    createdAt: new Date('2025-11-09').toISOString(),
    thumbnailGradient: ['#667EEA', '#764BA2'],
    isFavorite: true,
  },
  {
    id: '4',
    prompt: 'Abstract flowing particles in vibrant colors',
    style: 'abstract',
    duration: 30,
    aspectRatio: '9:16',
    fps: 30,
    createdAt: new Date('2025-11-08').toISOString(),
    thumbnailGradient: ['#F093FB', '#F5576C'],
    isFavorite: false,
  },
  {
    id: '5',
    prompt: 'Cinematic slow motion of coffee being poured',
    style: 'cinematic',
    duration: 8,
    aspectRatio: '9:16',
    fps: 60,
    createdAt: new Date('2025-11-07').toISOString(),
    thumbnailGradient: ['#4FACFE', '#00F2FE'],
    isFavorite: false,
  },
  {
    id: '6',
    prompt: 'Realistic time-lapse of a flower blooming',
    style: 'realistic',
    duration: 12,
    aspectRatio: '9:16',
    fps: 30,
    createdAt: new Date('2025-11-06').toISOString(),
    thumbnailGradient: ['#43E97B', '#38F9D7'],
    isFavorite: true,
  },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const responsive = useResponsive();
  const { client } = useSupabase();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [mockVideos, setMockVideos] = useState<GeneratedVideo[]>(MOCK_VIDEOS);
  const { videos: storedVideos } = useGalleryVideos();
  const hasUserVideos = storedVideos.length > 0;
  const activeVideos = hasUserVideos ? storedVideos : mockVideos;
  const thumbnailJobsRef = useRef<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [listViewportHeight, setListViewportHeight] = useState(0);
  const [measuredCardHeight, setMeasuredCardHeight] = useState(0);
  const tabBarOffset = responsive.shouldUseSidebar ? 0 : 80 + insets.bottom;
  const responsiveSpacing = getResponsiveSpacing(responsive) ?? RESPONSIVE_SPACING.mobile;
  const singleColumnCardHeight = useMemo(() => {
    if (listViewportHeight <= 0) {
      return 0;
    }
    const clearance = responsiveSpacing.gap + spacing.lg;
    const availableHeight = Math.max(listViewportHeight - tabBarOffset - clearance, 0);
    return Math.max(availableHeight, measuredCardHeight);
  }, [listViewportHeight, tabBarOffset, measuredCardHeight, responsiveSpacing.gap]);
  const singleColumnScale = useMemo(() => {
    if (measuredCardHeight === 0 || singleColumnCardHeight === 0 || measuredCardHeight <= singleColumnCardHeight) {
      return 1;
    }
    const ratio = singleColumnCardHeight / measuredCardHeight;
    return Math.max(0.85, Math.min(1, ratio));
  }, [measuredCardHeight, singleColumnCardHeight]);

  // Get responsive grid columns and spacing
  const numColumns = getGridColumns('explore', responsive);
  const isMultiColumn = numColumns > 1;

  // Responsive typography
  const headerTitleStyle = createResponsiveTextStyle(36, responsive, {
    fontWeight: 'bold',
    color: colors.text.primary,
  });
  const headerSubtitleStyle = createResponsiveTextStyle(16, responsive, {
    color: colors.text.secondary,
  });

  const handleVideoPress = (video: GeneratedVideo) => {
    if (hasUserVideos && video.videoUrl) {
      navigation.navigate('Generate', {
        screen: 'VideoPreview',
        params: {
          videoUrl: video.videoUrl,
          prompt: video.prompt,
          model: video.style,
          aspectRatio: video.aspectRatio === '9:16' ? 'vertical' : 'horizontal',
          shouldAutoPlay: true,
        },
      });
      return;
    }

    Alert.alert('Video Preview', `Playing: ${video.prompt}`);
  };

  const handleFavoriteToggle = (videoId: string) => {
    if (hasUserVideos) {
      toggleGalleryFavorite(videoId);
      return;
    }

    setMockVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, isFavorite: !v.isFavorite } : v
      )
    );
  };

  const filteredVideos = activeVideos.filter((video) => {
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

  const addDeletingId = (id: string) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const removeDeletingId =
    (id: string) => {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

  const isDeletingVideo = (id: string) => deletingIds.has(id);

  useEffect(() => {
    if (!hasUserVideos) {
      return;
    }

    let isMounted = true;

    storedVideos.forEach((video) => {
      const videoUrl = video.videoUrl;
      if (!videoUrl || video.thumbnailUri || thumbnailJobsRef.current.has(video.id)) {
        return;
      }

      thumbnailJobsRef.current.add(video.id);

      (async () => {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
            time: 1000,
            quality: 0.6,
          });

          if (isMounted && uri) {
            await updateGalleryVideo(video.id, { thumbnailUri: uri });
          }
        } catch (error) {
          console.warn('Failed to generate gallery thumbnail:', error);
        } finally {
          thumbnailJobsRef.current.delete(video.id);
        }
      })();
    });

    return () => {
      isMounted = false;
    };
  }, [storedVideos, hasUserVideos]);

  const deleteLocalMockVideo = (videoId: string) => {
    setMockVideos((prev) => prev.filter((video) => video.id !== videoId));
  };

  const performDelete = async (
    video: GeneratedVideo,
    options?: { silent?: boolean },
  ): Promise<boolean> => {
    const silent = options?.silent ?? false;
    let skippedRemoteDeletion = false;

    if (!hasUserVideos) {
      deleteLocalMockVideo(video.id);
      return false;
    }

    if (!silent) {
      addDeletingId(video.id);
    }

    try {
      if (client && (video.storagePath || video.supabaseVideoId)) {
        const storageService = new StorageService(client);
        const videoService = new VideoService(client);

        if (video.storagePath) {
          await storageService.deleteVideo(video.storagePath);
        }

        if (video.supabaseVideoId) {
          await videoService.deleteVideo(video.supabaseVideoId);
        }
      }

      if (!client && (video.storagePath || video.supabaseVideoId)) {
        skippedRemoteDeletion = true;
        if (!silent) {
          Alert.alert(
            'Offline Mode',
            'Could not reach Supabase. The video was removed from this device, but remote copies may remain.',
          );
        }
      }

      await removeGalleryVideo(video.id);
      thumbnailJobsRef.current.delete(video.id);
      return skippedRemoteDeletion;
    } catch (error) {
      console.error('Delete video error:', error);
      if (!silent) {
        Alert.alert('Delete Failed', 'We could not delete this video. Please try again.');
      }
      throw error;
    } finally {
      if (!silent) {
        removeDeletingId(video.id);
      }
    }
    return skippedRemoteDeletion;
  };

  const handleDeleteVideo = (video: GeneratedVideo) => {
    Alert.alert(
      'Delete Video',
      'This will permanently delete the video and its thumbnail.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            performDelete(video).catch(() => {
              // handled in performDelete
            });
          },
        },
      ],
    );
  };

  const handleListLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    setListViewportHeight((prev) => (Math.abs(prev - nextHeight) < 1 ? prev : nextHeight));
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Max-width container for desktop */}
      <View style={[styles.contentWrapper, { maxWidth: CONTENT_MAX_WIDTHS.large }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + responsiveSpacing.vertical,
              paddingHorizontal: responsiveSpacing.horizontal,
            },
          ]}
        >
          <Text style={headerTitleStyle}>Gallery</Text>
          <Text style={headerSubtitleStyle}>
            {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={[styles.filtersWrapper, { marginBottom: responsiveSpacing.gap }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.filtersContainer,
              { paddingHorizontal: responsiveSpacing.horizontal, gap: responsiveSpacing.gap },
            ]}
          >
            {FILTERS.map((filter) => (
              <GlassPill
                key={filter.value}
                title={filter.label}
                active={selectedFilter === filter.value}
                onPress={() => setSelectedFilter(filter.value)}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Responsive Video Grid */}
      {filteredVideos.length > 0 ? (
        <View style={{ flex: 1, marginTop: responsiveSpacing.gap / 2 }} onLayout={handleListLayout}>
          <FlatList
            data={filteredVideos}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.cardContainer,
                  isMultiColumn
                    ? {
                        width: `${100 / numColumns}%`,
                        paddingHorizontal: responsiveSpacing.cardGap / 2,
                        paddingVertical: responsiveSpacing.cardGap / 2,
                      }
                    : {
                        paddingVertical: responsiveSpacing.gap / 2,
                        paddingHorizontal: responsiveSpacing.horizontal,
                        height: singleColumnCardHeight || undefined,
                        justifyContent: 'center',
                        marginBottom: responsiveSpacing.gap / 2,
                      },
                ]}
                onLayout={
                  isMultiColumn
                    ? undefined
                    : (event) => {
                        const nextHeight = event.nativeEvent.layout.height;
                        setMeasuredCardHeight((prev) =>
                          nextHeight > prev ? nextHeight : prev
                        );
                      }
                }
              >
                {isMultiColumn ? (
                  <VideoCard
                    video={item}
                    onPress={() => handleVideoPress(item)}
                    onFavorite={() => handleFavoriteToggle(item.id)}
                    fullWidth={!isMultiColumn}
                    onDelete={() => handleDeleteVideo(item)}
                    deleting={isDeletingVideo(item.id)}
                    showPrompt={false}
                  />
                ) : (
                  <View
                    style={[
                      styles.scaledCardWrapper,
                      singleColumnScale !== 1 && { transform: [{ scale: singleColumnScale }] },
                    ]}
                  >
                    <VideoCard
                      video={item}
                      onPress={() => handleVideoPress(item)}
                      onFavorite={() => handleFavoriteToggle(item.id)}
                      fullWidth={!isMultiColumn}
                      onDelete={() => handleDeleteVideo(item)}
                      deleting={isDeletingVideo(item.id)}
                      showPrompt={false}
                    />
                  </View>
                )}
              </View>
            )}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            key={numColumns}
            pagingEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              isMultiColumn
                ? {
                    paddingHorizontal: responsiveSpacing.horizontal - responsiveSpacing.cardGap / 2,
                    paddingTop: responsiveSpacing.gap,
                    paddingBottom: responsiveSpacing.vertical + insets.bottom + spacing.lg,
                    maxWidth: CONTENT_MAX_WIDTHS.large,
                    width: '100%',
                    alignSelf: 'center',
                  }
                : {
                    paddingHorizontal: responsiveSpacing.horizontal,
                    paddingTop: responsiveSpacing.gap,
                    paddingBottom: responsiveSpacing.vertical + insets.bottom + spacing.lg,
                  }
            }
            columnWrapperStyle={
              isMultiColumn
                ? {
                    alignItems: 'stretch',
                    maxWidth: CONTENT_MAX_WIDTHS.large,
                    width: '100%',
                    alignSelf: 'center',
                  }
                : undefined
            }
          />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingBottom: spacing.md,
  },
  filtersWrapper: {
    // Dynamic styling applied inline
  },
  filtersContainer: {
    // Dynamic styling applied inline
  },
  cardContainer: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  scaledCardWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
