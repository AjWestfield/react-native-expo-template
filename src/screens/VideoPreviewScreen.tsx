import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { GlassButton } from '../components';
import { colors, spacing, borderRadius } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const VIDEO_WIDTH = Math.min(width * 0.55, 280); // Narrower width for 9:16 aspect ratio
const VIDEO_HEIGHT = VIDEO_WIDTH * (16 / 9); // True 9:16 vertical aspect ratio
const PROMPT_MAX_HEIGHT = Math.min(height * 0.12, 100); // Compact prompt height

type VideoPreviewScreenRouteProp = RouteProp<
  { VideoPreview: { prompt: string } },
  'VideoPreview'
>;

export default function VideoPreviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<VideoPreviewScreenRouteProp>();
  const { prompt } = route.params || { prompt: 'Default prompt' };
  const tabBarOffset = 60 + Math.max(insets.bottom, 10);

  console.log('VideoPreviewScreen mounted with prompt:', prompt);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    Alert.alert('Download', 'Video downloaded successfully!');
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share options would open here');
  };

  const handleSaveToGallery = () => {
    Alert.alert('Saved', 'Video saved to your gallery!');
    setIsFavorite(true);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCreateAnother = () => {
    navigation.navigate('Home' as never);
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
            paddingBottom: insets.bottom + spacing.md,
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
            <View style={styles.videoContainer}>
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.videoPreview}
              >
                {/* Simulated video content */}
                <View style={styles.videoContent}>
                  <Ionicons
                    name="videocam"
                    size={80}
                    color="rgba(255, 255, 255, 0.3)"
                  />
                  <Text style={styles.videoPlaceholder}>Generated Video</Text>
                </View>

                {/* Play/Pause overlay */}
                <TouchableOpacity
                  style={styles.playOverlay}
                  onPress={handlePlayPause}
                  activeOpacity={0.8}
                >
                  <View style={styles.playButton}>
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={48}
                      color={colors.text.primary}
                    />
                  </View>
                </TouchableOpacity>

                {/* Duration badge */}
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>0:10</Text>
                </View>

                {/* Favorite button */}
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => setIsFavorite(!isFavorite)}
                >
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite ? '#FF6B9D' : colors.text.primary}
                  />
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Prompt */}
            <View style={styles.promptContainer}>
              <ScrollView
                style={styles.promptScroll}
                contentContainerStyle={styles.promptScrollContent}
                showsVerticalScrollIndicator
                nestedScrollEnabled
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </ScrollView>
            </View>
          </View>

          {/* Actions */}
          <View
            style={[
              styles.actions,
              { marginBottom: tabBarOffset },
            ]}
          >
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDownload}
              >
                <Ionicons
                  name="download-outline"
                  size={24}
                  color={colors.text.primary}
                />
                <Text style={styles.actionText}>Download</Text>
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
    width: '100%',
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  videoPreview: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
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
  promptContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    minHeight: 50,
    alignItems: 'center',
  },
  promptScroll: {
    maxHeight: PROMPT_MAX_HEIGHT,
  },
  promptScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  promptText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    textAlign: 'center',
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
