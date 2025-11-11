import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFilming, FilmingType } from '../context/FilmingContext';
import { colors } from '../theme/colors';

interface FilmingTypeScreenProps {
  navigation: any;
}

export default function FilmingTypeScreen({ navigation }: FilmingTypeScreenProps) {
  const { filmingTypes, selectedFilmingType, setSelectedFilmingType } = useFilming();

  const handleSelectType = (type: FilmingType) => {
    setSelectedFilmingType(type);
    // Navigate back or to next screen
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Filming Type</Text>
          <Text style={styles.subtitle}>
            Choose the type of camera or device you'll be filming with
          </Text>
        </View>

        <View style={styles.typesContainer}>
          {filmingTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                selectedFilmingType === type.id && styles.typeCardSelected,
              ]}
              onPress={() => handleSelectType(type.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={type.icon as any}
                  size={32}
                  color={selectedFilmingType === type.id ? colors.primary : colors.text.primary}
                />
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeName}>{type.name}</Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </View>
              {selectedFilmingType === type.id && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedFilmingType && (
          <View style={styles.selectedInfo}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.selectedText}>
              {filmingTypes.find(t => t.id === selectedFilmingType)?.name} selected
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  typesContainer: {
    padding: 20,
    paddingTop: 10,
    gap: 16,
  },
  typeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  checkmark: {
    marginLeft: 12,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  selectedText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});
