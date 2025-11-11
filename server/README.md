# Payment Server Setup

This is the backend server for handling Stripe payments and credit management with Clerk authentication.

## Prerequisites

- Node.js (v14 or later)
- Stripe account ([sign up here](https://dashboard.stripe.com/register))
- Clerk account with secret key

## Installation

The dependencies are already installed. If you need to reinstall:

```bash
cd server
npm install
```

## Configuration

### 1. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** > **API keys**
3. Copy your **Publishable key** and **Secret key**
4. For webhooks: Navigate to **Developers** > **Webhooks**
   - Click "Add endpoint"
   - Set URL to: `http://localhost:3000/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the **Signing secret**

### 2. Get Your Clerk Secret Key

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **API Keys**
4. Copy your **Secret key**

### 3. Update .env File

Open `server/.env` and replace the placeholder values:

```env
# Clerk Configuration
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY=pk_test_cHJlcGFyZWQta29hbGEtNTEuY2xlcmsuYWNjb3VudHMuZGV2JA

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Running the Server

From the `server` directory:

```bash
npm start
```

The server will start on `http://localhost:3000`

## Testing the Webhook Locally

Since webhooks need a public URL, you can use [Stripe CLI](https://stripe.com/docs/stripe-cli) for local testing:

1. Install Stripe CLI
2. Run: `stripe listen --forward-to localhost:3000/webhook`
3. Copy the webhook signing secret it provides
4. Update `STRIPE_WEBHOOK_SECRET` in `.env`

Alternatively, use [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 3000
```

Then update your Stripe webhook endpoint to use the ngrok URL.

## API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `GET /api/pricing-plans` - Get available pricing plans

### Protected Endpoints (Require Authorization)

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_CLERK_TOKEN
```

- `GET /api/credits` - Get user's credit balance
- `POST /api/create-payment-intent` - Create a new payment intent
  - Body: `{ "amount": 9.99, "credits": 100, "currency": "usd" }`
- `POST /api/use-credits` - Deduct credits from user account
  - Body: `{ "credits": 10 }`

### Webhook Endpoint

- `POST /webhook` - Stripe webhook handler (validates webhook signature)

## Credit System

Credits are stored in Clerk's user metadata (`publicMetadata.credits`). When a payment succeeds:

1. Stripe webhook receives `payment_intent.succeeded` event
2. Server extracts `userId` and `credits` from payment metadata
3. Credits are added to the user's account via Clerk API

## Test Cards

Use these test cards for development (any future expiry date and any 3-digit CVC):

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

More test cards: https://stripe.com/docs/testing

## Security Notes

- Never commit `.env` file to version control
- Use different API keys for development and production
- Always validate webhook signatures
- Use HTTPS in production

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify all environment variables are set
- Check Node.js version (v14+)

### Payments not processing
- Verify Stripe keys are correct and not expired
- Check webhook signature is valid
- Review server logs for errors

### Credits not updating
- Verify Clerk secret key is correct
- Check user has proper permissions in Clerk
- Review webhook events in Stripe Dashboard
