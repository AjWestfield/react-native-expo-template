# Clerk + Supabase Quick Reference Card

## 🔥 Emergency Fix (Tests Hanging)

```bash
# 1. Get Supabase JWT Secret
Supabase Dashboard → Settings → API → JWT Settings → Reveal

# 2. Update Clerk
Clerk Dashboard → JWT Templates → supabase → Signing Key → Paste Secret

# 3. Verify
aud claim must be "authenticated"
algorithm must be HS256

# 4. Test
Sign out → Sign in → Run tests
```

---

## 📊 Diagnostic Commands

```bash
# Standalone JWT validation
npx ts-node scripts/test-jwt-validation.ts JWT_TOKEN

# With secret verification
npx ts-node scripts/test-jwt-validation.ts JWT_TOKEN SUPABASE_JWT_SECRET
```

---

## 🧪 Testing Files

| File | Purpose |
|------|---------|
| `ImprovedSupabaseTestScreen.tsx` | In-app diagnostic UI |
| `supabase-diagnostics.ts` | Utility functions |
| `test-jwt-validation.ts` | Standalone validator |

---

## ✅ Required JWT Claims

```json
{
  "aud": "authenticated",  // MUST be this
  "sub": "{{user.id}}",   // Clerk user ID
  "email": "{{user.email}}",
  "exp": {{token.exp}},
  "iat": {{token.iat}}
}
```

---

## 🔐 Required RLS Policies

```sql
-- users table needs all three:
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING ((auth.jwt() ->> 'sub') = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'sub') = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING ((auth.jwt() ->> 'sub') = id)
  WITH CHECK ((auth.jwt() ->> 'sub') = id);
```

---

## 🐛 Quick Diagnostics in Code

```typescript
// Test JWT structure (no network call)
import { validateJWTForSupabase } from '@/utils/supabase-diagnostics';

const token = await getToken({ template: 'supabase' });
const result = validateJWTForSupabase(token);
console.log(result.passed ? 'JWT OK' : 'JWT INVALID');
console.log(result.details.issues); // Shows what's wrong
```

```typescript
// Test API access (bypasses Supabase client)
import { testDirectAPIAccess } from '@/utils/supabase-diagnostics';

const apiTest = await testDirectAPIAccess(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  token,
  5000
);
console.log(apiTest.passed ? 'API OK' : 'JWT REJECTED');
```

```typescript
// Wrap any Supabase operation
import { withTimeout } from '@/utils/supabase-diagnostics';

const result = await withTimeout(
  client.from('users').select(),
  5000,
  'Get users'
);
```

---

## 🚨 Common Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| 401 | JWT signature wrong | Update Clerk signing key |
| PGRST301 | JWT verification failed | Secrets don't match |
| 42501 | RLS policy violation | Missing or wrong policy |
| Timeout | Silent JWT failure | Fix signing key |

---

## 📁 Environment Variables

```env
# .env file
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhb...

# DO NOT put in .env (use in Clerk Dashboard only)
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

---

## 🎯 Testing Checklist

- [ ] JWT template named exactly "supabase"
- [ ] Signing key = Supabase JWT secret
- [ ] Algorithm = HS256
- [ ] aud = "authenticated"
- [ ] RLS enabled on users table
- [ ] INSERT policy exists
- [ ] SELECT policy exists
- [ ] UPDATE policy exists
- [ ] Signed out and back in
- [ ] Tests complete in < 5 seconds

---

## 💡 Pro Tips

1. **Always validate JWT first** before database operations
2. **Use withTimeout** on all Supabase calls
3. **Test with direct fetch()** to isolate issues
4. **Check Supabase logs** for server-side errors
5. **Sign out/in after** JWT template changes

---

## 🔗 Quick Links

- [Supabase Dashboard](https://app.supabase.com)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Supabase Logs](https://app.supabase.com/project/_/logs)
- [Clerk JWT Templates](https://dashboard.clerk.com/jwt-templates)

---

## 📞 When to Use Which Guide

**Just started / quick fix:**
→ `QUICK_FIX_HANGING_ISSUE.md`

**Tests still failing:**
→ `TROUBLESHOOTING_CLERK_SUPABASE.md`

**Understanding the fix:**
→ `INTEGRATION_FIX_SUMMARY.md`

**Initial setup:**
→ `SUPABASE_SETUP.md`

---

## 🎓 Key Concepts

**JWT Flow:**
1. User signs in with Clerk
2. App requests JWT: `getToken({ template: 'supabase' })`
3. Clerk signs JWT with secret from template
4. App sends JWT to Supabase in Authorization header
5. Supabase verifies JWT signature with its JWT secret
6. If match: success, If mismatch: hang/timeout

**Why Operations Hang:**
- JWT signature doesn't match Supabase secret
- PostgREST attempts verification but fails silently
- No timeout in React Native Supabase client
- Request never completes or returns error

**The Fix:**
- Make sure Clerk signing key = Supabase JWT secret
- Validate JWT structure before using it
- Use timeouts on all operations
- Test with direct API calls first

---

**Print this card and keep it handy for quick reference!**
