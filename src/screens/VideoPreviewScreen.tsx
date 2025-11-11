import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  ActivityIndicator,
  Share,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { GlassButton } from '../components';
import { colors, spacing, borderRadius } from '../theme/colors';
import { addGalleryVideo, updateGalleryVideo } from '../hooks/useGalleryStore';
import { useVideoUpload } from '../hooks/useVideoUpload';
import { VideoGenerationParams } from '../types/video';
import { useResponsive } from '../hooks/useResponsive';

const DEFAULT_DURATION_SECONDS = 10;

const resolveAspectRatioValue = (
  value?: string
): VideoGenerationParams['aspectRatio'] => {
  const normalized = (value || '').toLowerCase();

  if (normalized === 'horizontal' || normalized === '16:9') {
    return '16:9';
  }

  if (normalized === '1:1' || normalized === 'square') {
    return '1:1';
  }

  if (normalized === '4:3') {
    return '4:3';
  }

  return '9:16';
};

const parseDurationValue = (value?: string | number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return DEFAULT_DURATION_SECONDS;
};

type VideoPreviewScreenRouteProp = RouteProp<
  {
    VideoPreview: {
      videoUrl: string;
      prompt: string;
      image?: string | null;
      model?: string;
      aspectRatio?: string;
      duration?: string;
      shouldAutoPlay?: boolean;
    };
  },
  'VideoPreview'
>;

type RootNavigation = NavigationProp<Record<string, object | undefined>>;

