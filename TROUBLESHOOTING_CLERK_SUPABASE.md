## Clerk + Supabase Integration Troubleshooting Guide

This guide addresses the common issue of **Supabase operations hanging** instead of returning errors when using Clerk JWT authentication.

---

## Problem: Operations Hang at User Sync

### Symptoms
- `userService.syncUser()` hangs indefinitely
- No error returned, even with timeout wrapper
- Tests get stuck at "Syncing User to Supabase"
- Network requests to Supabase never complete

### Root Cause
When Supabase receives a JWT with an **invalid signature** (i.e., signed with a different secret than Supabase expects), PostgREST (Supabase's REST API layer) attempts to verify the signature but the verification process hangs or times out instead of immediately rejecting the token with a 401 error.

This happens because:
1. React Native's fetch implementation doesn't enforce strict timeouts
2. Supabase JS client doesn't have built-in request timeouts
3. JWT verification happens server-side and can hang if there's a mismatch

---

## Diagnostic Steps

### Step 1: Verify JWT Secret Match

The #1 cause of hanging is **JWT secret mismatch** between Clerk and Supabase.

**Action:**
1. Go to Supabase Dashboard → Settings → API → JWT Settings
2. Copy the "JWT Secret" (NOT the anon key!)
3. Go to Clerk Dashboard → JWT Templates → supabase template
4. Verify the "Signing Key" EXACTLY matches the Supabase JWT Secret
5. Save changes in Clerk

**Common mistakes:**
- Using Supabase anon key instead of JWT secret
- Extra whitespace or newlines in the secret
- Copy/paste errors truncating the secret
- Using an old secret after rotating it

### Step 2: Validate JWT Structure

Use the diagnostic script to test your JWT:

```bash
# Get a token from your app
# Add this temporarily: const token = await getToken({ template: 'supabase' }); console.log(token);

# Run the validation script
npx ts-node scripts/test-jwt-validation.ts YOUR_TOKEN_HERE YOUR_SUPABASE_JWT_SECRET
```

This will:
- Decode the JWT and show all claims
- Verify the signature locally
- Test the JWT against Supabase API directly
- Show exactly what's wrong

### Step 3: Test JWT with Direct API Call

Before testing in the app, verify the JWT works with a direct API call:

```typescript
const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count`, {
  method: 'GET',
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

console.log('Status:', response.status);
console.log('Response:', await response.text());
```

Expected results:
- **200 or 206**: JWT is valid ✅
- **401**: JWT signature verification failed ❌
- **Timeout/Hang**: Network or configuration issue ❌

### Step 4: Check JWT Claims

The JWT must have these claims for Supabase:

```json
{
  "sub": "user_xxxxx",      // Clerk user ID (REQUIRED)
  "aud": "authenticated",   // Must be "authenticated" (REQUIRED)
  "email": "user@example.com",
  "exp": 1234567890,        // Expiration timestamp (REQUIRED)
  "iat": 1234567890         // Issued at timestamp (REQUIRED)
}
```

**Common issues:**
- `aud` set to something other than "authenticated"
- Missing `sub` claim
- Token expired (`exp` < current time)

### Step 5: Verify RLS Policies

Even with correct JWT, RLS policies can cause hangs if misconfigured.

**Test RLS policies in Supabase SQL Editor:**

```sql
-- Simulate authenticated user
SELECT set_config('request.jwt.claims', '{"sub": "user_YOUR_CLERK_ID"}', TRUE);

-- Test SELECT policy
SELECT * FROM users WHERE id = 'user_YOUR_CLERK_ID';

-- Test INSERT policy
INSERT INTO users (id, email) VALUES ('user_YOUR_CLERK_ID', 'test@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
```

If these queries **hang or fail**, your RLS policies are wrong.

**Fix:** Ensure you have these policies on the `users` table:

```sql
-- SELECT policy
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING ((auth.jwt() ->> 'sub'::text) = id::text);

-- INSERT policy (REQUIRED for upsert!)
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = id::text);

-- UPDATE policy
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING ((auth.jwt() ->> 'sub'::text) = id::text)
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = id::text);
```

---

## Solution: Use Improved Testing Approach

### Use the Improved Test Screen

Replace your current test screen with the improved version:

```typescript
// In your navigation:
import ImprovedSupabaseTestScreen from './src/screens/ImprovedSupabaseTestScreen';

// Add to your stack/tabs
<Stack.Screen name="SupabaseTest" component={ImprovedSupabaseTestScreen} />
```

The improved test screen:
- Tests JWT structure BEFORE database operations
- Uses direct API calls to diagnose JWT issues
- Has better timeout handling
- Provides actionable error messages
- Tests each component separately

### Use the Diagnostic Utilities

Import and use the diagnostic functions:

```typescript
import {
  validateJWTForSupabase,
  testDirectAPIAccess,
  withTimeout
} from './src/utils/supabase-diagnostics';

// Validate JWT before using it
const token = await getToken({ template: 'supabase' });
const validation = validateJWTForSupabase(token);

if (!validation.passed) {
  console.error('JWT validation failed:', validation.details.issues);
  return;
}

// Test API access
const apiTest = await testDirectAPIAccess(SUPABASE_URL, token, 5000);
if (!apiTest.passed) {
  console.error('API test failed - JWT signature mismatch likely');
  return;
}

// Now safe to use Supabase client
```

---

## Common Errors and Fixes

### Error: "Operation timed out after 10000ms: User Sync"

**Cause:** JWT signature verification failing silently

**Fix:**
1. Verify JWT secret matches between Clerk and Supabase
2. Use `testDirectAPIAccess()` to confirm JWT is valid
3. Check Clerk JWT template algorithm is HS256

### Error: No error, just hangs forever

**Cause:** Network timeout not enforced by React Native

**Fix:**
1. Always wrap Supabase calls with `withTimeout()`
2. Use reasonable timeout (5-10 seconds)
3. Test with direct fetch() calls first

### Error: "Missing JWT template"

**Cause:** JWT template not named exactly "supabase"

**Fix:**
1. Go to Clerk Dashboard → JWT Templates
2. Ensure template name is exactly `supabase` (lowercase)
3. Call `getToken({ template: 'supabase' })` with exact name

### Error: "Row Level Security policy violation"

**Cause:** Missing or incorrect RLS policies

**Fix:**
1. Ensure RLS is enabled: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
2. Create policies for SELECT, INSERT, UPDATE operations
3. Use `(auth.jwt() ->> 'sub'::text) = id::text` for user matching
4. Test policies with `set_config('request.jwt.claims', ...)` in SQL editor

### Error: 401 Unauthorized from Supabase API

**Cause:** JWT signature doesn't match Supabase secret

**Fix:**
1. This is a CLEAR indicator that secrets don't match
2. Copy JWT Secret from Supabase (Settings → API → JWT Settings)
3. Paste EXACTLY into Clerk JWT template signing key
4. No extra whitespace, newlines, or modifications
5. Save and test again

---

## Testing Workflow (Recommended Order)

1. **Get JWT token** from Clerk
   ```typescript
   const token = await getToken({ template: 'supabase' });
   console.log('JWT:', token);
   ```

2. **Run standalone validation**
   ```bash
   npx ts-node scripts/test-jwt-validation.ts YOUR_TOKEN SUPABASE_JWT_SECRET
   ```

3. **Test direct API access**
   ```typescript
   const result = await testDirectAPIAccess(SUPABASE_URL, token);
   console.log(result.passed ? 'API OK' : 'API FAILED');
   ```

4. **Test in improved screen**
   - Navigate to ImprovedSupabaseTestScreen
   - Run diagnostics
   - Follow actionable error messages

5. **Integrate into app**
   - Only after ALL diagnostics pass
   - Use `useSupabase` hook normally
   - Always wrap operations with timeouts

---

## Prevention: Best Practices

1. **Always use timeout wrappers**
   ```typescript
   import { withTimeout } from './src/utils/supabase-diagnostics';

   const result = await withTimeout(
     client.from('users').select(),
     5000,
     'Get users'
   );
   ```

2. **Validate JWT before first use**
   ```typescript
   const token = await getToken({ template: 'supabase' });
   const validation = validateJWTForSupabase(token);
   if (!validation.passed) {
     throw new Error('Invalid JWT: ' + validation.details.issues.join(', '));
   }
   ```

3. **Test with direct API calls first**
   - Bypass the Supabase client initially
   - Use fetch() with JWT to test basic connectivity
   - Only use client after confirming JWT works

4. **Monitor Supabase logs**
   - Go to Supabase Dashboard → Logs
   - Check for 401 errors or JWT validation failures
   - These won't show in your app but will show server-side

5. **Keep JWT secrets in sync**
   - Document where both secrets are stored
   - Update both if you rotate Supabase JWT secret
   - Test immediately after any secret changes

---

## Still Having Issues?

If you've followed all steps and still experiencing hangs:

1. **Check Supabase project status**
   - Dashboard → Project Health
   - Look for outages or performance issues

2. **Test with service_role key** (BACKEND ONLY!)
   ```typescript
   // NEVER in client code - backend/API route only
   const client = createClient(url, SERVICE_ROLE_KEY);
   const result = await client.from('users').select();
   // If this works, issue is definitely JWT-related
   ```

3. **Enable verbose logging**
   ```typescript
   // In useSupabase hook
   const supabaseClient = createClient(url, anonKey, {
     global: {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     },
     db: {
       schema: 'public',
     },
     auth: {
       autoRefreshToken: false,
       persistSession: false,
     },
   });

   // Log all requests
   console.log('Supabase client created with token:', token.substring(0, 20) + '...');
   ```

4. **Check network connectivity**
   - Ensure device/emulator can reach Supabase
   - Test with curl: `curl ${SUPABASE_URL}/rest/v1/`
   - Check for firewall/proxy issues

5. **Verify Clerk is issuing tokens**
   ```typescript
   const token = await getToken({ template: 'supabase' });
   if (!token) {
     console.error('Clerk not issuing token - check template exists');
   }
   ```

---

## Quick Reference: File Locations

- **Improved Test Screen:** `/src/screens/ImprovedSupabaseTestScreen.tsx`
- **Diagnostic Utils:** `/src/utils/supabase-diagnostics.ts`
- **JWT Validation Script:** `/scripts/test-jwt-validation.ts`
- **Schema with Policies:** `/supabase-schema.sql`
- **Setup Guide:** `/SUPABASE_SETUP.md`

---

## Questions?

If you're still stuck after following this guide:
1. Run the diagnostic script and save the output
2. Check Supabase logs for server-side errors
3. Verify your Clerk JWT template configuration
4. Test with a fresh Supabase project to rule out corrupted state

The improved diagnostic tools will tell you EXACTLY what's wrong - pay attention to the error messages and suggested fixes!
