import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
  ColorValue,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassPill } from '../components';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useResponsive } from '../hooks/useResponsive';
import {
  getGridColumns,
  calculateGridItemWidth,
  getResponsiveSpacing,
  createResponsiveTextStyle,
  getHeaderButtonSize,
  getIconSize,
} from '../utils/responsive';
import { CONTENT_MAX_WIDTHS, SIDEBAR } from '../constants/responsive';

type FilterType = 'all' | 'trending' | 'tiktok' | 'instagram';
type PlatformType = 'tiktok' | 'instagram' | 'youtube' | null;

interface Template {
  id: string;
  name: string;
  description: string;
  views: string;
  platform?: PlatformType;
  gradient: readonly [ColorValue, ColorValue];
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
    gradient: ['#8B4513', '#D2691E'] as const,
    category: ['all', 'trending', 'tiktok'],
  },
  {
    id: '2',
    name: 'Split Screen',
    description: 'Dual video layout',
    views: '1.8M',
    platform: 'instagram',
    gradient: ['#1a1a1a', '#2d2d2d'] as const,
    category: ['all', 'instagram'],
  },
  {
    id: '3',
    name: 'Countdown',
    description: 'Timer animation',
    views: '945K',
    platform: 'tiktok',
    gradient: ['#2d2d2d', '#1a1a1a'] as const,
    category: ['all', 'tiktok'],
  },
  {
    id: '4',
    name: 'Zoom Effect',
    description: 'Dynamic scaling',
    views: '1.2M',
    platform: 'instagram',
    gradient: ['#4a3f3f', '#2d2d2d'] as const,
    category: ['all', 'trending', 'instagram'],
  },
  {
    id: '5',
    name: 'Glitch',
    description: 'Digital distortion',
    views: '756K',
    platform: 'tiktok',
    gradient: ['#1a1a1a', '#0d0d0d'] as const,
    category: ['all', 'tiktok'],
  },
  {
    id: '6',
    name: 'Neon Frame',
    description: 'Glowing borders',
    views: '1.5M',
    platform: 'tiktok',
    gradient: ['#0a192f', '#1a2332'] as const,
    category: ['all', 'tiktok'],
    special: true,
  },
  {
    id: '7',
    name: 'Particles',
    description: 'Floating elements',
    views: '623K',
    platform: 'instagram',
    gradient: ['#0f2027', '#203a43'] as const,
    category: ['all', 'instagram'],
  },
  {
    id: '8',
    name: 'Motion Blur',
    description: 'Speed effect',
    views: '892K',
    platform: 'tiktok',
    gradient: ['#434343', '#000000'] as const,
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
  const responsive = useResponsive();
  const { width } = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  // Get responsive styling
  const responsiveSpacing = getResponsiveSpacing(responsive);
  const headerButtonSize = getHeaderButtonSize(responsive);
  const iconSize = getIconSize(24, responsive);

  // Calculate responsive grid columns and card width
  const numColumns = getGridColumns('templates', responsive);
  const maxContentWidth = CONTENT_MAX_WIDTHS.large;
  const sidebarOffset = responsive.shouldUseSidebar ? SIDEBAR.collapsedWidth : 0;
  const effectiveWidth = Math.min(width - sidebarOffset, maxContentWidth);
  const horizontalPadding = responsiveSpacing.horizontal * 2;
  const gap = responsiveSpacing.cardGap;
  const cardWidth = calculateGridItemWidth(effectiveWidth - horizontalPadding, numColumns, gap);

  // Responsive typography
  const headerTitleStyle = createResponsiveTextStyle(20, responsive, {
    fontWeight: '700',
    color: colors.text.primary,
  });
  const headerSubtitleStyle = createResponsiveTextStyle(14, responsive, {
    color: colors.text.secondary,
  });

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
          {!responsive.shouldUseSidebar && (
            <TouchableOpacity style={[styles.headerButton, { width: headerButtonSize, height: headerButtonSize }]}>
              <Ionicons name="arrow-back" size={iconSize} color={colors.text.primary} />
            </TouchableOpacity>
          )}
          <View style={[styles.headerCenter, responsive.shouldUseSidebar && styles.headerCenterDesktop]}>
            <Text style={headerTitleStyle}>Templates</Text>
            <Text style={headerSubtitleStyle}>Viral video styles</Text>
          </View>
          {!responsive.shouldUseSidebar && (
            <TouchableOpacity style={[styles.headerButton, { width: headerButtonSize, height: headerButtonSize }]}>
              <Ionicons name="search" size={iconSize} color={colors.text.primary} />
            </TouchableOpacity>
          )}
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
      </View>

      {/* Templates Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + (responsive.shouldUseSidebar ? 20 : 100),
          maxWidth: CONTENT_MAX_WIDTHS.large,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.grid,
            {
              paddingHorizontal: responsiveSpacing.horizontal,
              gap: responsiveSpacing.cardGap,
            },
          ]}
        >
          {filteredTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateCard, { width: cardWidth }]}
              onPress={() => handleTemplatePress(template)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={template.gradient}
                style={[
                  styles.templatePreview,
                  { height: cardWidth * 1.4 },
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
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  headerButton: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerCenterDesktop: {
    alignItems: 'flex-start',
  },
  filtersWrapper: {
    // Dynamic styling applied inline
  },
  filtersContainer: {
    // Dynamic styling applied inline
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
  },
  templateCard: {
    marginBottom: spacing.md,
  },
  templatePreview: {
    width: '100%',
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
