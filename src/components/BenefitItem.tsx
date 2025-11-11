import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/colors';

interface BenefitItemProps {
  text: string;
}

export const BenefitItem: React.FC<BenefitItemProps> = ({ text }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={24} color={colors.text.primary} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
});
