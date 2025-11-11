import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, StackActions } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme/colors';

const { width } = Dimensions.get('window');

type VideoGenerationScreenRouteProp = RouteProp<
  {
    VideoGeneration: {
      prompt: string;
      image?: string | null;
      model?: string;
      aspectRatio?: string;
    };
  },
  'VideoGeneration'
>;

export default function VideoGenerationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<VideoGenerationScreenRouteProp>();
  const {
    prompt,
    image,
    model = 'Sora 2',
    aspectRatio = 'vertical'
  } = route.params || { prompt: 'Default prompt' };

  console.log('VideoGenerationScreen mounted with:', {
    prompt,
    image: image ? 'Image attached' : 'No image',
    model,
    aspectRatio
  });

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasNavigatedRef = useRef(false);

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

    // Progress bar animation (simulates 0-100% over 8 seconds)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 8000,
      useNativeDriver: false,
    }).start();

    // Navigate to preview screen after 8 seconds
    const timer = setTimeout(() => {
      if (hasNavigatedRef.current) {
        return;
      }

      hasNavigatedRef.current = true;
      console.log('Attempting to navigate to VideoPreview with all params');
      try {
        navigation.dispatch(
          StackActions.replace('VideoPreview' as never, {
            prompt,
            image,
            model,
            aspectRatio
          } as never)
        );
        console.log('Navigation successful');
      } catch (error) {
        console.error('Navigation error:', error);
        hasNavigatedRef.current = false;
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      hasNavigatedRef.current = false;
    };
  }, [navigation, prompt]);

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
          <Text style={styles.statusText}>Generating Your Video</Text>
          <Text style={styles.promptText} numberOfLines={2}>
            {prompt}
          </Text>
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataText}>
              Model: {model} • Aspect Ratio: {aspectRatio === 'vertical' ? '9:16' : '16:9'}
              {image && ' • Image-to-Video'}
            </Text>
          </View>
          <Text style={styles.subText}>This may take a few moments...</Text>
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
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    overflow: 'hidden',
  },
  middleCircle: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
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
