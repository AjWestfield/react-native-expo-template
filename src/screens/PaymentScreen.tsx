import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StripeProvider, CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { colors } from '../theme/colors';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { getToken } = useAuth();
  const { plan } = route.params as any;

  const [clientSecret, setClientSecret] = useState<string>('');
  const [publishableKey, setPublishableKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const { confirmPayment } = useConfirmPayment();

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      console.log('Initializing payment for plan:', plan);
      console.log('API URL:', API_URL);

      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Please sign in to continue');
        navigation.goBack();
        return;
      }

      console.log('Token obtained, making request...');

      const response = await fetch(`${API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: plan.price,
          credits: plan.credits,
          currency: plan.currency,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setClientSecret(data.clientSecret);
        setPublishableKey(data.publishableKey);
        console.log('Payment intent initialized successfully');
      } else {
        throw new Error(data.error || 'Failed to create payment intent');
      }
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      Alert.alert('Error', `Failed to initialize payment: ${error.message || 'Please try again.'}`);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!cardComplete) {
      Alert.alert('Error', 'Please complete your card details');
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.error('Payment error:', error);
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent) {
        console.log('Payment successful, confirming with server...');

        // Call server to add credits
        try {
          const token = await getToken();
          const response = await fetch(`${API_URL}/api/confirm-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              credits: plan.credits,
            }),
          });

          const data = await response.json();
          console.log('Server response:', data);

          if (response.ok) {
            Alert.alert(
              'Payment Successful!',
              `${plan.credits} credits have been added to your account.`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate back to main screen
                    navigation.navigate('MainTabs' as never);
                  },
                },
              ]
            );
          } else {
            Alert.alert('Warning', 'Payment processed but credits may take a moment to appear.');
            navigation.navigate('MainTabs' as never);
          }
        } catch (confirmError) {
          console.error('Error confirming payment with server:', confirmError);
          Alert.alert('Warning', 'Payment processed but credits may take a moment to appear.');
          navigation.navigate('MainTabs' as never);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
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
    <StripeProvider publishableKey={publishableKey}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={processing}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Complete Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plan</Text>
              <Text style={styles.summaryValue}>{plan.name}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Credits</Text>
              <View style={styles.creditsContainer}>
                <Ionicons name="diamond" size={16} color={colors.accent.primary} />
                <Text style={styles.summaryValue}>{plan.credits}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${plan.price.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Payment Details</Text>

            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: colors.background.tertiary,
                textColor: colors.text.primary,
                placeholderColor: colors.text.tertiary,
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />

            <View style={styles.testCardInfo}>
              <Ionicons name="information-circle" size={16} color={colors.text.secondary} />
              <Text style={styles.testCardText}>
                Test card: 4242 4242 4242 4242
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.payButton,
              (!cardComplete || processing) && styles.payButtonDisabled,
            ]}
            onPress={handlePayment}
            disabled={!cardComplete || processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
              <>
                <Ionicons name="card" size={20} color={colors.text.primary} />
                <Text style={styles.payButtonText}>
                  Pay ${plan.price.toFixed(2)}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.securityInfo}>
            <Ionicons name="shield-checkmark" size={20} color={colors.accent.primary} />
            <Text style={styles.securityText}>
              Secure payment powered by Stripe
            </Text>
          </View>
        </View>
      </View>
    </StripeProvider>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.tertiary,
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent.primary,
  },
  paymentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 10,
  },
  testCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  testCardText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  payButton: {
    backgroundColor: colors.accent.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
