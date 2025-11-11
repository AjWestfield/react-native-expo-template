import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/colors';
import { GeneratedVideo } from '../types/video';

interface VideoCardProps {
  video: GeneratedVideo;
  onPress: () => void;
  onFavorite?: () => void;
  fullWidth?: boolean;
}

const { width } = Dimensions.get('window');

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPress,
  onFavorite,
  fullWidth = false,
}) => {
  // Calculate card width based on layout
  const cardWidth = fullWidth
    ? width - spacing.lg * 2
    : (width - spacing.lg * 2 - spacing.md) / 2;

  // Use vertical aspect ratio (9:16) but more compact for full width single view
  const aspectRatioHeight = fullWidth ? cardWidth * 1.2 : cardWidth * 1.777;

  return (
    <TouchableOpacity
      style={[styles.container, fullWidth && { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.card,
          {
            height: aspectRatioHeight + 80,
          },
        ]}
      >
        {/* Video Thumbnail with Gradient */}
        <View style={[styles.thumbnail, { height: aspectRatioHeight }]}>
          <LinearGradient
            colors={video.thumbnailGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Play Icon Overlay */}
          <View style={styles.playOverlay}>
            <BlurView intensity={20} tint="dark" style={styles.playButton}>
              <Ionicons name="play" size={24} color={colors.text.primary} />
            </BlurView>
          </View>

          {/* Duration Badge */}
          <View style={styles.durationBadge}>
            <BlurView intensity={30} tint="dark" style={styles.durationBlur}>
              <Text style={styles.durationText}>{video.duration}s</Text>
            </BlurView>
          </View>

          {/* Favorite Button */}
          {onFavorite && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={onFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BlurView intensity={30} tint="dark" style={styles.favoriteBlur}>
                <Ionicons
                  name={video.isFavorite ? 'heart' : 'heart-outline'}
                  size={18}
                  color={colors.text.primary}
                />
              </BlurView>
            </TouchableOpacity>
          )}
        </View>

        {/* Video Info */}
        <View style={styles.info}>
          <Text style={styles.prompt} numberOfLines={2}>
            {video.prompt}
          </Text>
          <View style={styles.meta}>
            <Ionicons name="videocam-outline" size={12} color={colors.text.tertiary} />
            <Text style={styles.metaText}>{video.style}</Text>
            <View style={styles.dot} />
            <Text style={styles.metaText}>
              {new Date(video.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // width is set dynamically
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.glass,
  },
  thumbnail: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  durationBlur: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  durationText: {
    ...typography.caption2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  favoriteBlur: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: spacing.md,
  },
  prompt: {
    ...typography.subheadline,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption1,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.text.tertiary,
  },
});
