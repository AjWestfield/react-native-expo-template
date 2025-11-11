# Clerk + Supabase Integration - Complete Diagnostic Suite

This directory contains a comprehensive set of tools and guides to diagnose and fix Clerk + Supabase integration issues, particularly the "hanging operations" problem.

## 📋 What's Included

### 🔧 Diagnostic Tools

1. **`/src/utils/supabase-diagnostics.ts`**
   - Utility functions for testing JWT and Supabase integration
   - Can be imported and used anywhere in your app
   - Functions: `validateJWTForSupabase()`, `testDirectAPIAccess()`, `withTimeout()`, etc.

2. **`/src/screens/ImprovedSupabaseTestScreen.tsx`**
   - Drop-in replacement for your current test screen
   - Tests each component separately with clear pass/fail indicators
   - Provides actionable error messages
   - Won't hang - everything has timeouts

3. **`/scripts/test-jwt-validation.ts`**
   - Standalone Node.js script
   - Test JWT tokens without running the mobile app
   - Validates signature locally
   - Tests against Supabase API directly

### 📚 Documentation

1. **`QUICK_FIX_HANGING_ISSUE.md`** ⭐ START HERE
   - 5-minute fix guide
   - Step-by-step instructions to fix the hanging issue
   - No technical knowledge required

2. **`INTEGRATION_FIX_SUMMARY.md`**
   - Overview of what was wrong and how it's fixed
   - Explains the new testing approach
   - Comparison of old vs new methods

3. **`TROUBLESHOOTING_CLERK_SUPABASE.md`**
   - Comprehensive troubleshooting guide
   - All possible errors and their fixes
   - Advanced diagnostic techniques

4. **`QUICK_REFERENCE.md`**
   - One-page cheat sheet
   - Quick commands and code snippets
   - Print-friendly reference card

5. **`SUPABASE_SETUP.md`** (existing)
   - Original setup instructions
   - Still valid for initial configuration

6. **`supabase-schema.sql`** (existing)
   - Database schema with RLS policies
   - Run this in Supabase SQL Editor

## 🚀 Quick Start

### If Your Tests Are Hanging Right Now

1. Read `QUICK_FIX_HANGING_ISSUE.md` (5 minutes)
2. Follow the 3 steps to fix JWT secret
3. Sign out and sign back in
4. Run tests again - should work!

### If You Want to Understand What Happened

1. Read `INTEGRATION_FIX_SUMMARY.md` (10 minutes)
2. Learn about JWT validation and why it was hanging
3. Understand the new testing approach

### If Tests Still Fail After Quick Fix

1. Use ImprovedSupabaseTestScreen in your app:
   ```typescript
   import ImprovedSupabaseTestScreen from './src/screens/ImprovedSupabaseTestScreen';
   // Navigate to this screen and run diagnostics
   ```

2. Or run standalone validator:
   ```bash
   # Get token from app first
   const token = await getToken({ template: 'supabase' });
   console.log(token);

   # Then run
   npx ts-node scripts/test-jwt-validation.ts YOUR_TOKEN
   ```

3. Follow error messages - they're actionable!

4. Check `TROUBLESHOOTING_CLERK_SUPABASE.md` for specific errors

## 📖 Documentation Guide

### Choose Your Path

**Path 1: "Just Fix It" (Recommended)**
1. `QUICK_FIX_HANGING_ISSUE.md` - Fix the immediate issue
2. `QUICK_REFERENCE.md` - Bookmark for future reference
3. Done! ✅

**Path 2: "Understand Everything"**
1. `INTEGRATION_FIX_SUMMARY.md` - What happened and why
2. `TROUBLESHOOTING_CLERK_SUPABASE.md` - Deep dive into all issues
3. `SUPABASE_SETUP.md` - Review original setup
4. Experiment with diagnostic tools
5. Become an expert! 🎓

**Path 3: "Tests Still Failing"**
1. `QUICK_FIX_HANGING_ISSUE.md` - Try the quick fix first
2. Use ImprovedSupabaseTestScreen - Run diagnostics
3. Use standalone validator - Get detailed output
4. `TROUBLESHOOTING_CLERK_SUPABASE.md` - Find your specific error
5. Follow the fix for that error
6. Success! 🎉

## 🎯 File Purpose at a Glance

| File | When to Use | Time Needed |
|------|-------------|-------------|
| QUICK_FIX_HANGING_ISSUE.md | Tests hanging, need immediate fix | 5 min |
| INTEGRATION_FIX_SUMMARY.md | Want to understand the issue | 10 min |
| TROUBLESHOOTING_CLERK_SUPABASE.md | Debugging specific errors | 15-30 min |
| QUICK_REFERENCE.md | Quick lookup while coding | 1 min |
| ImprovedSupabaseTestScreen.tsx | In-app diagnostics | 2 min |
| test-jwt-validation.ts | Test without app | 2 min |
| supabase-diagnostics.ts | Import in production code | - |

## 🛠️ Using the Tools

### In Your App (Recommended)

```typescript
// 1. Add the improved test screen to your navigation
import ImprovedSupabaseTestScreen from './src/screens/ImprovedSupabaseTestScreen';

<Stack.Screen name="SupabaseTest" component={ImprovedSupabaseTestScreen} />

// 2. Navigate to it and run diagnostics
navigation.navigate('SupabaseTest');

// 3. Tap "Run Diagnostics" button

// 4. Read the results - they're actionable!
```

### In Production Code

```typescript
// Always validate JWT before first use
import { validateJWTForSupabase } from './src/utils/supabase-diagnostics';

const token = await getToken({ template: 'supabase' });
const validation = validateJWTForSupabase(token);

if (!validation.passed) {
  console.error('JWT invalid:', validation.details.issues);
  // Handle error appropriately
  return;
}

// Safe to use now
const client = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});
```

