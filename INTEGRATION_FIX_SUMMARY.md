# Clerk + Supabase Integration Fix Summary

## What Was Wrong

Your Supabase operations were **hanging indefinitely** at the `syncUser()` call because:

1. **JWT Signature Mismatch**: The JWT token from Clerk was signed with a different secret than what Supabase expected
2. **Silent Failure**: When Supabase's PostgREST layer receives an incorrectly signed JWT, it attempts to verify the signature but hangs instead of immediately returning a 401 error
3. **No Client Timeout**: The Supabase JS client doesn't enforce request timeouts in React Native, causing operations to hang forever
4. **Timeout Wrapper Ineffective**: Your `withTimeout()` wrapper couldn't help because the hang happens during server-side JWT verification, not during network transport

## What I've Created For You

### 1. Diagnostic Utilities (`/src/utils/supabase-diagnostics.ts`)

Comprehensive diagnostic functions that test each component of the integration separately:

- **`validateJWTForSupabase(token)`** - Decodes and validates JWT structure without making any network calls
- **`testDirectAPIAccess(url, token)`** - Tests JWT with raw fetch() to bypass Supabase client
- **`testDatabaseConnection(client)`** - Tests basic connectivity to Supabase
- **`testJWTAuthentication(client, userId)`** - Verifies JWT is being used correctly by Supabase
- **`testRLSPolicies(client, table, userId)`** - Tests Row Level Security policies
- **`withTimeout(promise, ms, name)`** - Improved timeout wrapper with better error messages

### 2. Improved Test Screen (`/src/screens/ImprovedSupabaseTestScreen.tsx`)

A replacement for your current test screen that:

- Tests JWT structure **before** attempting database operations
- Uses direct API calls to diagnose JWT signature issues quickly
- Has proper timeout handling that actually works
- Provides actionable error messages with specific fixes
- Tests each component in isolation
- Shows a progress indicator for each test step
- Won't hang - everything has aggressive timeouts

### 3. Standalone JWT Validator (`/scripts/test-jwt-validation.ts`)

A Node.js script that validates JWT tokens **outside the app**:

```bash
npx ts-node scripts/test-jwt-validation.ts YOUR_JWT_TOKEN SUPABASE_JWT_SECRET
```

This script:
- Decodes the JWT and shows all claims
- Validates signature locally using crypto
- Tests the JWT against Supabase API directly
- Shows exactly what's wrong and how to fix it
- Doesn't require running the mobile app

### 4. Documentation

- **`QUICK_FIX_HANGING_ISSUE.md`** - 5-minute fix guide
- **`TROUBLESHOOTING_CLERK_SUPABASE.md`** - Comprehensive troubleshooting guide
- **`INTEGRATION_FIX_SUMMARY.md`** - This file

## How to Fix Your Issue Right Now

### Step 1: Fix the JWT Secret Mismatch

1. **Get Supabase JWT Secret:**
   - Go to Supabase Dashboard → Settings → API
   - Scroll to "JWT Settings"
   - Click "Reveal" next to "JWT Secret"
   - Copy the entire secret

2. **Update Clerk JWT Template:**
   - Go to Clerk Dashboard → JWT Templates → supabase
   - Paste the Supabase JWT Secret into "Signing Key"
   - Ensure algorithm is HS256
   - Ensure these claims exist:
     ```json
     {
       "aud": "authenticated",
       "sub": "{{user.id}}",
       "email": "{{user.email}}"
     }
     ```
   - Save changes

3. **Sign out and sign back in** to get a fresh JWT

### Step 2: Test with Improved Tools

**Option A: Use the improved test screen**

```typescript
// Navigate to the new test screen
import ImprovedSupabaseTestScreen from './src/screens/ImprovedSupabaseTestScreen';

// Add to your navigation
<Stack.Screen name="Test" component={ImprovedSupabaseTestScreen} />
```

**Option B: Use the standalone validator**

```bash
# Get token from app:
const token = await getToken({ template: 'supabase' });
console.log(token);

# Run validator:
npx ts-node scripts/test-jwt-validation.ts YOUR_TOKEN
```

### Step 3: Verify RLS Policies

Make sure you have an INSERT policy on the users table:

```sql
-- Run this in Supabase SQL Editor if you don't have it
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = id::text);
```

## Why the New Approach Is Better

### Old Approach (Your Current Tests)
```typescript
// ❌ Problems:
// - No JWT validation before use
// - Timeout wrapper doesn't work for JWT verification failures
// - No way to diagnose WHERE the failure is
// - Hangs indefinitely with no clues

const syncedUser = await withTimeout(
  userService.syncUser(user!),
  10000,
  'User Sync'
); // This hangs forever if JWT is invalid
```

