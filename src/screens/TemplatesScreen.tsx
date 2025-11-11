import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassPill } from '../components';
import { colors, spacing, borderRadius } from '../theme/colors';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 3) / 2;

type FilterType = 'all' | 'trending' | 'tiktok' | 'instagram';
type PlatformType = 'tiktok' | 'instagram' | 'youtube' | null;

interface Template {
  id: string;
  name: string;
  description: string;
  views: string;
  platform?: PlatformType;
  gradient: string[];
  category: FilterType[];
  special?: boolean;
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Text Reveal',
    description: 'Animated text overlay',
    views: '2.3M',
    platform: 'tiktok',
    gradient: ['#8B4513', '#D2691E'],
    category: ['all', 'trending', 'tiktok'],
  },
  {
    id: '2',
    name: 'Split Screen',
    description: 'Dual video layout',
    views: '1.8M',
    platform: 'instagram',
    gradient: ['#1a1a1a', '#2d2d2d'],
    category: ['all', 'instagram'],
  },
  {
    id: '3',
    name: 'Countdown',
    description: 'Timer animation',
    views: '945K',
    platform: 'tiktok',
    gradient: ['#2d2d2d', '#1a1a1a'],
    category: ['all', 'tiktok'],
  },
  {
    id: '4',
    name: 'Zoom Effect',
    description: 'Dynamic scaling',
    views: '1.2M',
    platform: 'instagram',
    gradient: ['#4a3f3f', '#2d2d2d'],
    category: ['all', 'trending', 'instagram'],
  },
  {
    id: '5',
    name: 'Glitch',
    description: 'Digital distortion',
    views: '756K',
    platform: 'tiktok',
    gradient: ['#1a1a1a', '#0d0d0d'],
    category: ['all', 'tiktok'],
  },
  {
    id: '6',
    name: 'Neon Frame',
    description: 'Glowing borders',
    views: '1.5M',
    platform: 'tiktok',
    gradient: ['#0a192f', '#1a2332'],
    category: ['all', 'tiktok'],
    special: true,
  },
  {
    id: '7',
    name: 'Particles',
    description: 'Floating elements',
    views: '623K',
    platform: 'instagram',
    gradient: ['#0f2027', '#203a43'],
    category: ['all', 'instagram'],
  },
  {
    id: '8',
    name: 'Motion Blur',
    description: 'Speed effect',
    views: '892K',
    platform: 'tiktok',
    gradient: ['#434343', '#000000'],
    category: ['all', 'trending', 'tiktok'],
  },
];

const FILTERS = [
  { label: 'All', value: 'all' as FilterType, icon: null, iconType: null },
  { label: 'Trending', value: 'trending' as FilterType, icon: '🔥', iconType: 'emoji' as const },
  { label: 'TikTok', value: 'tiktok' as FilterType, icon: 'logo-tiktok', iconType: 'ionicon' as const },
  { label: 'Instagram', value: 'instagram' as FilterType, icon: 'logo-instagram', iconType: 'ionicon' as const },
];

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const filteredTemplates = templates.filter((template) =>
    template.category.includes(selectedFilter)
  );

  const handleTemplatePress = (template: Template) => {
    console.log('Selected template:', template.name);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Templates</Text>
          <Text style={styles.headerSubtitle}>Viral video styles</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTERS.map((filter) => {
            const renderIcon = () => {
              if (!filter.icon) return undefined;

              if (filter.iconType === 'emoji') {
                return <Text style={styles.filterEmoji}>{filter.icon}</Text>;
              }

              if (filter.iconType === 'ionicon') {
                return (
                  <Ionicons
                    name={filter.icon as any}
                    size={16}
                    color={selectedFilter === filter.value ? colors.text.primary : colors.text.secondary}
                  />
                );
              }

              return undefined;
            };

            return (
              <GlassPill
                key={filter.value}
                title={filter.label}
                active={selectedFilter === filter.value}
                onPress={() => setSelectedFilter(filter.value)}
                icon={renderIcon()}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Templates Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => handleTemplatePress(template)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={template.gradient}
                style={[
                  styles.templatePreview,
                  template.special && styles.specialPreview,
                ]}
              >
                {template.platform && (
                  <View style={styles.platformLogo}>
                    <Ionicons
                      name={
                        template.platform === 'tiktok'
                          ? 'logo-tiktok'
                          : template.platform === 'instagram'
                          ? 'logo-instagram'
                          : 'logo-youtube'
                      }
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                )}
                <View style={styles.viewCount}>
                  <Ionicons name="play" size={12} color="#FFFFFF" />
                  <Text style={styles.viewCountText}>{template.views}</Text>
                </View>
              </LinearGradient>
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>
                  {template.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingBottom: spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  filtersWrapper: {
    marginBottom: spacing.md,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
  },
  filterEmoji: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  templateCard: {
    width: cardWidth,
    marginBottom: spacing.md,
  },
  templatePreview: {
    width: '100%',
    height: cardWidth * 1.4,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    position: 'relative',
    padding: spacing.md,
  },
  specialPreview: {
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
  platformLogo: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewCount: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  viewCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  templateInfo: {
    paddingHorizontal: spacing.xs,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 13,
    color: colors.text.secondary,
  },
});
