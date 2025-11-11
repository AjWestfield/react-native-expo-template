import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import { GlassButton, SelectableGlassCard } from '../components';
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from '../theme/colors';
import { useResponsive } from '../hooks/useResponsive';
import { createCenteredContainer, getResponsiveSpacing, getResponsiveFontSize } from '../utils/responsive';

type Model = 'Sora 2' | 'VEO 3.1' | 'Watermark Remover';
type AspectRatio = 'vertical' | 'horizontal';
type Duration = '10' | '15' | '8'; // Sora 2: 10s or 15s, VEO 3.1: 8s (fixed)

type RootNavigation = NavigationProp<Record<string, object | undefined>>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigation>();
  const responsive = useResponsive();
  const responsiveSpacing = getResponsiveSpacing(responsive);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model>('Sora 2');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('vertical');
  const [selectedDuration, setSelectedDuration] = useState<Duration>('10');
  const [isToolSelectorVisible, setIsToolSelectorVisible] = useState(false);
  const [isDurationSelectorVisible, setIsDurationSelectorVisible] = useState(false);
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUrlError, setVideoUrlError] = useState('');
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const previewPlayer = useVideoPlayer(
    videoUrl ? { uri: videoUrl } : null,
    (playerInstance) => {
      playerInstance.loop = false;
      playerInstance.pause();
    }
  );

  // Responsive container style
  const containerStyle = createCenteredContainer(
    responsive.isDesktop || responsive.isLargeDesktop ? 'medium' : 'small',
    responsive
  );
  const titleFontSize = getResponsiveFontSize(32, responsive);
  const subtitleFontSize = getResponsiveFontSize(16, responsive);

  // Auto-update duration when model changes
  React.useEffect(() => {
    if (selectedModel === 'VEO 3.1') {
      setSelectedDuration('8'); // VEO is always 8 seconds
    } else if (selectedModel === 'Sora 2' && selectedDuration === '8') {
      setSelectedDuration('10'); // Reset to Sora default if coming from VEO
    }
  }, [selectedModel]);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to select an image.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setIsImagePreviewVisible(false);
  };

  const handleImagePress = () => {
    setIsImagePreviewVisible(true);
  };

  const handleReplaceImage = () => {
    setIsImagePreviewVisible(false);
    setTimeout(() => pickImage(), 300);
  };

  const validateVideoUrl = (url: string): boolean => {
    if (!url.trim()) {
      setVideoUrlError('Please enter a video URL');
      return false;
    }
    if (!url.startsWith('https://sora.chatgpt.com/')) {
      setVideoUrlError('URL must start with https://sora.chatgpt.com/');
      return false;
    }
    setVideoUrlError('');
    return true;
  };

  const handleGenerate = () => {
    if (selectedModel === 'Watermark Remover') {
      if (!validateVideoUrl(videoUrl)) {
        return;
      }
      navigation.navigate('VideoGeneration', {
        prompt: 'Removing watermark...',
        videoUrl,
        model: selectedModel,
        aspectRatio: 'vertical',
        duration: '10',
      });
      setVideoUrl('');
      return;
    }

    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    console.log('Navigating to VideoGeneration with:', {
      prompt,
      image: selectedImage,
      model: selectedModel,
      aspectRatio: selectedAspectRatio,
      duration: selectedDuration
    });

    // Navigate to video generation screen with all parameters
    navigation.navigate('VideoGeneration', {
      prompt,
      image: selectedImage,
      model: selectedModel,
      aspectRatio: selectedAspectRatio,
      duration: selectedDuration
    });

    setPrompt('');
    setSelectedImage(null);
  };

  const handleClear = () => {
    setPrompt('');
    setSelectedImage(null);
  };

  const characterCount = prompt.length;
  const maxCharacters = 500;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.contentContainer,
              {
                paddingTop: insets.top + responsiveSpacing.vertical,
                paddingBottom:
                  insets.bottom + (responsive.shouldUseSidebar ? responsiveSpacing.vertical : 100),
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={containerStyle}>
              {/* Camera Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    marginBottom: responsiveSpacing.gap,
                    alignSelf: 'center',
                  },
                ]}
              >
                <View style={styles.iconBackground}>
                  <Ionicons name="videocam" size={40} color={colors.text.primary} />
                </View>
              </View>

              {/* Title Section */}
              <View
                style={[
                  styles.headerSection,
                  {
                    marginBottom: responsiveSpacing.gap,
                    alignItems: 'center',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.title,
                    {
                      fontSize: titleFontSize,
                      textAlign: 'center',
                    },
                  ]}
                >
                  Video Generator
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    {
                      fontSize: subtitleFontSize,
                      textAlign: 'center',
                    },
                  ]}
                >
                  Describe your video and let AI create it
                </Text>
              </View>

            {/* Conditional Input: Video URL for Watermark Remover, Prompt for others */}
            <View style={[styles.section, { marginBottom: responsiveSpacing.gap }]}>
              {selectedModel === 'Watermark Remover' ? (
                /* Video URL Input for Watermark Remover */
                <View style={styles.videoUrlContainer}>
                  <TextInput
                    style={[styles.videoUrlInput, videoUrlError && styles.inputError]}
                    placeholder="Paste Sora video URL (https://sora.chatgpt.com/...)"
                    placeholderTextColor={colors.text.tertiary}
                    value={videoUrl}
                    onChangeText={(text) => {
                      setVideoUrl(text);
                      setVideoUrlError('');
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    editable={true}
                    contextMenuHidden={false}
                  />
                  {videoUrlError && <Text style={styles.errorText}>{videoUrlError}</Text>}

                  {/* Preview button */}
                  {videoUrl.trim() && !videoUrlError && (
                    <TouchableOpacity
                      style={styles.previewButton}
                      onPress={() => setShowVideoPreview(true)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="play-circle-outline" size={20} color={colors.text.primary} />
                      <Text style={styles.previewButtonText}>Preview Video</Text>
                    </TouchableOpacity>
                  )}

                  {/* Tool Selector Button (model only, no aspect ratio/duration) */}
                  <View style={styles.videoUrlFooter}>
                    <TouchableOpacity
                      style={styles.toolSelectorButton}
                      onPress={() => setIsToolSelectorVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="videocam-outline" size={18} color={colors.text.secondary} />
                      <Text style={styles.toolSelectorText}>
                        {selectedModel}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Prompt Input for Sora 2 and VEO 3.1 */
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your video prompt here..."
                    placeholderTextColor={colors.text.tertiary}
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline
                    maxLength={maxCharacters}
                    textAlignVertical="top"
                  />
                  <View style={styles.inputFooter}>
                    <View style={styles.leftFooterButtons}>
                    {selectedImage ? (
                      <TouchableOpacity
                        style={styles.imagePreviewButton}
                        onPress={handleImagePress}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: selectedImage }}
                          style={styles.previewImage}
                          resizeMode="cover"
                        />
                        <View style={styles.removePreviewButton}>
                          <Ionicons name="close" size={12} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.imageIconButton}
                        onPress={pickImage}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="image-outline" size={20} color={colors.text.secondary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.toolSelectorButton}
                      onPress={() => setIsToolSelectorVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="videocam-outline" size={18} color={colors.text.secondary} />
                      <Text style={styles.toolSelectorText}>
                        {selectedModel} • {selectedAspectRatio === 'vertical' ? '9:16' : '16:9'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.durationButton,
                        selectedModel === 'VEO 3.1' && styles.durationButtonDisabled
                      ]}
                      onPress={() => selectedModel === 'Sora 2' && setIsDurationSelectorVisible(true)}
                      activeOpacity={selectedModel === 'Sora 2' ? 0.7 : 1}
                      disabled={selectedModel === 'VEO 3.1'}
                    >
                      <View style={styles.durationIconContainer}>
                        <Ionicons
                          name="time"
                          size={16}
                          color={selectedModel === 'VEO 3.1' ? colors.text.tertiary : '#667EEA'}
                        />
                      </View>
                      <Text style={[
                        styles.durationText,
                        selectedModel === 'VEO 3.1' && styles.durationTextDisabled
                      ]}>
                        {selectedDuration}s
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.characterCount}>
                    <Text style={styles.characterCountText}>
                      {characterCount} / {maxCharacters}
                    </Text>
                  </View>
                </View>
              </View>
              )}
            </View>

            {/* Generate Button */}
            <View style={[styles.section, { marginBottom: responsiveSpacing.gap }]}>
              <GlassButton
                title={isGenerating ? 'Generating...' : selectedModel === 'Watermark Remover' ? 'Remove Watermark' : 'Generate Video'}
                onPress={handleGenerate}
                size="large"
                loading={isGenerating}
                disabled={
                  selectedModel === 'Watermark Remover'
                    ? !videoUrl.trim() || isGenerating
                    : !prompt.trim() || isGenerating
                }
                leftIcon={<Ionicons name={selectedModel === 'Watermark Remover' ? 'color-wand' : 'sparkles'} size={20} color={colors.text.primary} />}
              />
            </View>

            {/* Clear Button */}
            <View style={[styles.section, { marginBottom: responsiveSpacing.vertical }]}>
              <GlassButton
                title="Clear"
                onPress={handleClear}
                size="large"
                leftIcon={<Ionicons name="refresh" size={20} color={colors.text.primary} />}
              />
            </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Tool Selector Modal */}
      <Modal
        visible={isToolSelectorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsToolSelectorVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsToolSelectorVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContainer}>
                <BlurView intensity={80} tint="dark" style={styles.modalBlur}>
                  <ScrollView
                    style={styles.modalScrollView}
                    contentContainerStyle={styles.modalContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Tool Settings</Text>
                      <TouchableOpacity
                        onPress={() => setIsToolSelectorVisible(false)}
                        style={styles.closeButton}
                      >
                        <Ionicons name="close" size={24} color={colors.text.primary} />
                      </TouchableOpacity>
                    </View>

                    {/* Model Selection */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Model</Text>
                      <SelectableGlassCard
                        title="Sora 2"
                        description="OpenAI's latest video model"
                        icon="flash"
                        selected={selectedModel === 'Sora 2'}
                        onPress={() => setSelectedModel('Sora 2')}
                        compact
                      />
                      <SelectableGlassCard
                        title="VEO 3.1"
                        description="Google's latest video model"
                        icon="sparkles"
                        selected={selectedModel === 'VEO 3.1'}
                        onPress={() => setSelectedModel('VEO 3.1')}
                        compact
                      />
                      <SelectableGlassCard
                        title="Watermark Remover"
                        description="Remove watermarks from Sora videos"
                        icon="image-outline"
                        selected={selectedModel === 'Watermark Remover'}
                        onPress={() => setSelectedModel('Watermark Remover')}
                        compact
                      />
                    </View>

                    {/* Aspect Ratio Selection - Hide for Watermark Remover */}
                    {selectedModel !== 'Watermark Remover' && (
                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Aspect Ratio</Text>
                        <SelectableGlassCard
                          title="Vertical"
                          description="9:16 for mobile"
                          icon="phone-portrait"
                          selected={selectedAspectRatio === 'vertical'}
                          onPress={() => setSelectedAspectRatio('vertical')}
                          compact
                        />
                        <SelectableGlassCard
                          title="Horizontal"
                          description="16:9 for desktop"
                          icon="phone-landscape"
                          selected={selectedAspectRatio === 'horizontal'}
                          onPress={() => setSelectedAspectRatio('horizontal')}
                          compact
                        />
                      </View>
                    )}

                    {/* Done Button */}
                    <GlassButton
                      title="Done"
                      onPress={() => setIsToolSelectorVisible(false)}
                      size="large"
                    />
                  </ScrollView>
                </BlurView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={isImagePreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImagePreviewVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsImagePreviewVisible(false)}>
          <View style={styles.imageModalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.imageModalContainer}>
                <BlurView intensity={80} tint="dark" style={styles.imageModalBlur}>
                  <View style={styles.imageModalContent}>
                    {/* Image Preview */}
                    <View style={styles.imagePreviewContainer}>
                      {selectedImage && (
                        <Image
                          source={{ uri: selectedImage }}
                          style={styles.fullPreviewImage}
                          resizeMode="contain"
                        />
                      )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.imageModalActions}>
                      <GlassButton
                        title="Remove Image"
                        onPress={removeImage}
                        size="large"
                        leftIcon={<Ionicons name="trash-outline" size={20} color={colors.text.primary} />}
                      />
                      <GlassButton
                        title="Replace Image"
                        onPress={handleReplaceImage}
                        size="large"
                        leftIcon={<Ionicons name="images-outline" size={20} color={colors.text.primary} />}
                      />
                      <GlassButton
                        title="Keep Image"
                        onPress={() => setIsImagePreviewVisible(false)}
                        size="large"
                        leftIcon={<Ionicons name="checkmark" size={20} color={colors.text.primary} />}
                      />
                    </View>
                  </View>
                </BlurView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Duration Selector Modal */}
      <Modal
        visible={isDurationSelectorVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDurationSelectorVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDurationSelectorVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.durationModalContainer}>
                <BlurView intensity={90} tint="dark" style={styles.modalBlur}>
                  <View style={styles.durationModalContent}>
                    {/* Modal Header with Icon */}
                    <View style={styles.durationModalHeader}>
                      <View style={styles.durationHeaderIcon}>
                        <LinearGradient
                          colors={['#667EEA', '#764BA2']}
                          style={styles.durationIconGradient}
                        >
                          <Ionicons name="time" size={28} color={colors.text.primary} />
                        </LinearGradient>
                      </View>
                      <Text style={styles.durationModalTitle}>Video Duration</Text>
                      <Text style={styles.durationModalSubtitle}>
                        Choose the length of your {selectedModel} video
                      </Text>
                    </View>

                    {/* Duration Options */}
                    <View style={styles.durationOptionsContainer}>
                      <TouchableOpacity
                        style={[
                          styles.durationOption,
                          selectedDuration === '10' && styles.durationOptionSelected
                        ]}
                        onPress={() => setSelectedDuration('10')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.durationOptionContent}>
                          <View style={[
                            styles.durationRadio,
                            selectedDuration === '10' && styles.durationRadioSelected
                          ]}>
                            {selectedDuration === '10' && (
                              <View style={styles.durationRadioInner} />
                            )}
                          </View>
                          <View style={styles.durationOptionText}>
                            <Text style={styles.durationOptionTitle}>10 Seconds</Text>
                            <Text style={styles.durationOptionDescription}>
                              Standard duration • Faster generation
                            </Text>
                          </View>
                          <View style={styles.durationBadge}>
                            <Ionicons name="checkmark-circle" size={24} color={selectedDuration === '10' ? '#667EEA' : colors.text.tertiary} />
                          </View>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.durationOption,
                          selectedDuration === '15' && styles.durationOptionSelected
                        ]}
                        onPress={() => setSelectedDuration('15')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.durationOptionContent}>
                          <View style={[
                            styles.durationRadio,
                            selectedDuration === '15' && styles.durationRadioSelected
                          ]}>
                            {selectedDuration === '15' && (
                              <View style={styles.durationRadioInner} />
                            )}
                          </View>
                          <View style={styles.durationOptionText}>
                            <Text style={styles.durationOptionTitle}>15 Seconds</Text>
                            <Text style={styles.durationOptionDescription}>
                              Extended duration • More content
                            </Text>
                          </View>
                          <View style={styles.durationBadge}>
                            <Ionicons name="checkmark-circle" size={24} color={selectedDuration === '15' ? '#667EEA' : colors.text.tertiary} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.durationModalActions}>
                      <GlassButton
                        title="Apply"
                        onPress={() => setIsDurationSelectorVisible(false)}
                        size="large"
                        leftIcon={<Ionicons name="checkmark" size={20} color={colors.text.primary} />}
                      />
                    </View>
                  </View>
                </BlurView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Video Preview Modal */}
      <Modal
        visible={showVideoPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVideoPreview(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowVideoPreview(false)}>
          <View style={styles.videoModalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.videoModalContainer}>
                <BlurView intensity={80} tint="dark" style={styles.videoModalBlur}>
                  <View style={styles.videoModalContent}>
                    {/* Modal Header */}
                    <View style={styles.videoModalHeader}>
                      <Text style={styles.videoModalTitle}>Video Preview</Text>
                      <TouchableOpacity
                        onPress={() => setShowVideoPreview(false)}
                        style={styles.closeButton}
                      >
                        <Ionicons name="close" size={24} color={colors.text.primary} />
                      </TouchableOpacity>
                    </View>

                    {/* Video Preview */}
                    <View style={styles.videoPreviewContainer}>
                      {videoUrl ? (
                        <VideoView
                          style={styles.previewVideo}
                          player={previewPlayer}
                          nativeControls
                          contentFit="contain"
                        />
                      ) : (
                        <View style={[styles.previewVideo, styles.previewVideoPlaceholder]}>
                          <Text style={styles.previewVideoPlaceholderText}>Enter a video URL to preview</Text>
                        </View>
                      )}
                    </View>

                    {/* URL Display */}
                    <Text style={styles.videoUrlText} numberOfLines={2}>
                      {videoUrl}
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.videoModalActions}>
                      <GlassButton
                        title="Remove Watermark"
                        onPress={() => {
                          setShowVideoPreview(false);
                          handleGenerate();
                        }}
                        size="large"
                        leftIcon={<Ionicons name="color-wand" size={20} color={colors.text.primary} />}
                      />
                    </View>
                  </View>
                </BlurView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 45, 45, 1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: 'rgba(30, 30, 30, 1)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 60, 1)',
    padding: spacing.lg,
    minHeight: 160,
  },
  textInput: {
    ...typography.body,
    color: colors.text.primary,
    minHeight: 100,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  leftFooterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  imageIconButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(45, 45, 45, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    overflow: 'visible',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.6)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md - 2,
  },
  removePreviewButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 45, 45, 0.8)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    height: 36,
  },
  toolSelectorText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  characterCount: {
    alignItems: 'flex-end',
  },
  characterCountText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '75%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  modalBlur: {
    borderRadius: borderRadius.xl,
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalContent: {
    padding: spacing.lg,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(45, 45, 45, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSection: {
    marginBottom: spacing.md,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  imageModalBlur: {
    borderRadius: borderRadius.xl,
  },
  imageModalContent: {
    padding: spacing.xl,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 300,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPreviewImage: {
    width: '100%',
    height: '100%',
  },
  imageModalActions: {
    gap: spacing.md,
  },
  durationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  durationButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  durationIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  durationTextDisabled: {
    color: colors.text.tertiary,
  },
  durationModalContainer: {
    width: '90%',
    maxWidth: 420,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  durationModalContent: {
    padding: spacing.xl,
    backgroundColor: 'rgba(10, 10, 10, 0.98)',
  },
  durationModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  durationHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  durationIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  durationModalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  durationOptionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  durationOption: {
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  durationOptionSelected: {
    borderColor: '#667EEA',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  durationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  durationRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.text.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationRadioSelected: {
    borderColor: '#667EEA',
  },
  durationRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667EEA',
  },
  durationOptionText: {
    flex: 1,
  },
  durationOptionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  durationOptionDescription: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  durationBadge: {
    opacity: 1,
  },
  durationModalActions: {
    gap: spacing.sm,
  },
  // Watermark Remover Styles
  videoUrlContainer: {
    backgroundColor: 'rgba(30, 30, 30, 1)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 60, 1)',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  videoUrlInput: {
    ...typography.body,
    color: colors.text.primary,
    minHeight: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginTop: -spacing.xs,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    alignSelf: 'flex-start',
  },
  previewButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  videoUrlFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoModalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  videoModalBlur: {
    borderRadius: borderRadius.xl,
  },
  videoModalContent: {
    padding: spacing.xl,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  videoModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  videoPreviewContainer: {
    width: '100%',
    height: 300,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  previewVideoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  previewVideoPlaceholderText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  videoUrlText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  videoModalActions: {
    gap: spacing.sm,
  },
});
