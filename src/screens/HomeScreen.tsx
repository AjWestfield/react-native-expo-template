import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassPill,
  ProgressGlass,
} from '../components';
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from '../theme/colors';
import { VideoStyle, AspectRatio, FPS, GenerationState } from '../types/video';

const { width } = Dimensions.get('window');

const STYLE_PRESETS: { value: VideoStyle; label: string; icon: string }[] = [
  { value: 'cinematic', label: 'Cinematic', icon: 'film' },
  { value: 'anime', label: 'Anime', icon: 'color-palette' },
  { value: 'realistic', label: 'Realistic', icon: 'camera' },
  { value: 'abstract', label: 'Abstract', icon: 'color-wand' },
];

const ASPECT_RATIOS: AspectRatio[] = ['16:9', '9:16', '1:1', '4:3'];
const FPS_OPTIONS: FPS[] = [24, 30, 60];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>('cinematic');
  const [duration, setDuration] = useState(10); // seconds
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [fps, setFps] = useState<FPS>(30);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
  });
  const [recentPrompts, setRecentPrompts] = useState<string[]>([
    'A cinematic drone shot of a futuristic city at sunset',
    'Anime style magical girl transformation sequence',
    'Realistic ocean waves crashing on a beach',
  ]);

  // Simulate video generation
  const handleGenerate = () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    setGenerationState({ isGenerating: true, progress: 0 });

    // Simulate progress
    const interval = setInterval(() => {
      setGenerationState((prev) => {
        const newProgress = prev.progress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setGenerationState({ isGenerating: false, progress: 0 });
            Alert.alert(
              'Success!',
              'Your video has been generated and saved to Gallery'
            );
            // Add to recent prompts
            if (!recentPrompts.includes(prompt)) {
              setRecentPrompts([prompt, ...recentPrompts.slice(0, 4)]);
            }
          }, 500);
          return { isGenerating: false, progress: 100 };
        }
        return { isGenerating: true, progress: newProgress };
      });
    }, 500);
  };

  const characterCount = prompt.length;
  const maxCharacters = 500;

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
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>AI Video</Text>
          <Text style={styles.heroSubtitle}>
            Create stunning videos from text
          </Text>
        </View>

        {/* Prompt Input */}
        <View style={styles.section}>
          <GlassCard style={styles.promptCard}>
            <GlassInput
              placeholder="Describe your video..."
              value={prompt}
              onChangeText={setPrompt}
              multiline
              height={140}
              containerStyle={styles.promptInput}
            />
            <View style={styles.characterCount}>
              <Text style={styles.characterCountText}>
                {characterCount} / {maxCharacters}
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* Style Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            {STYLE_PRESETS.map((style) => (
              <GlassPill
                key={style.value}
                title={style.label}
                active={selectedStyle === style.value}
                onPress={() => setSelectedStyle(style.value)}
                icon={
                  <Ionicons
                    name={style.icon as any}
                    size={16}
                    color={
                      selectedStyle === style.value
                        ? colors.text.primary
                        : colors.text.secondary
                    }
                  />
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* Advanced Options */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text style={styles.sectionTitle}>Advanced Options</Text>
            <Ionicons
              name={showAdvanced ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text.primary}
            />
          </TouchableOpacity>

          {showAdvanced && (
            <GlassCard style={styles.advancedCard}>
              {/* Duration */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Duration: {duration}s</Text>
                <View style={styles.optionButtons}>
                  {[5, 10, 30, 60].map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.optionButton,
                        duration === d && styles.optionButtonActive,
                      ]}
                      onPress={() => setDuration(d)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          duration === d && styles.optionButtonTextActive,
                        ]}
                      >
                        {d}s
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Aspect Ratio */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Aspect Ratio</Text>
                <View style={styles.optionButtons}>
                  {ASPECT_RATIOS.map((ratio) => (
                    <TouchableOpacity
                      key={ratio}
                      style={[
                        styles.optionButton,
                        aspectRatio === ratio && styles.optionButtonActive,
                      ]}
                      onPress={() => setAspectRatio(ratio)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          aspectRatio === ratio && styles.optionButtonTextActive,
                        ]}
                      >
                        {ratio}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* FPS */}
              <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.optionLabel}>Frame Rate</Text>
                <View style={styles.optionButtons}>
                  {FPS_OPTIONS.map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.optionButton,
                        fps === f && styles.optionButtonActive,
                      ]}
                      onPress={() => setFps(f)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          fps === f && styles.optionButtonTextActive,
                        ]}
                      >
                        {f}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </GlassCard>
          )}
        </View>

        {/* Generation Progress */}
        {generationState.isGenerating && (
          <View style={styles.section}>
            <ProgressGlass
              progress={generationState.progress}
              label="Generating your video..."
            />
          </View>
        )}

        {/* Generate Button */}
        <View style={styles.section}>
          <GlassButton
            title="Generate Video"
            onPress={handleGenerate}
            size="large"
            loading={generationState.isGenerating}
            disabled={generationState.isGenerating || !prompt.trim()}
          />
        </View>

        {/* Recent Prompts */}
        {recentPrompts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Prompts</Text>
            {recentPrompts.map((recentPrompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentPromptCard}
                onPress={() => setPrompt(recentPrompt)}
              >
                <GlassCard>
                  <View style={styles.recentPromptContent}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={colors.text.secondary}
                    />
                    <Text
                      style={styles.recentPromptText}
                      numberOfLines={2}
                    >
                      {recentPrompt}
                    </Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
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
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    ...typography.hero,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  promptCard: {
    padding: spacing.lg,
  },
  promptInput: {
    marginBottom: 0,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  characterCountText: {
    ...typography.caption1,
    color: colors.text.tertiary,
  },
  pillsContainer: {
    paddingRight: spacing.lg,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  advancedCard: {
    padding: spacing.lg,
  },
  optionRow: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  optionLabel: {
    ...typography.subheadline,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  optionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  optionButtonActive: {
    backgroundColor: colors.glass.backgroundLight,
    borderColor: colors.glass.borderLight,
  },
  optionButtonText: {
    ...typography.subheadline,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  recentPromptCard: {
    marginBottom: spacing.sm,
  },
  recentPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  recentPromptText: {
    ...typography.subheadline,
    color: colors.text.primary,
    flex: 1,
  },
});