```typescript
// Always wrap Supabase calls with timeout
import { withTimeout } from './src/utils/supabase-diagnostics';

try {
  const result = await withTimeout(
    client.from('users').select(),
    5000,
    'Get users'
  );
  // Use result
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout - likely JWT issue
  } else {
    // Handle other errors
  }
}
```

### Standalone Testing (No App Needed)

```bash
# Terminal command
npx ts-node scripts/test-jwt-validation.ts YOUR_JWT_TOKEN

# With secret for signature verification
npx ts-node scripts/test-jwt-validation.ts YOUR_JWT_TOKEN YOUR_SUPABASE_JWT_SECRET

# Output shows exactly what's wrong
```

## 🐛 Common Issues and Solutions

### "Where do I find the Supabase JWT Secret?"

Supabase Dashboard → Settings → API → JWT Settings → Reveal

(This is NOT the anon key!)

### "Where do I update the Clerk signing key?"

Clerk Dashboard → JWT Templates → supabase → Signing Key field

### "Tests still hang after updating secret"

1. Sign out completely
2. Sign back in (to get fresh JWT)
3. Run tests again

### "How do I know if it's working?"

✅ JWT validator shows "PASSED"
✅ Direct API test returns 200/206
✅ User sync completes in < 1 second
✅ No timeouts in console

### "Which test screen should I use?"

Use `ImprovedSupabaseTestScreen.tsx` - it's better in every way:
- Tests JWT before database operations
- Has proper timeout handling
- Shows actionable errors
- Won't hang forever

## 📦 What Each File Does

### `/src/utils/supabase-diagnostics.ts`

**Purpose:** Utility functions for JWT and Supabase testing

**Functions:**
- `validateJWTForSupabase(token)` - Validate JWT structure
- `decodeJWT(token)` - Decode JWT without verification
- `testDirectAPIAccess(url, token, timeout)` - Test API with JWT
- `testDatabaseConnection(client, timeout)` - Test basic connectivity
- `testJWTAuthentication(client, userId, timeout)` - Test JWT in use
- `testRLSPolicies(client, table, userId, timeout)` - Test RLS
- `withTimeout(promise, ms, name)` - Timeout wrapper
- `runComprehensiveDiagnostics(client, token, userId)` - Run all tests

**Usage:**
```typescript
import { validateJWTForSupabase } from './src/utils/supabase-diagnostics';
```

### `/src/screens/ImprovedSupabaseTestScreen.tsx`

**Purpose:** In-app diagnostic UI

**Features:**
- 6-step diagnostic process
- Visual progress indicator
- Actionable error messages
- Test summary at bottom
- Sign out button
- Cancel button for running tests

**Usage:**
Add to navigation and navigate to it when needed.

### `/scripts/test-jwt-validation.ts`

**Purpose:** Standalone JWT validator (no app needed)

**Features:**
- Decodes JWT and shows all claims
- Validates structure against Supabase requirements
- Verifies signature locally (if secret provided)
- Tests against Supabase API directly
- Shows detailed diagnostics

**Usage:**
```bash
npx ts-node scripts/test-jwt-validation.ts JWT_TOKEN [JWT_SECRET]
```

## 🎓 Learning Resources

### Understanding the Problem

The hanging issue occurs because:
1. Clerk signs JWT with one secret
2. Supabase expects JWT signed with different secret
3. When signatures don't match, verification hangs in React Native
4. No timeout enforced, operation never completes

### Understanding the Solution

The fix requires:
1. Making sure Clerk and Supabase use the SAME secret
2. Validating JWT structure before using it
3. Testing API access separately from client operations
4. Using proper timeouts on all operations

### Best Practices

1. **Always validate JWT first** - Catch issues before network calls
2. **Use timeouts** - Don't let operations hang forever
3. **Test incrementally** - Test each component separately
4. **Monitor logs** - Check Supabase logs for server-side errors
5. **Document config** - Know where both secrets are stored

## 🔄 Maintenance

### When to Re-run Diagnostics

- After changing Clerk JWT template
- After rotating Supabase JWT secret
- After modifying RLS policies
- When authentication issues occur
- After Supabase project migration
- When onboarding new developers

### Keeping Tools Updated

These diagnostic tools are self-contained and don't need updates unless:
- Supabase changes JWT verification behavior
- Clerk changes JWT issuance process
- React Native fetch() implementation changes

## 🆘 Getting Help

If you're stuck after trying everything:

1. Run standalone validator and save output
2. Run ImprovedSupabaseTestScreen and screenshot results
3. Check Supabase logs (Dashboard → Logs)
4. Verify JWT template in Clerk Dashboard
5. Check `TROUBLESHOOTING_CLERK_SUPABASE.md` for your specific error
6. The diagnostic tools show EXACTLY what's wrong - read carefully!

## ✅ Success Checklist

After fixing the issue, you should have:

- [ ] JWT secret in Clerk matches Supabase
- [ ] Algorithm is HS256
- [ ] aud claim is "authenticated"
- [ ] RLS policies exist (SELECT, INSERT, UPDATE)
- [ ] All tests in ImprovedSupabaseTestScreen pass
- [ ] User sync completes in < 1 second
- [ ] No hanging or timeout errors
- [ ] User data appears in Supabase Dashboard

## 🎉 You're Done!

Once all diagnostics pass:
1. Remove debug logging
2. Integrate into your app
3. Use the diagnostic utils in production
4. Keep QUICK_REFERENCE.md handy
5. Build amazing things! 🚀

---

**Questions?** Start with `QUICK_FIX_HANGING_ISSUE.md` and follow the breadcrumbs from there!
