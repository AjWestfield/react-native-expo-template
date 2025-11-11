import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Alert, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme/colors';
import { useKieAI } from '../hooks/useKieAI';
import { KieAIModel } from '../types/kieai';
import { useResponsive } from '../hooks/useResponsive';
import { kieAIService } from '../services/kieai.service';

type VideoGenerationScreenRouteProp = RouteProp<
  {
    VideoGeneration: {
      prompt: string;
      image?: string | null;
      videoUrl?: string; // For watermark removal
      model?: string;
      aspectRatio?: string;
      duration?: string;
    };
  },
  'VideoGeneration'
>;

type RootNavigation = NavigationProp<Record<string, object | undefined>>;

export default function VideoGenerationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<VideoGenerationScreenRouteProp>();
  const responsive = useResponsive();
  const { width } = useWindowDimensions();
  const {
    prompt,
    image,
    videoUrl: inputVideoUrl,
    model = 'Sora 2',
    aspectRatio = 'vertical',
    duration = '10'
  } = route.params || { prompt: 'Default prompt' };

  // Constrain circle sizes for desktop
  const maxCircleWidth = Math.min(width * 0.8, 600);
  const outerCircleSize = Math.min(width * 0.8, 500);
  const middleCircleSize = Math.min(width * 0.6, 375);

  console.log('VideoGenerationScreen mounted with:', {
    prompt,
    image: image ? 'Image attached' : 'No image',
    inputVideoUrl: inputVideoUrl ? 'Video URL provided' : 'No video URL',
    model,
    aspectRatio
  });

  // KIEAI hook
  const { generateVideo, loading, error, videoUrl, progress, taskId } = useKieAI();
  const [fallbackResultUrl, setFallbackResultUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Submitting request...');

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasNavigatedRef = useRef(false);
  const hasStartedRef = useRef(false);

  const navigateToPreview = useCallback(
    (url: string | null) => {
      if (!url || hasNavigatedRef.current) {
        return;
      }

      hasNavigatedRef.current = true;

      navigation.replace('VideoPreview', {
        videoUrl: url,
        prompt,
        image,
        model,
        aspectRatio,
        duration,
        shouldAutoPlay: true,
      });
    },
    [navigation, prompt, image, model, aspectRatio, duration]
  );

  const extractResultUrl = useCallback((resultJson?: string | null) => {
    if (!resultJson || typeof resultJson !== 'string') {
      return null;
    }

    try {
      const parsed = JSON.parse(resultJson);
      const candidates = [
        parsed.resultUrls,
        parsed.resultUrl,
        parsed.resultWaterMarkUrls,
        parsed.resultWatermarkUrls,
        parsed.resultVideoUrls,
        parsed.resultVideoUrl,
      ];

      for (const candidate of candidates) {
        if (!candidate) {
          continue;
        }

        if (Array.isArray(candidate)) {
          const urlCandidate = candidate.find((value) => typeof value === 'string' && value.startsWith('http'));
          if (urlCandidate) {
            return urlCandidate;
          }
        } else if (typeof candidate === 'string' && candidate.startsWith('http')) {
          return candidate;
        }
      }
    } catch (error) {
      console.error('Failed to parse resultJson', error);
    }

    return null;
  }, []);

  // Start video generation on mount (guarded against React 18 double-invoke)
  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    let isMounted = true;

    const startGeneration = async () => {
      try {
        setStatusMessage('Preparing your request...');

        if (model === 'Watermark Remover' && inputVideoUrl) {
          console.log('Starting watermark removal with:', {
            model,
            inputVideoUrl,
          });

          const generatedUrl = await generateVideo({
            prompt,
            model: model as KieAIModel,
            videoUrl: inputVideoUrl,
          });

          if (isMounted) {
            navigateToPreview(generatedUrl);
          }
        } else {
          const videoAspectRatio = aspectRatio === 'vertical' ? '9:16' : '16:9';
          const imageUrls = image ? [image] : undefined;

          console.log('Starting video generation with:', {
            model,
            prompt,
            aspectRatio: videoAspectRatio,
            duration,
            hasImage: !!imageUrls
          });

          const generatedUrl = await generateVideo({
            prompt,
            model: model as KieAIModel,
            imageUrls,
            aspectRatio: videoAspectRatio,
            duration: duration as '10' | '15' | '8',
          });

          if (isMounted) {
            navigateToPreview(generatedUrl);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate video';
        console.error('Video generation error:', errorMessage);

        Alert.alert(
          'Generation Failed',
          errorMessage,
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    };

    startGeneration();

    return () => {
      isMounted = false;
    };
  }, [navigateToPreview, aspectRatio, duration, generateVideo, image, inputVideoUrl, model, prompt]);

  // Update status message based on progress
  useEffect(() => {
    switch (progress) {
      case 'idle':
        setStatusMessage('Preparing your request...');
        break;
      case 'submitting':
        setStatusMessage('Submitting request...');
        break;
      case 'queueing':
        setStatusMessage('Request queued...');
        break;
      case 'wait':
        setStatusMessage('Waiting in queue...');
        break;
      case 'generating':
        setStatusMessage('Generating your video...');
        break;
      case 'success':
        setStatusMessage('Video ready!');
        break;
      case 'fail':
        setStatusMessage('Generation failed');
        break;
    }
  }, [progress]);

  // Navigate once we have any video URL (primary or fallback)
  useEffect(() => {
    const resolvedUrl = videoUrl || fallbackResultUrl;
    if (resolvedUrl) {
      console.log('Video ready, navigating to preview:', resolvedUrl);
      navigateToPreview(resolvedUrl);
    }
  }, [videoUrl, fallbackResultUrl, navigateToPreview]);

  // Fallback: if we know the task succeeded but hook didn't yield a URL yet, fetch directly
  useEffect(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    if (progress !== 'success' || !taskId || fallbackResultUrl || videoUrl) {
      return;
    }

    let isActive = true;

    const fetchResult = async () => {
      try {
        const status = await kieAIService.getSoraTaskStatus(taskId);
        const parsedUrl = extractResultUrl(status?.data?.resultJson);

        if (parsedUrl && isActive) {
          setFallbackResultUrl(parsedUrl);
        }
      } catch (error) {
        console.error('Fallback task status fetch failed:', error);
      }
    };

    fetchResult();

    return () => {
      isActive = false;
    };
  }, [progress, taskId, fallbackResultUrl, videoUrl, extractResultUrl]);

  // UI Animations
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the center icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Progress bar animation (simulates progress while generating)
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 0.9,
            duration: 30000, // 30 seconds to reach 90%
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0.9,
            duration: 30000, // Hold at 90%
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else if (videoUrl) {
      // Complete the progress bar when done
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [loading, videoUrl]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Animated circles background */}
        <Animated.View
          style={[
            styles.outerCircle,
            {
              width: outerCircleSize,
              height: outerCircleSize,
              borderRadius: outerCircleSize / 2,
              transform: [{ rotate: spin }, { scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.2)', 'rgba(118, 75, 162, 0.2)']}
            style={styles.gradientCircle}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.middleCircle,
            {
              width: middleCircleSize,
              height: middleCircleSize,
              borderRadius: middleCircleSize / 2,
              transform: [
                { rotate: spin },
                { scale: Animated.multiply(pulseAnim, 0.9) },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']}
            style={styles.gradientCircle}
          />
        </Animated.View>

        {/* Center icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.iconGradient}
          >
            <Ionicons name="videocam" size={64} color={colors.text.primary} />
          </LinearGradient>
        </Animated.View>

        {/* Status text */}
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>{statusMessage}</Text>
          <Text style={styles.promptText} numberOfLines={2}>
            {prompt}
          </Text>
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataText}>
              {model === 'Watermark Remover'
                ? 'Removing Sora watermark...'
                : `Model: ${model} • Aspect Ratio: ${aspectRatio === 'vertical' ? '9:16' : '16:9'}${image ? ' • Image-to-Video' : ''}`
              }
            </Text>
          </View>
          {error ? (
            <Text style={[styles.subText, { color: '#FF6B6B' }]}>{error}</Text>
          ) : (
            <Text style={styles.subText}>
              {progress === 'generating' ? 'AI is crafting your video...' : 'This may take a few moments...'}
            </Text>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                },
              ]}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
        </View>

        {/* Loading dots */}
        <View style={styles.dotsContainer}>
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
        </View>
      </Animated.View>
    </View>
  );
}

const LoadingDot = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay]);

  return <Animated.View style={[styles.dot, { opacity }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  outerCircle: {
    position: 'absolute',
    overflow: 'hidden',
  },
  middleCircle: {
    position: 'absolute',
    overflow: 'hidden',
  },
  gradientCircle: {
    flex: 1,
    borderRadius: 999,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    marginBottom: spacing.xl * 2,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  statusText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  promptText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  metadataContainer: {
    marginBottom: spacing.sm,
  },
  metadataText: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  subText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.primary,
  },
});
