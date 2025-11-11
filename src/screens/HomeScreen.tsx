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
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { GlassButton, SelectableGlassCard } from '../components';
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from '../theme/colors';

type Model = 'Sora 2' | 'VEO 3.1';
type AspectRatio = 'vertical' | 'horizontal';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model>('Sora 2');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('vertical');
  const [isToolSelectorVisible, setIsToolSelectorVisible] = useState(false);
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to select an image.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const handleGenerate = () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    console.log('Navigating to VideoGeneration with:', {
      prompt,
      image: selectedImage,
      model: selectedModel,
      aspectRatio: selectedAspectRatio
    });

    // Navigate to video generation screen with all parameters
    navigation.navigate('VideoGeneration' as never, {
      prompt,
      image: selectedImage,
      model: selectedModel,
      aspectRatio: selectedAspectRatio
    } as never);

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
                paddingTop: insets.top + spacing.lg,
                paddingBottom: insets.bottom + 100,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Camera Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Ionicons name="videocam" size={40} color={colors.text.primary} />
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Video Generator</Text>
              <Text style={styles.subtitle}>
                Describe your video and let AI create it
              </Text>
            </View>

            {/* Prompt Input */}
            <View style={styles.section}>
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
                  </View>
                  <View style={styles.characterCount}>
                    <Text style={styles.characterCountText}>
                      {characterCount} / {maxCharacters}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Generate Button */}
            <View style={styles.section}>
              <GlassButton
                title={isGenerating ? 'Generating...' : 'Generate Video'}
                onPress={handleGenerate}
                size="large"
                loading={isGenerating}
                disabled={!prompt.trim() || isGenerating}
                leftIcon={<Ionicons name="sparkles" size={20} color={colors.text.primary} />}
              />
            </View>

            {/* Clear Button */}
            <View style={styles.section}>
              <GlassButton
                title="Clear"
                onPress={handleClear}
                size="large"
                leftIcon={<Ionicons name="refresh" size={20} color={colors.text.primary} />}
              />
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
                    </View>

                    {/* Aspect Ratio Selection */}
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
    justifyContent: 'center',
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
    paddingHorizontal: spacing.lg,
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
    paddingHorizontal: spacing.lg,
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
});