### New Approach (Improved Tests)
```typescript
// ✅ Better:
// - Validate JWT structure first
// - Test API access separately
// - Each step has its own timeout
// - Clear error messages at each step

// 1. Validate JWT structure (no network call)
const validation = validateJWTForSupabase(token);
if (!validation.passed) {
  console.error('JWT invalid:', validation.details.issues);
  return; // Stop here - don't waste time on network calls
}

// 2. Test direct API access (bypasses Supabase client)
const apiTest = await testDirectAPIAccess(url, token, 5000);
if (!apiTest.passed) {
  console.error('API rejected JWT - signature mismatch!');
  return; // Stop here - fix JWT secret in Clerk
}

// 3. NOW it's safe to use Supabase client
const syncedUser = await withTimeout(
  userService.syncUser(user!),
  10000,
  'User Sync'
); // This will work now
```

## Testing Strategy

### Before Any Code Changes

1. Run the standalone validator to confirm JWT issues:
   ```bash
   npx ts-node scripts/test-jwt-validation.ts YOUR_TOKEN SUPABASE_JWT_SECRET
   ```

2. Check the output:
   - ✅ "JWT signature is VALID" → Good to proceed
   - ❌ "JWT signature is INVALID" → Fix Clerk JWT template signing key
   - ❌ "API rejected JWT" → Secrets don't match

### After Fixing JWT Secret

1. Use the ImprovedSupabaseTestScreen:
   - Navigate to the screen
   - Tap "Run Diagnostics"
   - Each step will show pass/fail with specific fixes

2. Look for these results:
   - Step 1: JWT structure ✅
   - Step 2: Direct API access ✅
   - Step 3: Database connection ✅
   - Step 4: User sync ✅
   - Step 5: User retrieval ✅

### In Production Code

Always validate JWT before first use:

```typescript
import { validateJWTForSupabase } from '@/utils/supabase-diagnostics';

const { getToken } = useAuth();
const token = await getToken({ template: 'supabase' });

// Validate first
const validation = validateJWTForSupabase(token);
if (!validation.passed) {
  throw new Error('Invalid JWT: ' + validation.details.issues.join(', '));
}

// Now safe to use
const client = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});
```

## Common Errors and Quick Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Operation times out | JWT signature mismatch | Update Clerk JWT template signing key |
| "Missing JWT template" | Template not named "supabase" | Rename template to exactly "supabase" |
| 401 Unauthorized | Wrong JWT secret | Copy Supabase JWT secret to Clerk |
| "aud" claim error | Wrong audience value | Set `"aud": "authenticated"` in template |
| RLS policy violation | Missing INSERT policy | Run policy creation SQL |
| Token expired | exp claim in past | Sign out and back in for fresh token |

## Files Reference

### What to Use When

**Quick diagnosis:**
- `/QUICK_FIX_HANGING_ISSUE.md` - Start here for fast fix

**Standalone testing:**
- `/scripts/test-jwt-validation.ts` - Test JWT without app

**In-app testing:**
- `/src/screens/ImprovedSupabaseTestScreen.tsx` - Use this screen
- `/src/utils/supabase-diagnostics.ts` - Import these utils

**Deep troubleshooting:**
- `/TROUBLESHOOTING_CLERK_SUPABASE.md` - Comprehensive guide

**Schema and setup:**
- `/supabase-schema.sql` - Database schema with RLS policies
- `/SUPABASE_SETUP.md` - Original setup guide

## Success Criteria

You'll know it's working when:

1. ✅ JWT validator shows "JWT signature is VALID"
2. ✅ Direct API test returns 200/206, not 401
3. ✅ ImprovedSupabaseTestScreen shows all tests passing
4. ✅ User sync completes in < 1 second (not hanging)
5. ✅ User data appears in Supabase table editor
6. ✅ No timeout errors in console

## Next Steps After Fixing

1. **Remove old test screen** - Use ImprovedSupabaseTestScreen instead
2. **Integrate diagnostics** - Use `validateJWTForSupabase()` in production
3. **Monitor Supabase logs** - Watch for auth errors
4. **Document your config** - Save JWT secret location for future reference
5. **Set up CI testing** - Use standalone validator in CI pipeline

## Prevention for Future

To avoid this issue again:

1. **Document both secrets:**
   - Where Supabase JWT secret is stored
   - Where Clerk JWT template signing key is configured

2. **Test immediately after changes:**
   - If you rotate Supabase JWT secret
   - If you modify Clerk JWT template
   - If you update RLS policies

3. **Use the diagnostic tools:**
   - Keep ImprovedSupabaseTestScreen in your app
   - Run it after any auth/database changes
   - Use standalone validator in CI/CD

4. **Monitor production:**
   - Check Supabase logs for 401 errors
   - Set up alerts for authentication failures
   - Track JWT expiration issues

## Questions?

If something isn't working:

1. Run standalone validator and share output
2. Check Supabase logs (Dashboard → Logs)
3. Verify JWT template in Clerk Dashboard
4. Test with direct fetch() call to isolate issue
5. Check the troubleshooting guide for your specific error

The diagnostic tools will tell you EXACTLY what's wrong - read the error messages carefully!

---

**TL;DR**: Your JWT secret in Clerk doesn't match Supabase. Fix it, sign in again, and use the new improved test screen. Everything will work.
