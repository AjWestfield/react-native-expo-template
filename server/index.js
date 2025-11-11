require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Clerk, verifyToken } = require('@clerk/backend');
const Stripe = require('stripe');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Clerk client
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Webhook endpoint - needs raw body, so it's before other middleware
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);

        // Get user ID and credits from metadata
        const userId = paymentIntent.metadata.userId;
        const credits = parseInt(paymentIntent.metadata.credits);

        if (userId && credits) {
          // Add credits to user account
          await addCreditsToUser(userId, credits);
          console.log(`Added ${credits} credits to user ${userId}`);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// Clerk authentication middleware
const requireAuth = async (req, res, next) => {
  try {
    console.log('Auth middleware - checking authorization');
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header found');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);
    console.log('Token found, verifying...');
    const verified = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    req.userId = verified.sub;
    console.log('User authenticated:', req.userId);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Helper function to get user credits
async function getUserCredits(userId) {
  try {
    const user = await clerk.users.getUser(userId);
    return parseInt(user.publicMetadata.credits || 0);
  } catch (error) {
    console.error('Error getting user credits:', error);
    return 0;
  }
}

// Helper function to add credits to user
async function addCreditsToUser(userId, credits) {
  try {
    const currentCredits = await getUserCredits(userId);
    const newCredits = currentCredits + credits;

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        credits: newCredits
      }
    });

    return newCredits;
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
}

// Helper function to deduct credits from user
async function deductCreditsFromUser(userId, credits) {
  try {
    const currentCredits = await getUserCredits(userId);

    if (currentCredits < credits) {
      throw new Error('Insufficient credits');
    }

    const newCredits = currentCredits - credits;

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        credits: newCredits
      }
    });

    return newCredits;
  } catch (error) {
    console.error('Error deducting credits:', error);
    throw error;
  }
}

// API Routes

// Get user's credit balance
app.get('/api/credits', requireAuth, async (req, res) => {
  try {
    const credits = await getUserCredits(req.userId);
    res.json({ credits });
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

// Create payment intent
app.post('/api/create-payment-intent', requireAuth, async (req, res) => {
  try {
    console.log('Payment intent request received');
    console.log('User ID:', req.userId);
    console.log('Request body:', req.body);

    const { amount, credits, currency = 'usd' } = req.body;

    if (!amount || !credits) {
      console.error('Missing amount or credits');
      return res.status(400).json({ error: 'Amount and credits are required' });
    }

    console.log('Creating payment intent for amount:', amount, 'credits:', credits);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.userId,
        credits: credits.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent', details: error.message });
  }
});

// Get pricing plans
app.get('/api/pricing-plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'test-plan',
        name: 'Test Plan',
        credits: 1000,
        price: 10.00,
        currency: 'usd',
        popular: true
      }
    ];

    res.json({ plans });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
});

// Confirm payment and add credits (for testing without webhooks)
app.post('/api/confirm-payment', requireAuth, async (req, res) => {
  try {
    const { paymentIntentId, credits } = req.body;

    if (!paymentIntentId || !credits) {
      return res.status(400).json({ error: 'Payment intent ID and credits are required' });
    }

    console.log('Confirming payment and adding credits:', paymentIntentId, credits);

    // Verify the payment intent status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Add credits to user account
      const newBalance = await addCreditsToUser(req.userId, credits);
      console.log(`Added ${credits} credits to user ${req.userId}. New balance: ${newBalance}`);

      res.json({
        success: true,
        newBalance,
        creditsAdded: credits
      });
    } else {
      res.status(400).json({ error: 'Payment not confirmed yet' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Use credits endpoint (for when user performs an action that costs credits)
app.post('/api/use-credits', requireAuth, async (req, res) => {
  try {
    const { credits } = req.body;

    if (!credits || credits <= 0) {
      return res.status(400).json({ error: 'Valid credit amount required' });
    }

    const newBalance = await deductCreditsFromUser(req.userId, credits);
    res.json({
      success: true,
      newBalance,
      creditsUsed: credits
    });
  } catch (error) {
    if (error.message === 'Insufficient credits') {
      return res.status(400).json({ error: 'Insufficient credits' });
    }
    console.error('Error using credits:', error);
    res.status(500).json({ error: 'Failed to use credits' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Payment server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Payment server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
