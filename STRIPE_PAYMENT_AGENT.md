# Stripe Payment Agent Documentation

## Overview

This React Native Expo app includes a complete Stripe payment integration system (Stripe Payment Agent) for managing subscriptions, payment methods, and one-time purchases.

## Features

- ✅ **Subscription Management** - Create, update, and cancel subscriptions
- ✅ **Payment Methods** - Add, remove, and manage payment methods
- ✅ **Payment History** - View past payments and invoices
- ✅ **Credit System** - Purchase additional video generation credits
- ✅ **Beautiful UI** - Glassmorphic design matching the app theme
- ✅ **Secure Storage** - Uses Expo Secure Store for sensitive data
- ✅ **TypeScript** - Fully typed for better development experience

## Architecture

### Components

```
src/
├── types/
│   └── payment.ts              # TypeScript type definitions
├── services/
│   └── stripeAgent.ts          # Main Stripe payment service
├── config/
│   └── stripe.config.ts        # Stripe configuration and plans
├── hooks/
│   └── usePayment.ts           # React hooks for payments
├── components/
│   ├── SubscriptionCard.tsx    # Subscription plan card
│   └── PaymentMethodCard.tsx   # Payment method card
└── screens/
    └── BillingScreen.tsx       # Main billing screen
```

### Key Files

#### 1. `stripeAgent.ts` - Payment Service

The main service handling all Stripe operations:

- **Customer Management**: Create and retrieve Stripe customers
- **Payment Methods**: Add, remove, and set default payment methods
- **Subscriptions**: Create, update, cancel, and reactivate subscriptions
- **One-Time Payments**: Create and confirm payment intents
- **Credits**: Purchase additional credits
- **Payment History**: Retrieve past payments

```typescript
import { StripeAgent } from './src/services/stripeAgent';

// Initialize (done automatically in App.tsx)
StripeAgent.initialize(apiBaseUrl, publishableKey);

// Get instance
const agent = StripeAgent.getInstance();

// Use agent methods
await agent.createCustomer(userId, email);
await agent.createSubscription(customerId, priceId);
```

#### 2. `usePayment.ts` - React Hooks

Custom hooks for easy integration:

- `useSubscription` - Manage subscription state
- `usePaymentMethods` - Manage payment methods
- `usePaymentSheetSetup` - Stripe Payment Sheet integration
- `usePaymentHistory` - View payment history
- `useCreditBalance` - Track credit balance

```typescript
import { useSubscription } from './src/hooks/usePayment';

function MyComponent() {
  const { subscription, createSubscription, loading } = useSubscription(userId);

  // Use subscription data and methods
}
```

#### 3. `stripe.config.ts` - Configuration

Define your subscription plans and pricing:

```typescript
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tier: 'starter',
    price: 9.99,
    credits: 25,
    stripePriceId: 'price_starter_monthly',
    features: [...],
  },
  // ... more plans
];
```

## Setup Instructions

### 1. Install Dependencies

Already installed:
- `@stripe/stripe-react-native`
- `expo-secure-store`

### 2. Configure Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in your Stripe keys:

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
EXPO_PUBLIC_API_URL=https://your-backend.com/api/stripe
```

### 3. Set Up Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your publishable key from [API Keys](https://dashboard.stripe.com/apikeys)
3. Create products and prices:
   - Navigate to **Products** → **Add Product**
   - Create products for each subscription tier
   - Create recurring prices (monthly/yearly)
   - Copy the Price IDs (e.g., `price_1234567890`)
   - Add them to your `.env` file

### 4. Backend API Requirements

You need a backend API to handle secure Stripe operations. The API should have these endpoints:

#### Customer Endpoints

```
POST   /api/stripe/customers
GET    /api/stripe/customers/:id
```

#### Subscription Endpoints

```
POST   /api/stripe/subscriptions
GET    /api/stripe/subscriptions/:id
PUT    /api/stripe/subscriptions/:id
POST   /api/stripe/subscriptions/:id/cancel
POST   /api/stripe/subscriptions/:id/reactivate
```

#### Payment Method Endpoints

```
POST   /api/stripe/payment-methods/setup
GET    /api/stripe/payment-methods/:customerId
POST   /api/stripe/payment-methods/default
DELETE /api/stripe/payment-methods/:id
```

#### Payment Intent Endpoints

```
POST   /api/stripe/payment-intents
POST   /api/stripe/payment-intents/:id/confirm
```

#### Credit & History Endpoints

```
GET    /api/stripe/credits/:userId
GET    /api/stripe/payments/history/:customerId
```

See **Backend Example** section below for implementation details.

### 5. Testing

For testing, use Stripe test mode:

1. Use test publishable key (`pk_test_...`)
2. Use test cards from [Stripe Testing](https://stripe.com/docs/testing):
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0025 0000 3155`
   - Declined: `4000 0000 0000 9995`

