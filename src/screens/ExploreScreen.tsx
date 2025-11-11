import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.text.muted}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'Technology', 'Design', 'Business', 'Health', 'Travel'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                category === 'All' && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === 'All' && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Explore Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discover</Text>
        {[1, 2, 3, 4].map((item) => (
          <TouchableOpacity key={item} style={styles.exploreCard}>
            <View style={styles.exploreImagePlaceholder}>
              <Ionicons name="image-outline" size={32} color={colors.text.muted} />
            </View>
            <View style={styles.exploreContent}>
              <Text style={styles.exploreTitle}>Explore Item {item}</Text>
              <Text style={styles.exploreDescription}>
                Discover amazing content and connect with others
              </Text>
              <View style={styles.exploreMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="eye-outline" size={14} color={colors.text.muted} />
                  <Text style={styles.metaText}>2.3k</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="heart-outline" size={14} color={colors.text.muted} />
                  <Text style={styles.metaText}>456</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  exploreCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exploreImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  exploreContent: {
    flex: 1,
  },
  exploreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  exploreDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  exploreMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.text.muted,
  },
});
