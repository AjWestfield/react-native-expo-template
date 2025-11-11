import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { GlassCard, TemplatePreview } from '../components';
import { Template } from '../types/image';
import { useNavigation } from '@react-navigation/native';

const templates: Template[] = [
  {
    id: 'ring-camera',
    name: 'Ring Camera',
    description: 'Doorbell security camera footage style',
    icon: 'videocam',
    gradient: ['rgba(59, 130, 246, 0.3)', 'rgba(147, 51, 234, 0.3)'],
    previewPrompt: 'A person approaching a front door with a package delivery',
    styleModifier: 'with doorbell camera perspective, night vision effect, motion activated recording aesthetic',
  },
  {
    id: 'security-camera',
    name: 'Security Camera',
    description: 'CCTV surveillance camera aesthetic',
    icon: 'eye',
    gradient: ['rgba(239, 68, 68, 0.3)', 'rgba(251, 146, 60, 0.3)'],
    previewPrompt: 'A busy parking lot with cars and pedestrians',
    styleModifier: 'with CCTV surveillance camera aesthetic, grainy monochrome, wide angle lens, timestamp overlay',
  },
  {
    id: 'smartphone',
    name: 'Smartphone',
    description: 'Mobile phone recording style',
    icon: 'phone-portrait',
    gradient: ['rgba(34, 197, 94, 0.3)', 'rgba(59, 130, 246, 0.3)'],
    previewPrompt: 'Friends laughing together at a casual gathering',
    styleModifier: 'with smartphone camera recording style, portrait mode, natural lighting, handheld perspective',
  },
  {
    id: 'body-cam',
    name: 'Body Camera',
    description: 'Police body camera footage',
    icon: 'body',
    gradient: ['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)'],
    previewPrompt: 'A police officer walking down a street during patrol',
    styleModifier: 'with body camera footage aesthetic, chest-mounted perspective, encrypted overlay, timestamp and GPS data',
  },
  {
    id: 'drone',
    name: 'Drone',
    description: 'Aerial drone footage perspective',
    icon: 'airplane',
    gradient: ['rgba(14, 165, 233, 0.3)', 'rgba(6, 182, 212, 0.3)'],
    previewPrompt: 'Sweeping aerial view of a beautiful coastline with waves',
    styleModifier: 'with aerial drone footage perspective, wide establishing shot, HUD overlay with altitude and speed data',
  },
  {
    id: 'dashcam',
    name: 'Dash Camera',
    description: 'Vehicle dashboard camera view',
    icon: 'car',
    gradient: ['rgba(245, 158, 11, 0.3)', 'rgba(239, 68, 68, 0.3)'],
    previewPrompt: 'Driving through a scenic mountain road during sunset',
    styleModifier: 'with dashboard camera view, driver perspective, speed indicator, GPS coordinates overlay',
  },
];

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleTemplatePress = (template: Template) => {
    console.log('Selected template:', template.name);
    navigation.navigate('ImageGenerator' as never, { template } as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <Text style={styles.title}>Image Templates</Text>
        <Text style={styles.subtitle}>Choose your camera style</Text>
      </View>

      {/* Templates Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + Math.max(insets.bottom, 10) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            activeOpacity={0.7}
            onPress={() => handleTemplatePress(template)}
          >
            <GlassCard style={styles.templateCard}>
              <View style={styles.previewContainer}>
                <TemplatePreview template={template} size="small" />
              </View>

              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>
                  {template.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.tertiary}
              />
            </GlassCard>
          </TouchableOpacity>
        ))}

        {/* Coming Soon Card */}
        <GlassCard style={[styles.templateCard, styles.comingSoonCard]}>
          <View style={[styles.iconContainer, styles.comingSoonIcon]}>
            <Ionicons
              name="add-circle-outline"
              size={32}
              color={colors.text.tertiary}
            />
          </View>

          <View style={styles.templateInfo}>
            <Text style={[styles.templateName, styles.comingSoonText]}>
              More Templates
            </Text>
            <Text style={styles.templateDescription}>
              Coming soon...
            </Text>
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  previewContainer: {
    marginRight: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  comingSoonCard: {
    opacity: 0.6,
  },
  comingSoonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  comingSoonText: {
    color: colors.text.tertiary,
  },
});
