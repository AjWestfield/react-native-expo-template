import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius } from '../theme/colors';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  multiline?: boolean;
  height?: number;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  containerStyle,
  multiline = false,
  height,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          height && { height },
        ]}
      >
        <BlurView intensity={20} tint="dark" style={styles.blur}>
          <TextInput
            {...props}
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              height && { height: height - 2 },
            ]}
            placeholderTextColor={colors.text.tertiary}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline={multiline}
          />
        </BlurView>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.subheadline,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  inputContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  inputContainerFocused: {
    borderColor: colors.glass.borderLight,
    borderWidth: 1.5,
  },
  inputContainerError: {
    borderColor: colors.status.error,
  },
  blur: {
    overflow: 'hidden',
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  inputMultiline: {
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  error: {
    ...typography.caption1,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
});