## Usage

### Navigate to Billing Screen

Users can access billing from Profile → "Billing & Subscription"

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('Billing');
```

### Create a Subscription

```typescript
import { useSubscription } from './src/hooks/usePayment';
import { getPlanById } from './src/config/stripe.config';

function SubscribeButton() {
  const { createSubscription, loading } = useSubscription(userId);

  const handleSubscribe = async () => {
    try {
      const plan = getPlanById('pro');
      await createSubscription(plan);
      Alert.alert('Success', 'Subscribed to Pro plan!');
    } catch (error) {
      Alert.alert('Error', 'Failed to subscribe');
    }
  };

  return (
    <Button onPress={handleSubscribe} disabled={loading}>
      Subscribe to Pro
    </Button>
  );
}
```

### Purchase Credits

```typescript
import { getStripeAgent } from './src/services/stripeAgent';

const agent = getStripeAgent();
const customerId = await agent.getCustomerId();

const paymentIntent = await agent.purchaseCredits(customerId, {
  credits: 25,
  price: 9.99,
});

// Then use Payment Sheet to complete payment
```

## Backend Example (Node.js/Express)

Here's a minimal backend implementation:

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Create customer
app.post('/api/stripe/customers', async (req, res) => {
  const { userId, email, name } = req.body;

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId },
  });

  res.json({ customerId: customer.id });
});

// Create subscription
app.post('/api/stripe/subscriptions', async (req, res) => {
  const { customerId, priceId, paymentMethodId } = req.body;

  // Attach payment method if provided
  if (paymentMethodId) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  res.json({
    id: subscription.id,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });
});

// ... implement other endpoints similarly

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Security Considerations

⚠️ **IMPORTANT**: Never expose your Stripe secret key in the mobile app!

- ✅ Use publishable key in the app (`pk_test_...` or `pk_live_...`)
- ✅ Keep secret key on your backend only
- ✅ Validate all requests on the backend
- ✅ Use Stripe webhooks for reliable event handling
- ✅ Store sensitive data in Expo Secure Store
- ✅ Implement proper authentication/authorization

## Webhooks

Set up webhooks to handle events:

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-backend.com/api/stripe/webhooks`
3. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

Example webhook handler:

```javascript
app.post('/api/stripe/webhooks', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.updated':
      // Handle subscription update
      break;
    case 'invoice.payment_succeeded':
      // Handle successful payment
      break;
    // ... handle other events
  }

  res.json({ received: true });
});
```

## Customization

### Add New Subscription Plans

Edit `src/config/stripe.config.ts`:

```typescript
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // ... existing plans
  {
    id: 'custom',
    name: 'Custom Plan',
    tier: 'custom',
    price: 49.99,
    currency: 'usd',
    interval: 'month',
    credits: 200,
    stripePriceId: 'price_custom_monthly',
    features: [
      'Custom feature 1',
      'Custom feature 2',
    ],
  },
];
```

### Modify UI Components

All components use the existing glassmorphic design system from `src/theme/colors.ts`. You can customize:

- Colors and gradients
- Typography
- Spacing
- Border radius
- Shadows

### Add Payment Methods UI

Integrate Stripe Payment Sheet for adding payment methods:

```typescript
import { usePaymentSheet } from '@stripe/stripe-react-native';

const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

// Initialize
await initPaymentSheet({
  customerId: 'cus_123',
  customerEphemeralKeySecret: 'ephkey_123',
  setupIntentClientSecret: 'seti_123',
  merchantDisplayName: 'Your App Name',
});

// Present
const { error } = await presentPaymentSheet();
```

## Troubleshooting

### "StripeAgent not initialized"

Make sure to call `StripeAgent.initialize()` in App.tsx before using the agent.

### Payments Not Working

1. Check your Stripe keys are correct
2. Verify backend is running and accessible
3. Check network requests in React Native debugger
4. Verify Price IDs match Stripe Dashboard
5. Check Stripe Dashboard logs for errors

### Navigation Issues

Make sure React Navigation is properly configured and the Billing screen is added to the navigator.

## Production Checklist

Before going live:

- [ ] Replace test keys with live keys
- [ ] Set up production backend with proper security
- [ ] Configure webhooks for live mode
- [ ] Test all payment flows
- [ ] Add error tracking (Sentry, etc.)
- [ ] Review Stripe compliance requirements
- [ ] Add terms of service and privacy policy
- [ ] Test on both iOS and Android
- [ ] Enable Apple Pay (iOS) and Google Pay (Android)
- [ ] Set up proper monitoring and alerts

## Resources

- [Stripe React Native Docs](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [React Navigation](https://reactnavigation.org/)

## Support

For issues or questions:
- Check Stripe Dashboard logs
- Review React Native Debugger console
- Check backend server logs
- Refer to Stripe documentation

## License

This payment integration is part of your app and follows the same license.
