import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
  ColorValue,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/colors';
import { GeneratedVideo } from '../types/video';

interface VideoCardProps {
  video: GeneratedVideo;
  onPress: () => void;
  onFavorite?: () => void;
  fullWidth?: boolean;
  onDelete?: () => void;
  deleting?: boolean;
  style?: StyleProp<ViewStyle>;
  showPrompt?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPress,
  onFavorite,
  fullWidth = false,
  onDelete,
  deleting = false,
  style,
  showPrompt = true,
}) => {
  const previewAspectRatio = fullWidth ? 5 / 7 : 9 / 16;
  const previewRadius = borderRadius.xl;
  const contentPadding = fullWidth ? spacing.lg : spacing.md;
  const iconSize = fullWidth ? 20 : 18;
  const metaIconSize = fullWidth ? 14 : 12;

  const defaultGradient: [ColorValue, ColorValue] = ['#4FACFE', '#00F2FE'];
  const gradientColors: [ColorValue, ColorValue, ...ColorValue[]] =
    video.thumbnailGradient && video.thumbnailGradient.length >= 2
      ? [
          video.thumbnailGradient[0],
          video.thumbnailGradient[1],
          ...video.thumbnailGradient.slice(2),
        ]
      : defaultGradient;

  const formattedDate = new Date(video.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.card, fullWidth ? styles.cardFullWidth : styles.cardGrid]}>
        <View
          style={[
            styles.thumbnailWrapper,
            { borderRadius: previewRadius, marginBottom: spacing.sm },
          ]}
        >
          <View style={[styles.thumbnail, { aspectRatio: previewAspectRatio }]}>
            {video.thumbnailUri ? (
              <Image
                source={{ uri: video.thumbnailUri }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.thumbnailAccent} />

            {/* Play Icon Overlay */}
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={iconSize} color={colors.text.primary} />
              </View>
            </View>

            {/* Duration Badge */}
            <View style={styles.durationBadge}>
              <View style={styles.durationChip}>
                <Text style={styles.durationText}>{video.duration}s</Text>
              </View>
            </View>

            {/* Delete Button */}
            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={onDelete}
                disabled={deleting}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.helperChip}>
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={deleting ? colors.text.tertiary : colors.text.primary}
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Favorite Button */}
            {onFavorite && (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={onFavorite}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.helperChip}>
                  <Ionicons
                    name={video.isFavorite ? 'heart' : 'heart-outline'}
                    size={16}
                    color={colors.text.primary}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Video Info */}
        <View
          style={[styles.info, { paddingHorizontal: contentPadding, paddingBottom: contentPadding }]}
        >
          <View style={styles.chipRow}>
            <View style={styles.primaryChip}>
              <Ionicons name="videocam-outline" size={metaIconSize} color={colors.text.primary} />
              <Text style={styles.primaryChipText}>{video.style}</Text>
            </View>
            <View style={styles.secondaryChip}>
              <Ionicons name="time-outline" size={metaIconSize} color={colors.text.secondary} />
              <Text style={styles.secondaryChipText}>{video.aspectRatio}</Text>
            </View>
          </View>

          {showPrompt && (
            <Text style={[styles.prompt, fullWidth && styles.promptFullWidth]} numberOfLines={2}>
              {video.prompt}
            </Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{formattedDate}</Text>
            <View style={styles.metaDivider} />
            <Text style={styles.metaText}>{video.fps} fps</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    width: '100%',
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(9, 9, 9, 0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
    ...shadows.glass,
  },
  cardGrid: {},
  cardFullWidth: {},
  thumbnailWrapper: {
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  thumbnail: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbnailAccent: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    opacity: 0.2,
    transform: [{ rotate: '25deg' }],
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  durationChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  helperChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  info: {
    width: '100%',
    gap: spacing.sm,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(5, 5, 5, 0.35)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  primaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 1.5,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  primaryChipText: {
    ...typography.caption1,
    color: colors.text.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  secondaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 1.5,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  secondaryChipText: {
    ...typography.caption1,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  prompt: {
    ...typography.subheadline,
    color: colors.text.primary,
    fontWeight: '600',
    lineHeight: 22,
  },
  promptFullWidth: {
    fontSize: 18,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.tertiary,
    opacity: 0.6,
  },
  metaText: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
});
