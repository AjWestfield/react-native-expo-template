# Automated Clerk JWT Template Setup

This guide shows you how to automatically create the Clerk JWT template using the CLI.

## Option 1: Quick Setup (Recommended)

### Step 1: Get Your Clerk Secret Key
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Click **"API Keys"** in the sidebar
4. Copy the **"Secret Key"** (starts with `sk_test_` or `sk_live_`)

⚠️ **Important:** Copy the **Secret Key**, NOT the Publishable Key!

### Step 2: Run the Setup Script

```bash
./setup-jwt-template.sh YOUR_CLERK_SECRET_KEY_HERE
```

Replace `YOUR_CLERK_SECRET_KEY_HERE` with the actual secret key you copied.

**Example:**
```bash
./setup-jwt-template.sh sk_test_abc123def456...
```

### Step 3: Verify Success

You should see:
```
✅ JWT template created successfully!
   Template ID: tmpl_xxxxx
   Name: supabase
   Algorithm: HS256
   Lifetime: 3600 seconds

🎉 Success! Your Clerk JWT template for Supabase is ready!
```

---

## Option 2: Manual Node.js Script

If you prefer to run the Node.js script directly:

```bash
export CLERK_SECRET_KEY="your_clerk_secret_key_here"
node create-clerk-jwt-template.js
```

---

## Option 3: Interactive Setup

If you want to be prompted for the secret key:

```bash
read -sp "Enter your Clerk Secret Key: " CLERK_SECRET_KEY && \
export CLERK_SECRET_KEY && \
echo "" && \
node create-clerk-jwt-template.js
```

This will:
1. Prompt you for the secret key (input hidden)
2. Set it as an environment variable
3. Run the setup script

---

## What This Script Does

1. ✅ Connects to Clerk Backend API using your secret key
2. ✅ Checks if a "supabase" JWT template already exists
3. ✅ Creates or updates the template with:
   - **Name:** `supabase`
   - **Algorithm:** `HS256`
   - **Signing Key:** Your Supabase JWT Secret
   - **Lifetime:** 3600 seconds (1 hour)
   - **Claims:** User ID, email, and metadata
4. ✅ Validates the configuration

---

## Troubleshooting

### Error: "CLERK_SECRET_KEY environment variable not set"

**Solution:** Make sure you're passing the secret key as an argument:
```bash
./setup-jwt-template.sh sk_test_your_key_here
```

### Error: "Your Clerk Secret Key is invalid or expired"

**Solution:**
- Double-check you copied the entire secret key
- Make sure you're using the **Secret Key**, not the Publishable Key
- Verify the key is from the correct Clerk application

### Error: "Template already exists"

**Don't worry!** The script will automatically update the existing template with the correct configuration.

### Error: "Permission denied"

**Solution:** Make the script executable:
```bash
chmod +x setup-jwt-template.sh
```

---

## Security Notes

🔐 **Your Clerk Secret Key is sensitive!**
- Never commit it to version control
- Never share it publicly
- Use environment variables or secure vaults in production
- Rotate keys if they're exposed

The setup script:
- ✅ Does NOT save your secret key to any files
- ✅ Only uses it temporarily to create the JWT template
- ✅ Uses secure HTTPS connections to Clerk API

---

## After Setup

Once the JWT template is created, test your integration:

### Option A: Use the Test Screen

1. Start your app: `npx expo start`
2. Add `SupabaseTestScreen` to your navigation
3. Sign in with Clerk
4. Navigate to the test screen
5. Tap "Run Tests"
6. All tests should pass ✅

### Option B: Manual Console Test

Add this code temporarily after sign-in:

```typescript
import { useAuth } from '@clerk/clerk-expo';

const { getToken } = useAuth();
const token = await getToken({ template: 'supabase' });

if (token) {
  console.log('✅ JWT Token received!');
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('User ID:', payload.sub);
  console.log('Email:', payload.email);
} else {
  console.log('❌ No token received');
}
```

---

## Verify in Clerk Dashboard

After running the script, you can verify the template was created:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **JWT Templates**
3. You should see a template named **"supabase"**
4. It should show:
   - Algorithm: HS256
   - Lifetime: 3600 seconds
   - Custom signing key configured ✓

---

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Verify your Clerk Secret Key is correct
3. Make sure your Supabase JWT secret matches
4. Check `SETUP_CHECKLIST.md` for more troubleshooting tips

---

## What's Next?

After the JWT template is set up:
1. ✅ Test the integration (see above)
2. 📱 Integrate Supabase into your app screens
3. 🚀 Start using Supabase for data storage!

Check out `INTEGRATION_EXAMPLES.md` for code examples.
