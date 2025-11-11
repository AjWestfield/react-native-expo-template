import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { GeneratedImage } from '../types/image';
import { colors, typography } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with spacing

interface ImageCardProps {
  image: GeneratedImage;
  onPress: (image: GeneratedImage) => void;
  onFavoriteToggle: (image: GeneratedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onPress,
  onFavoriteToggle
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'photorealistic':
        return 'camera';
      case 'artistic':
        return 'color-palette';
      case 'sketch':
        return 'pencil';
      case 'cartoon':
        return 'happy';
      case 'oil-painting':
        return 'brush';
      case 'watercolor':
        return 'water';
      default:
        return 'image';
    }
  };

  const getTemplateIcon = (templateType: string | undefined) => {
    switch (templateType) {
      case 'ring-camera':
        return 'videocam';
      case 'security-camera':
        return 'eye';
      case 'smartphone':
        return 'phone-portrait';
      case 'body-cam':
        return 'body';
      case 'drone':
        return 'airplane';
      case 'dashcam':
        return 'car';
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(image)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <LinearGradient
          colors={image.thumbnailGradient as [string, string, ...string[]]}
          style={styles.thumbnail}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Template badge if template was used */}
          {image.templateType && (
            <BlurView intensity={20} style={styles.templateBadge}>
              <Ionicons
                name={getTemplateIcon(image.templateType) as any}
                size={12}
                color={colors.text.white}
              />
            </BlurView>
          )}

          {/* Favorite button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              onFavoriteToggle(image);
            }}
          >
            <BlurView intensity={20} style={styles.favoriteBlur}>
              <Ionicons
                name={image.isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={image.isFavorite ? '#FF4444' : colors.text.white}
              />
            </BlurView>
          </TouchableOpacity>

          {/* Style badge */}
          <BlurView intensity={20} style={styles.styleBadge}>
            <Ionicons
              name={getStyleIcon(image.style) as any}
              size={12}
              color={colors.text.white}
            />
            <Text style={styles.styleBadgeText}>
              {image.style.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </BlurView>
        </LinearGradient>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.prompt} numberOfLines={2}>
          {image.prompt}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{formatDate(image.createdAt)}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{image.aspectRatio}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  thumbnail: {
    width: '100%',
    height: CARD_WIDTH * 1.2,
    justifyContent: 'space-between',
    padding: 8,
  },
  templateBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  favoriteBlur: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  styleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  styleBadgeText: {
    ...typography.caption2,
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  info: {
    marginTop: 8,
    gap: 4,
  },
  prompt: {
    ...typography.body,
    color: colors.text.white,
    fontSize: 13,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...typography.caption2,
    color: colors.text.medium,
    fontSize: 11,
  },
  metaDot: {
    ...typography.caption2,
    color: colors.text.medium,
  },
});
