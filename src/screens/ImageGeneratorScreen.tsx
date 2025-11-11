import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassPill,
  ProgressGlass,
  TemplatePreview,
} from '../components';
import { colors, typography, spacing } from '../theme/colors';
import { ImageStyle, ImageAspectRatio, ImageQuality, Template, GeneratedImage } from '../types/image';

interface ImageGeneratorScreenProps {
  route?: {
    params?: {
      template?: Template;
    };
  };
}

const STYLE_PRESETS: { value: ImageStyle; label: string; icon: string }[] = [
  { value: 'photorealistic', label: 'Photo', icon: 'camera' },
  { value: 'artistic', label: 'Artistic', icon: 'color-palette' },
  { value: 'sketch', label: 'Sketch', icon: 'pencil' },
  { value: 'cartoon', label: 'Cartoon', icon: 'happy' },
  { value: 'oil-painting', label: 'Oil', icon: 'brush' },
  { value: 'watercolor', label: 'Watercolor', icon: 'water' },
];

const ASPECT_RATIOS: ImageAspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const QUALITY_OPTIONS: ImageQuality[] = ['standard', 'hd', 'ultra-hd'];

export const ImageGeneratorScreen: React.FC<ImageGeneratorScreenProps> = ({ route }) => {
  const selectedTemplate = route?.params?.template;
  const navigation = useNavigation();

  const [prompt, setPrompt] = useState(selectedTemplate?.previewPrompt || '');
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('photorealistic');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [quality, setQuality] = useState<ImageQuality>('hd');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationState, setGenerationState] = useState({
    isGenerating: false,
    progress: 0,
  });
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      Alert.alert('Missing Prompt', 'Please enter a prompt to generate an image.');
      return;
    }

    setGenerationState({ isGenerating: true, progress: 0 });

    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationState((prev) => {
        const newProgress = prev.progress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setGenerationState({ isGenerating: false, progress: 0 });
            Alert.alert(
              'Image Generated! 🎨',
              `Your ${selectedStyle} image has been created${selectedTemplate ? ` with ${selectedTemplate.name} style` : ''}!`,
              [
                {
                  text: 'View Gallery',
                  onPress: () => navigation.navigate('ImageGallery' as never),
                },
                { text: 'Generate Another', style: 'cancel' },
              ]
            );

            // Add to recent prompts
            if (!recentPrompts.includes(prompt)) {
              setRecentPrompts((prev) => [prompt, ...prev].slice(0, 5));
            }
          }, 500);
          return { isGenerating: false, progress: 100 };
        }
        return { isGenerating: true, progress: newProgress };
      });
    }, 400);
  };

  const getQualityLabel = (q: ImageQuality) => {
    switch (q) {
      case 'standard':
        return 'Standard';
      case 'hd':
        return 'HD';
      case 'ultra-hd':
        return 'Ultra HD';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Image Generator</Text>
              {selectedTemplate && (
                <Text style={styles.subtitle}>
                  Using {selectedTemplate.name} template
                </Text>
              )}
            </View>
            <Ionicons name="image" size={32} color={colors.text.white} />
          </View>

          {/* Template Preview */}
          {selectedTemplate && (
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Template Preview</Text>
              <View style={styles.templatePreviewContainer}>
                <TemplatePreview template={selectedTemplate} size="large" />
              </View>
              <Text style={styles.templateDescription}>
                {selectedTemplate.description}
              </Text>
            </GlassCard>
          )}

          {/* Prompt Input */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Describe Your Image</Text>
            <GlassInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder={
                selectedTemplate?.previewPrompt ||
                'A serene landscape with mountains at sunset...'
              }
              multiline
              numberOfLines={4}
              maxLength={500}
              style={styles.promptInput}
            />
            <Text style={styles.charCount}>{prompt.length}/500</Text>

            {/* Recent Prompts */}
            {recentPrompts.length > 0 && (
              <View style={styles.recentPrompts}>
                <Text style={styles.recentPromptsTitle}>Recent</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentPromptsList}
                >
                  {recentPrompts.map((recentPrompt, index) => (
                    <GlassPill
                      key={index}
                      label={recentPrompt}
                      isActive={false}
                      onPress={() => setPrompt(recentPrompt)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </GlassCard>

          {/* Style Selection */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Style</Text>
            <View style={styles.styleGrid}>
              {STYLE_PRESETS.map((style) => (
                <GlassButton
                  key={style.value}
                  variant={selectedStyle === style.value ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => setSelectedStyle(style.value)}
                  style={styles.styleButton}
                >
                  <View style={styles.styleButtonContent}>
                    <Ionicons
                      name={style.icon as any}
                      size={18}
                      color={
                        selectedStyle === style.value
                          ? colors.text.white
                          : colors.text.medium
                      }
                    />
                    <Text
                      style={[
                        styles.styleButtonText,
                        selectedStyle === style.value && styles.styleButtonTextActive,
                      ]}
                    >
                      {style.label}
                    </Text>
                  </View>
                </GlassButton>
              ))}
            </View>
          </GlassCard>

          {/* Advanced Options */}
          <GlassCard style={styles.section}>
            <GlassButton
              variant="secondary"
              size="small"
              onPress={() => setShowAdvanced(!showAdvanced)}
              style={styles.advancedToggle}
            >
              <View style={styles.advancedToggleContent}>
                <Text style={styles.advancedToggleText}>Advanced Options</Text>
                <Ionicons
                  name={showAdvanced ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.text.white}
                />
              </View>
            </GlassButton>

            {showAdvanced && (
              <View style={styles.advancedOptions}>
                {/* Aspect Ratio */}
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>Aspect Ratio</Text>
                  <View style={styles.optionPills}>
                    {ASPECT_RATIOS.map((ratio) => (
                      <GlassPill
                        key={ratio}
                        label={ratio}
                        isActive={aspectRatio === ratio}
                        onPress={() => setAspectRatio(ratio)}
                      />
                    ))}
                  </View>
                </View>

                {/* Quality */}
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>Quality</Text>
                  <View style={styles.optionPills}>
                    {QUALITY_OPTIONS.map((q) => (
                      <GlassPill
                        key={q}
                        label={getQualityLabel(q)}
                        isActive={quality === q}
                        onPress={() => setQuality(q)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </GlassCard>

          {/* Progress */}
          {generationState.isGenerating && (
            <GlassCard style={styles.section}>
              <ProgressGlass
                progress={generationState.progress}
                label="Generating your image..."
              />
            </GlassCard>
          )}

          {/* Generate Button */}
          <GlassButton
            variant="primary"
            size="large"
            onPress={handleGenerate}
            disabled={generationState.isGenerating || !prompt.trim()}
            style={styles.generateButton}
          >
            <View style={styles.generateButtonContent}>
              <Ionicons
                name={generationState.isGenerating ? 'hourglass' : 'sparkles'}
                size={20}
                color={colors.text.white}
              />
              <Text style={styles.generateButtonText}>
                {generationState.isGenerating ? 'Generating...' : 'Generate Image'}
              </Text>
            </View>
          </GlassButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.text.white,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.medium,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text.white,
    marginBottom: spacing.md,
  },
  templatePreviewContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  templateDescription: {
    ...typography.body,
    color: colors.text.medium,
    textAlign: 'center',
  },
  promptInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption2,
    color: colors.text.medium,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  recentPrompts: {
    marginTop: spacing.md,
  },
  recentPromptsTitle: {
    ...typography.caption1,
    color: colors.text.medium,
    marginBottom: spacing.xs,
  },
  recentPromptsList: {
    gap: spacing.xs,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  styleButton: {
    flexBasis: '31%',
    minWidth: 100,
  },
  styleButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs,
  },
  styleButtonText: {
    ...typography.caption1,
    color: colors.text.medium,
    fontSize: 11,
  },
  styleButtonTextActive: {
    color: colors.text.white,
  },
  advancedToggle: {
    marginBottom: spacing.md,
  },
  advancedToggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advancedToggleText: {
    ...typography.body,
    color: colors.text.white,
  },
  advancedOptions: {
    gap: spacing.lg,
  },
  option: {
    gap: spacing.sm,
  },
  optionLabel: {
    ...typography.caption1,
    color: colors.text.medium,
    fontWeight: '600',
  },
  optionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  generateButton: {
    marginTop: spacing.md,
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  generateButtonText: {
    ...typography.body,
    color: colors.text.white,
    fontWeight: '600',
  },
});
