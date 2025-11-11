import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '@clerk/clerk-expo';

interface PricingPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
  savings?: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function PricingScreen() {
  const navigation = useNavigation();
  const { getToken } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pricing-plans`);
      const data = await response.json();
      setPlans(data.plans);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      Alert.alert('Error', 'Failed to load pricing plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    try {
      setSelectedPlan(plan);

      // Get auth token
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Please sign in to continue');
        return;
      }

      // Navigate to payment screen with plan details
      navigation.navigate('Payment' as never, { plan } as never);
    } catch (error) {
      console.error('Error selecting plan:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Purchase credits to unlock AI-powered video generation
        </Text>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                plan.popular && styles.popularPlanCard,
              ]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}

              <Text style={styles.planName}>{plan.name}</Text>

              <View style={styles.creditsContainer}>
                <Ionicons name="diamond" size={32} color={colors.accent.primary} />
                <Text style={styles.creditsAmount}>{plan.credits}</Text>
                <Text style={styles.creditsLabel}>Credits</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.price}>{plan.price.toFixed(2)}</Text>
              </View>

              {plan.savings && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save {plan.savings}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.selectButton,
                  plan.popular && styles.popularSelectButton,
                ]}
                onPress={() => handleSelectPlan(plan)}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    plan.popular && styles.popularSelectButtonText,
                  ]}
                >
                  Select Plan
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What's Included</Text>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.accent.primary} />
            <Text style={styles.featureText}>AI-powered video generation</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.accent.primary} />
            <Text style={styles.featureText}>Multiple camera styles and templates</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.accent.primary} />
            <Text style={styles.featureText}>HD video quality</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.accent.primary} />
            <Text style={styles.featureText}>Credits never expire</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  planCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.background.tertiary,
    position: 'relative',
  },
  popularPlanCard: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.background.tertiary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  creditsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  creditsAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent.primary,
    marginTop: 8,
  },
  creditsLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 4,
  },
  price: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  savingsBadge: {
    backgroundColor: colors.accent.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  savingsText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: colors.background.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  popularSelectButton: {
    backgroundColor: colors.accent.primary,
  },
  selectButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  popularSelectButtonText: {
    color: colors.text.primary,
  },
  featuresContainer: {
    marginTop: 40,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.text.secondary,
    flex: 1,
  },
});
