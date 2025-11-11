import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

interface SelectableGlassCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export const SelectableGlassCard: React.FC<SelectableGlassCardProps> = ({
  title,
  description,
  icon,
  selected,
  onPress,
  style,
  compact = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected,
        compact && styles.containerCompact,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BlurView intensity={40} tint="dark" style={[styles.blur, compact && styles.blurCompact]}>
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              selected && styles.iconContainerSelected,
              compact && styles.iconContainerCompact,
            ]}
          >
            <Ionicons
              name={icon}
              size={compact ? 20 : 24}
              color={selected ? colors.text.primary : colors.text.secondary}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
            <Text style={[styles.description, compact && styles.descriptionCompact]}>
              {description}
            </Text>
          </View>

          <View
            style={[
              styles.checkbox,
              selected && styles.checkboxSelected,
              compact && styles.checkboxCompact,
            ]}
          >
            {selected && (
              <Ionicons name="checkmark" size={compact ? 16 : 20} color={colors.text.primary} />
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.glass.backgroundLight,
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginBottom: spacing.md,
  },
  containerSelected: {
    backgroundColor: colors.glass.backgroundMedium,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  containerCompact: {
    marginBottom: spacing.sm,
  },
  blur: {
    padding: spacing.lg,
  },
  blurCompact: {
    padding: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glass.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: colors.glass.backgroundMedium,
  },
  iconContainerCompact: {
    width: 40,
    height: 40,
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  titleCompact: {
    fontSize: 15,
    marginBottom: 2,
  },
  description: {
    ...typography.subheadline,
    color: colors.text.secondary,
  },
  descriptionCompact: {
    fontSize: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.glass.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: colors.glass.backgroundMedium,
  },
  checkboxCompact: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
