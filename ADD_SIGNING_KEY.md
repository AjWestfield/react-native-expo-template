# Add Custom Signing Key to Clerk JWT Template

## ✅ What's Already Done

- JWT template named "supabase" created ✅
- Template ID: `jtmp_35KOn2tn2PJl9gb1a0DHdVcL8Ew`
- Claims configured correctly ✅
- Lifetime set to 3600 seconds ✅

## 🔐 What You Need to Do (2 minutes)

The custom signing key **must** be added through the Clerk Dashboard for security reasons.

### Step-by-Step Instructions

#### 1. Open Clerk Dashboard
Go to: [https://dashboard.clerk.com](https://dashboard.clerk.com)

#### 2. Navigate to JWT Templates
- Select your application
- Click **"JWT Templates"** in the left sidebar
- You should see a template named **"supabase"**

#### 3. Edit the Supabase Template
- Click on the **"supabase"** template
- This will open the template editor

#### 4. Add Custom Signing Key
Look for one of these sections:
- **"Custom signing key"**
- **"Signing key"**
- **"Advanced"** → **"Custom signing key"**

Click **"Edit"** or **"Add signing key"** or toggle **"Use custom signing key"**

#### 5. Configure the Signing Key

**Paste this key:**
```
GLIKrvVMYDhVweKvaXUu3NAJ/uvzI5AGgElnB/yHKJdkDXfQT3OB1BdFeV5uARU4fxTREThMXfsuv/n2FYNWPg==
```

**Set the algorithm to:**
```
HS256
```

#### 6. Save Changes
- Click **"Save"** or **"Apply Changes"**
- Wait for confirmation that changes are saved

---

## 🎯 What to Look For

### Before Adding Key:
- Signing Algorithm: RS256 (Clerk's default)
- Custom signing key: No/Disabled

### After Adding Key:
- Signing Algorithm: **HS256** ✅
- Custom signing key: **Yes/Enabled** ✅

---

## 🧪 Test After Setup

Once you've added the signing key, test the integration:

### Option 1: Quick Console Test

In your app, after signing in:
```typescript
import { useAuth } from '@clerk/clerk-expo';

const { getToken } = useAuth();
const token = await getToken({ template: 'supabase' });

if (token) {
  console.log('✅ Token received!');

  // Decode and check
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('User ID:', payload.sub);
  console.log('Email:', payload.email);
  console.log('Audience:', payload.aud); // Should be "authenticated"
} else {
  console.log('❌ No token received');
}
```

### Option 2: Use Test Screen

1. Start your app: `npx expo start`
2. Add `SupabaseTestScreen` to your navigation
3. Sign in with Clerk
4. Navigate to the test screen
5. Tap **"Run Tests"**
6. All tests should pass ✅

---

## ❓ Troubleshooting

### "I don't see a custom signing key option"
- Make sure you're editing the correct template (named "supabase")
- Look in the "Advanced" section
- Try clicking "Edit" on the template first

### "The save button is disabled"
- Make sure you entered the key correctly (no extra spaces)
- Check that HS256 is selected as the algorithm
- Try refreshing the page and editing again

### "How do I know if it worked?"
After saving, the template should show:
- Custom signing key: **Enabled** or **Yes**
- Algorithm: **HS256**

You can also test by getting a token in your app (see test code above).

---

## 🔒 Security Note

This custom signing key is your **Supabase JWT Secret**. It allows Clerk to sign JWTs that Supabase will trust.

**Keep it secure:**
- ✅ It's now stored securely in Clerk
- ✅ It's also in your Supabase project settings (as it should be)
- ❌ Don't share it publicly
- ❌ Don't commit it to version control

---

## ✅ After Completing This Step

You'll be ready to:
1. Test the full Clerk + Supabase integration ✅
2. Use `useSupabase()` hook in your app ✅
3. Upload videos to Supabase Storage ✅
4. Store video metadata in Supabase database ✅

---

## 📚 Quick Reference

**Your Signing Key:**
```
GLIKrvVMYDhVweKvaXUu3NAJ/uvzI5AGgElnB/yHKJdkDXfQT3OB1BdFeV5uARU4fxTREThMXfsuv/n2FYNWPg==
```

**Template Name:** `supabase`

**Template ID:** `jtmp_35KOn2tn2PJl9gb1a0DHdVcL8Ew`

**Algorithm:** `HS256`

**Lifetime:** `3600` seconds (1 hour)

---

**Need help?** Check `SETUP_CHECKLIST.md` for more troubleshooting tips!
