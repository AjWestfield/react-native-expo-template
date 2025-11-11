#!/bin/bash

# Script to set up Clerk JWT template for Supabase
# This makes it easier to run the Node.js script with proper environment setup

echo "🔐 Clerk JWT Template Setup for Supabase"
echo "========================================"
echo ""

# Check if CLERK_SECRET_KEY is provided as argument
if [ -z "$1" ]; then
  echo "📋 How to get your Clerk Secret Key:"
  echo "   1. Go to https://dashboard.clerk.com"
  echo "   2. Select your application"
  echo "   3. Go to 'API Keys' in the sidebar"
  echo "   4. Copy the 'Secret Key' (starts with sk_test_ or sk_live_)"
  echo ""
  echo "Usage:"
  echo "   ./setup-jwt-template.sh YOUR_CLERK_SECRET_KEY"
  echo ""
  echo "Example:"
  echo "   ./setup-jwt-template.sh sk_test_abc123..."
  exit 1
fi

CLERK_SECRET_KEY=$1

echo "✅ Secret key provided"
echo "🚀 Creating Clerk JWT template..."
echo ""

# Export the secret key and run the Node.js script
export CLERK_SECRET_KEY=$CLERK_SECRET_KEY
node create-clerk-jwt-template.js

# Check if the script succeeded
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Setup complete!"
  echo ""
  echo "🧪 Next steps:"
  echo "   1. Start your app: npx expo start"
  echo "   2. Sign in with Clerk"
  echo "   3. Test using SupabaseTestScreen"
else
  echo ""
  echo "❌ Setup failed. Please check the error messages above."
  exit 1
fi