export default function VideoPreviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<VideoPreviewScreenRouteProp>();
  const isFocused = useIsFocused();
  const responsive = useResponsive();
  const { width } = useWindowDimensions();
  const {
    videoUrl,
    prompt = 'Default prompt',
    image,
    model = 'Sora 2',
    aspectRatio = 'vertical',
    duration = '10',
    shouldAutoPlay = false,
  } = route.params || {};
  const tabBarOffset = 60 + Math.max(insets.bottom, 10);

  useEffect(() => {
    console.log('VideoPreviewScreen mounted with:', {
      videoUrl,
      model,
      aspectRatio,
      hasImage: !!image
    });
  }, [videoUrl, model, aspectRatio, image]);

  // Calculate responsive video dimensions based on aspect ratio
  const { VIDEO_WIDTH, VIDEO_HEIGHT } = React.useMemo(() => {
    const isVertical = aspectRatio === 'vertical';

    // Constrain video size for different breakpoints
    let maxVideoWidth = width * 0.85;
    if (responsive.isDesktop || responsive.isLargeDesktop) {
      maxVideoWidth = Math.min(width * 0.6, 500);
    } else if (responsive.isTablet) {
      maxVideoWidth = Math.min(width * 0.7, 400);
    } else if (responsive.isMobile) {
      maxVideoWidth = Math.min(width * 0.7, 320);
    }

    const verticalCap = responsive.isMobile ? 300 : 350;
    const videoWidth = Math.min(maxVideoWidth, isVertical ? verticalCap : 500);
    const videoHeight = isVertical ? videoWidth * (16 / 9) : videoWidth * (9 / 16);

    return { VIDEO_WIDTH: videoWidth, VIDEO_HEIGHT: videoHeight };
  }, [aspectRatio, responsive, width]);

  const fullscreenOptions = React.useMemo(
    () => ({
      enable: true,
      orientation: aspectRatio === 'vertical' ? 'portrait' : 'landscape',
    }),
    [aspectRatio]
  );

  const player = useVideoPlayer(
    videoUrl ? { uri: videoUrl } : null,
    useCallback((videoPlayer) => {
      videoPlayer.loop = true;
      videoPlayer.timeUpdateEventInterval = 0.25;
      videoPlayer.pause();
    }, [])
  );
  const videoRef = useRef<VideoView | null>(null);
  const galleryRegistrationRef = useRef(false);
  const thumbnailGenerationAttemptedRef = useRef(false);
  const autoPlayRequestedRef = useRef(Boolean(shouldAutoPlay && videoUrl));
  const { uploadVideo: uploadVideoToSupabase } = useVideoUpload();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [galleryVideoId, setGalleryVideoId] = useState<string | null>(null);
  const [hasSavedLocally, setHasSavedLocally] = useState(false);
  const [localFileUri, setLocalFileUri] = useState<string | null>(null);
  const [hasUploadedToSupabase, setHasUploadedToSupabase] = useState(false);
  const [downloadAcknowledged, setDownloadAcknowledged] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const attemptAutoPlay = useCallback(() => {
    if (!autoPlayRequestedRef.current || !player || !isFocused) {
      return;
    }

    autoPlayRequestedRef.current = false;

    try {
      player.play();
    } catch (error) {
      console.warn('Auto play failed:', error);
    }
  }, [isFocused, player]);

  useEffect(() => {
    thumbnailGenerationAttemptedRef.current = false;
    autoPlayRequestedRef.current = Boolean(shouldAutoPlay && videoUrl);
    if (videoUrl) {
      setIsLoading(true);
      setPosition(0);
      setVideoDuration(0);
      setIsPlaying(false);
      setDownloadAcknowledged(false);
    }
  }, [shouldAutoPlay, videoUrl]);

  useEffect(() => {
    if (!player) {
      return;
    }

    if (!isFocused) {
      try {
        player.pause();
      } catch (error) {
        console.warn('Pause on blur failed:', error);
      }
      setIsPlaying(false);
      autoPlayRequestedRef.current = false;
      if (videoRef.current) {
        videoRef.current
          .exitFullscreen()
          .catch((error) => console.warn('Exit fullscreen on blur failed:', error));
      }
      setIsFullscreen(false);
    }
  }, [isFocused, player]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!videoUrl || galleryRegistrationRef.current) {
      return;
    }

    galleryRegistrationRef.current = true;

    addGalleryVideo({
      prompt,
      model,
      duration,
      aspectRatio,
      videoUrl,
      thumbnailUri: typeof image === 'string' ? image : undefined,
    })
      .then((entry) => {
        setGalleryVideoId(entry.id);
        thumbnailGenerationAttemptedRef.current = !!entry.thumbnailUri;
        if (entry.isFavorite) {
          setIsFavorite(true);
        }
        if (entry.savedToDevice && entry.localUri) {
          setHasSavedLocally(true);
          setLocalFileUri(entry.localUri);
          setDownloadAcknowledged(true);
        }
      })
      .catch((error) => {
        console.warn('Failed to register video in gallery', error);
      });
  }, [videoUrl, prompt, model, duration, aspectRatio]);

  useEffect(() => {
    if (!player) {
      return;
    }

    const statusSubscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        setIsLoading(false);
        if (player.duration > 0) {
          setVideoDuration(player.duration * 1000);
        }
        attemptAutoPlay();
      } else if (status === 'loading') {
        setIsLoading(true);
      }
    });

    const playingSubscription = player.addListener('playingChange', ({ isPlaying }) => {
      setIsPlaying(isPlaying);
    });

    const timeSubscription = player.addListener('timeUpdate', ({ currentTime }) => {
      setPosition(currentTime * 1000);
      if (player.duration > 0) {
        setVideoDuration(player.duration * 1000);
      }
    });

    return () => {
      statusSubscription.remove();
      playingSubscription.remove();
      timeSubscription.remove();
    };
  }, [attemptAutoPlay, player]);

  useEffect(() => {
    if (!isLoading) {
      attemptAutoPlay();
    }
  }, [attemptAutoPlay, isLoading]);

  useEffect(() => {
    if (!videoUrl || !galleryVideoId || thumbnailGenerationAttemptedRef.current) {
      return;
    }

    let isMounted = true;
    thumbnailGenerationAttemptedRef.current = true;

    (async () => {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
          time: 1000,
          quality: 0.6,
        });

        if (isMounted && uri) {
          await updateGalleryVideo(galleryVideoId, { thumbnailUri: uri });
        }
      } catch (error) {
        console.warn('Thumbnail generation failed:', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [videoUrl, galleryVideoId]);

  const handlePlayPause = () => {
    if (!player) {
      return;
    }

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleToggleFullscreen = async () => {
    if (!videoRef.current) {
      return;
    }

    try {
      if (isFullscreen) {
        await videoRef.current.exitFullscreen();
      } else {
        await videoRef.current.enterFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle error:', error);
    }
  };

  const persistFavoriteState = (next: boolean) => {
    setIsFavorite(next);
    if (!galleryVideoId) {
      return;
    }

    updateGalleryVideo(galleryVideoId, { isFavorite: next }).catch((error) => {
      console.warn('Failed to sync favorite state', error);
    });
  };

  const syncLocalSaveState = (uri: string) => {
    if (!galleryVideoId) {
      return;
    }

    updateGalleryVideo(galleryVideoId, { savedToDevice: true, localUri: uri }).catch(
      (error) => {
        console.warn('Failed to sync local save state', error);
      }
    );
  };

  const persistVideoToSupabase = async (uri: string) => {
    if (hasUploadedToSupabase) {
      return;
    }

    try {
      const normalizedParams: VideoGenerationParams = {
        prompt,
        style: model?.toLowerCase() ?? 'custom',
        duration: parseDurationValue(duration),
        aspectRatio: resolveAspectRatioValue(aspectRatio),
        fps: 30,
      };

      const metadata = await uploadVideoToSupabase(
        uri,
        normalizedParams,
        {
          sourceImageUri: typeof image === 'string' ? image : undefined,
        }
      );

      setHasUploadedToSupabase(true);

      if (metadata && galleryVideoId) {
        await updateGalleryVideo(galleryVideoId, {
          supabaseVideoId: metadata.id,
          storagePath: metadata.storage_path ?? null,
        });
      }
    } catch (error) {
      console.error('Supabase upload error:', error);
      Alert.alert(
        'Cloud Backup Failed',
        'We saved the video locally but could not back it up to Supabase yet. Please try again later.'
      );
    }
  };

  const downloadVideoToLibrary = async ({ silent }: { silent?: boolean } = {}) => {
    if (!videoUrl) {
      Alert.alert('Error', 'Video URL not available');
      return null;
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant media library access to download videos');
      return null;
    }

    const destinationDir = FileSystem.documentDirectory;
    if (!destinationDir) {
      Alert.alert('Error', 'Storage directory unavailable. Please try again.');
      return null;
    }

    const fileName = `video_${Date.now()}.mp4`;
    const destinationUri = `${destinationDir}${fileName}`;
    const result = await FileSystem.downloadAsync(videoUrl, destinationUri);

    if (!result?.uri) {
      throw new Error('Download failed');
    }

    await MediaLibrary.saveToLibraryAsync(result.uri);
    setHasSavedLocally(true);
    setLocalFileUri(result.uri);
    syncLocalSaveState(result.uri);
    // Kick off Supabase backup without blocking the UI thread
    void persistVideoToSupabase(result.uri);

    return result.uri;
  };

  const downloadVideoToCache = async () => {
    if (!videoUrl) {
      throw new Error('Video URL not available');
    }

    const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!cacheDir) {
      throw new Error('Temporary directory unavailable');
    }

    const fileName = `share_${Date.now()}.mp4`;
    const result = await FileSystem.downloadAsync(videoUrl, `${cacheDir}${fileName}`);
    if (!result?.uri) {
      throw new Error('Download failed');
    }

    return result.uri;
  };

  const handleDownload = async () => {
    try {
      setDownloadAcknowledged(true);
      const uri = await downloadVideoToLibrary();
      if (!uri) {
        setDownloadAcknowledged(false);
      }
    } catch (error) {
      setDownloadAcknowledged(false);
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download video. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      if (!videoUrl) {
        Alert.alert('Error', 'Video URL not available');
        return;
      }

      const shareUri = localFileUri || (await downloadVideoToCache());

      if (Platform.OS === 'ios') {
        await Share.share({
          url: shareUri,
          message: 'Check out my generated video!',
        });
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(shareUri, {
          mimeType: 'video/mp4',
          dialogTitle: 'Share your generated video',
        });
        return;
      }

      await Share.share({
        url: shareUri,
        message: 'Check out my generated video!',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share video. Please try again.');
    }
  };

  const handleSaveToGallery = async () => {
    try {
      const uri =
        hasSavedLocally && localFileUri
          ? localFileUri
          : await downloadVideoToLibrary({ silent: true });

      if (uri) {
        persistFavoriteState(true);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save video. Please try again.');
    }
  };

  const handleFavoriteToggle = () => {
    persistFavoriteState(!isFavorite);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCreateAnother = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Video</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarOffset + spacing.xxl,
            flexGrow: 1,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.topSection}>
            {/* Video Preview Area */}
            <View style={[styles.videoContainer, { width: VIDEO_WIDTH, height: VIDEO_HEIGHT }]}>
              <View style={styles.videoPreview}>
                {videoUrl ? (
                  <>
                    <VideoView
                      ref={videoRef}
                      style={StyleSheet.absoluteFillObject}
                      player={player}
                      nativeControls={isFullscreen}
                      contentFit="contain"
                      fullscreenOptions={fullscreenOptions}
                      onFullscreenEnter={() => setIsFullscreen(true)}
                      onFullscreenExit={() => setIsFullscreen(false)}
                    />

                    {/* Loading overlay */}
                    {isLoading && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.text.primary} />
                      </View>
                    )}

                    {/* Play/Pause overlay */}
                    {!isLoading && !isFullscreen && (
                      <TouchableOpacity
                        style={styles.playOverlay}
                        onPress={handlePlayPause}
                        activeOpacity={0.8}
                      >
                        {!isPlaying && (
                          <View style={styles.playButton}>
                            <Ionicons
                              name="play"
                              size={48}
                              color={colors.text.primary}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    )}

                    {/* Duration badge */}
                    {!isLoading && !isFullscreen && videoDuration > 0 && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>
                          {Math.floor(position / 60000)}:{String(Math.floor((position % 60000) / 1000)).padStart(2, '0')} / {Math.floor(videoDuration / 60000)}:{String(Math.floor((videoDuration % 60000) / 1000)).padStart(2, '0')}
                        </Text>
                      </View>
                    )}

                    {/* Fullscreen button */}
                    {!isFullscreen && (
                      <TouchableOpacity
                        style={styles.fullscreenButton}
                        onPress={handleToggleFullscreen}
                      >
                        <Ionicons
                          name="expand-outline"
                          size={22}
                          color={colors.text.primary}
                        />
                      </TouchableOpacity>
                    )}

                    {/* Favorite button */}
                    {!isFullscreen && (
                      <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={handleFavoriteToggle}
                      >
                        <Ionicons
                          name={isFavorite ? 'heart' : 'heart-outline'}
                          size={24}
                          color={isFavorite ? '#FF6B9D' : colors.text.primary}
                        />
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <LinearGradient
                    colors={['#667EEA', '#764BA2']}
                    style={StyleSheet.absoluteFillObject}
                  >
                    <View style={styles.videoContent}>
                      <Ionicons
                        name="alert-circle"
                        size={80}
                        color="rgba(255, 255, 255, 0.3)"
                      />
                      <Text style={styles.videoPlaceholder}>Video Not Available</Text>
                    </View>
                  </LinearGradient>
                )}
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.actions, { marginBottom: tabBarOffset }]}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDownload}
              >
                <Ionicons
                  name={hasSavedLocally || downloadAcknowledged ? 'checkmark-circle' : 'download-outline'}
                  size={24}
                  color={hasSavedLocally || downloadAcknowledged ? '#4CAF50' : colors.text.primary}
                />
                <Text
                  style={[
                    styles.actionText,
                    (hasSavedLocally || downloadAcknowledged) && styles.actionTextActive,
                  ]}
                >
                  {hasSavedLocally || downloadAcknowledged ? 'Downloaded' : 'Download'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Ionicons
                  name="share-outline"
                  size={24}
                  color={colors.text.primary}
                />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSaveToGallery}
              >
                <Ionicons
                  name={isFavorite ? 'checkmark-circle' : 'add-circle-outline'}
                  size={24}
                  color={isFavorite ? '#4CAF50' : colors.text.primary}
                />
                <Text
                  style={[
                    styles.actionText,
                    isFavorite && styles.actionTextActive,
                  ]}
                >
                  {isFavorite ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            <GlassButton
              title="Create Another Video"
              onPress={handleCreateAnother}
              size="large"
              leftIcon={
                <Ionicons
                  name="add-circle"
                  size={20}
                  color={colors.text.primary}
                />
              }
            />
          </View>
        </Animated.View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
  },
  videoContainer: {
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  videoPlaceholder: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.md,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionTextActive: {
    color: '#4CAF50',
  },
});
