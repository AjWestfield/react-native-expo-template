# Quick Fix: Supabase Operations Hanging

Your tests are hanging because of a **JWT signature mismatch**. Here's how to fix it in 5 minutes:

---

## Immediate Fix (Do This Now)

### 1. Get Your Supabase JWT Secret

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** (gear icon) → **API**
4. Scroll to **JWT Settings**
5. Click **Reveal** next to "JWT Secret"
6. **Copy the entire secret** (it's a long string like `your-super-secret-jwt-token-with-at-least-32-characters-long`)

⚠️ **IMPORTANT:** This is NOT the anon key! It's a separate secret just for JWT signing.

### 2. Update Clerk JWT Template

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Click **JWT Templates** in sidebar
4. Click on your "supabase" template (or create one if missing)
5. In the **Signing key** field:
   - **Delete everything** currently there
   - **Paste** the Supabase JWT Secret you copied
   - Make sure there's **no extra whitespace**
6. Ensure **Signing algorithm** is set to **HS256**
7. Ensure **Token lifetime** is reasonable (3600 seconds = 1 hour is good)
8. Click **Apply Changes**

### 3. Verify JWT Template Claims

Make sure your Clerk JWT template has these claims:

```json
{
  "aud": "authenticated",
  "exp": {{token.exp}},
  "iat": {{token.iat}},
  "sub": "{{user.id}}",
  "email": "{{user.email}}",
  "app_metadata": {
    "provider": "clerk"
  },
  "user_metadata": {
    "email": "{{user.email}}",
    "email_verified": {{user.email_verified}}
  }
}
```

**Critical:** The `"aud": "authenticated"` line must be exactly like that!

### 4. Test Immediately

1. **Sign out and sign back in** to your app (to get a fresh JWT)
2. Run your tests again
3. It should work now!

---

## If Still Not Working

### Quick Diagnostic Test

Add this to your app temporarily to see what's happening:

```typescript
import { useAuth } from '@clerk/clerk-expo';

const { getToken } = useAuth();

// After signing in:
const token = await getToken({ template: 'supabase' });
console.log('JWT Token:', token);

// Decode it to see the payload
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Payload:', payload);

// Check the aud claim
console.log('Audience:', payload.aud); // Should be "authenticated"
console.log('User ID:', payload.sub);  // Should be your Clerk user ID
```

### Test JWT with Direct API Call

```typescript
const testJWT = async () => {
  const token = await getToken({ template: 'supabase' });

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/users?select=count`,
    {
      headers: {
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log('API Status:', response.status);

  if (response.status === 401) {
    console.error('❌ JWT SIGNATURE MISMATCH!');
    console.error('The secret in Clerk does NOT match Supabase');
  } else if (response.status === 200 || response.status === 206) {
    console.log('✅ JWT is valid!');
  }
};
```

---

## Use the New Diagnostic Tools

I've created better testing tools for you:

### 1. Improved Test Screen

Replace your current test screen:

```typescript
// In app/_layout.tsx or wherever you have navigation
import ImprovedSupabaseTestScreen from './src/screens/ImprovedSupabaseTestScreen';

// Then navigate to it instead of the old test screen
```

This new screen:
- Tests JWT validation BEFORE database operations
- Has proper timeout handling (won't hang forever)
- Shows exactly what's wrong with actionable fixes
- Tests each step separately

### 2. Standalone JWT Validator

Test your JWT without running the app:

```bash
# 1. Get a token from your app (add this temporarily):
const token = await getToken({ template: 'supabase' });
console.log(token); // Copy this

# 2. Run the validator:
npx ts-node scripts/test-jwt-validation.ts YOUR_TOKEN YOUR_SUPABASE_JWT_SECRET

# This will tell you exactly what's wrong
```

---

## Common Mistakes (Check These)

### ❌ Using the wrong secret
- **WRONG:** Using Supabase anon key as JWT secret
- **RIGHT:** Using the JWT secret from Settings → API → JWT Settings

### ❌ Wrong audience claim
- **WRONG:** `"aud": "supabase"` or `"aud": "public"`
- **RIGHT:** `"aud": "authenticated"`

### ❌ Wrong algorithm
- **WRONG:** RS256, ES256, etc.
- **RIGHT:** HS256

### ❌ Missing RLS policies
- You need INSERT, SELECT, and UPDATE policies on the users table
- Run the SQL from `/supabase-schema.sql` if you haven't

### ❌ Template name mismatch
- **WRONG:** `getToken({ template: 'Supabase' })` (capital S)
- **RIGHT:** `getToken({ template: 'supabase' })` (lowercase)
- Template name in Clerk must match exactly

---

## Success Checklist

- [ ] Copied JWT Secret from Supabase Settings → API → JWT Settings
- [ ] Pasted JWT Secret into Clerk JWT Template → Signing Key (with no whitespace)
- [ ] Verified algorithm is HS256
- [ ] Verified aud claim is "authenticated"
- [ ] Template name is exactly "supabase" (lowercase)
- [ ] Signed out and back in to get fresh JWT
- [ ] Tested with direct API call (got 200/206, not 401)
- [ ] Tests now complete without hanging

---

## Why Was It Hanging?

When Supabase receives a JWT signed with the **wrong secret**, it tries to verify the signature and fails. However, instead of immediately returning a 401 error, the verification process hangs or times out in React Native environments.

This is why:
1. Your timeout wrapper didn't help - the timeout is on the client side, but the hang happens during server-side JWT verification
2. You got no error - the request never completed to return an error
3. It worked locally in some cases - different network conditions or caching

The fix is simple: **make sure the secrets match**. Once they do, Supabase will accept the JWT immediately and your operations will complete in milliseconds instead of hanging.

---

## Next Steps After Fixing

Once your tests pass:

1. **Remove debug logging** (the console.log statements you added)
2. **Use the improved test screen** for future testing
3. **Integrate into your app** with confidence
4. **Monitor Supabase logs** occasionally to catch any auth issues early

---

**Still stuck?** Check `/TROUBLESHOOTING_CLERK_SUPABASE.md` for the comprehensive guide with advanced diagnostics.
