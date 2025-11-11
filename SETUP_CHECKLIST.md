# Supabase Setup Checklist ✅

## Current Status

### ✅ Completed
- [x] Supabase CLI installed and updated
- [x] Project linked to Supabase
- [x] Environment variables configured
- [x] Database schema applied
  - [x] `users` table created
  - [x] `videos` table created
  - [x] `video_templates` table created
- [x] Storage buckets created
  - [x] `videos` bucket (private)
  - [x] `thumbnails` bucket (public)
  - [x] `source-images` bucket (private)
- [x] RLS policies configured (7 table policies, 10 storage policies)
- [x] Code files created (hooks, services, types)
- [x] Test files created

### 🔄 In Progress - YOU NEED TO DO THIS NOW

#### 1. Configure Clerk JWT Template (5 minutes)

**Your JWT Secret (from Supabase):**
```
GLIKrvVMYDhVweKvaXUu3NAJ/uvzI5AGgElnB/yHKJdkDXfQT3OB1BdFeV5uARU4fxTREThMXfsuv/n2FYNWPg==
```

**Steps:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **JWT Templates**
3. Click **"New template"** → Select **"Supabase"**
4. Configure:
   - **Template Name**: `supabase` (EXACTLY this, case-sensitive)
   - **Signing Algorithm**: `HS256`
   - **Signing Key**: Paste the JWT secret above ⬆️
   - **Token Lifetime**: `3600` seconds
5. Click **"Apply Changes"**

#### 2. Test the Integration (10 minutes)

**Option A: Add Test Screen to Your App**

Add this to your navigation temporarily:

```typescript
import SupabaseTestScreen from './SupabaseTestScreen';

// In your navigator:
<Stack.Screen name="SupabaseTest" component={SupabaseTestScreen} />
```

Then:
1. Start your app: `npx expo start`
2. Sign in with Clerk
3. Navigate to the SupabaseTest screen
4. Tap "Run Tests"
5. Check that all tests pass ✅

**Option B: Manual Console Test**

Add this temporarily to your app after sign-in:

```typescript
import { useAuth } from '@clerk/clerk-expo';

const { getToken } = useAuth();
const token = await getToken({ template: 'supabase' });
console.log('Token:', token ? '✅ Received' : '❌ Failed');
```

---

## What Happens After JWT Template is Configured?

Once you configure the JWT template, the flow works like this:

```
1. User signs in with Clerk
   ↓
2. Clerk generates a JWT token using the "supabase" template
   ↓
3. Token is signed with your Supabase JWT secret
   ↓
4. Token includes user ID, email, and other claims
   ↓
5. Supabase validates the token and extracts user ID
   ↓
6. RLS policies use the user ID to control data access
   ↓
7. ✅ User can only access their own data!
```

---

## Next Steps After Testing

### Phase 1: User Sync on App Load
Edit your root layout or App component:

```typescript
import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useSupabase } from './src/hooks/useSupabase';
import { UserService } from './src/services/userService';

export default function App() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { client } = useSupabase();

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user && client) {
        const userService = new UserService(client);
        await userService.syncUser(user);
      }
    };
    syncUser();
  }, [isSignedIn, user, client]);

  return /* your app */;
}
```

### Phase 2: Update VideoGenerationScreen
Replace video saving logic with:

```typescript
import { useVideoUpload } from './src/hooks/useVideoUpload';

const { uploadVideo, isUploading, progress } = useVideoUpload();

// After generating video:
await uploadVideo(videoUri, {
  prompt: "Your prompt",
  style: "cinematic",
  duration: 5,
  aspectRatio: "16:9",
  fps: 30
});
```

### Phase 3: Update HomeScreen
Replace local video loading with:

```typescript
import { useVideos } from './src/hooks/useVideos';

const { videos, isLoading, refresh } = useVideos({ autoFetch: true });

// Use videos array in your FlatList
```

---

## Troubleshooting

### If Tests Fail:

**"No token received"**
- JWT template name must be exactly `supabase`
- Check template exists in Clerk Dashboard

**"JWT is invalid" or "Invalid signature"**
- JWT secret in Clerk must match Supabase JWT secret
- Copy-paste the secret carefully (no extra spaces)

**"Row Level Security policy violation"**
- User is not properly authenticated
- Check token contains `sub` claim with user ID
- Verify RLS policies in Supabase SQL Editor

**"User not found"**
- User hasn't been synced to Supabase yet
- Run user sync code after sign-in

---

## Files Created for You

### Core Integration
- ✅ `src/lib/supabase.ts` - Base client
- ✅ `src/hooks/useSupabase.ts` - Authenticated client
- ✅ `src/types/supabase.ts` - TypeScript types

### Services
- ✅ `src/services/userService.ts` - User operations
- ✅ `src/services/videoService.ts` - Video metadata
- ✅ `src/services/storageService.ts` - File uploads

### Hooks
- ✅ `src/hooks/useVideoUpload.ts` - Upload with progress
- ✅ `src/hooks/useVideos.ts` - Fetch and manage videos

### Documentation
- ✅ `SUPABASE_SETUP.md` - Full setup guide
- ✅ `INTEGRATION_EXAMPLES.md` - Code examples
- ✅ `supabase-schema.sql` - Database schema

### Testing
- ✅ `SupabaseTestScreen.tsx` - Test screen component
- ✅ `test-supabase-integration.ts` - Test utilities

---

## Quick Commands

```bash
# Start dev server
npx expo start

# View Supabase project
supabase projects list

# Check database tables
psql "postgresql://postgres:Signon\$2023\$@db.csgivxxfumtrpqwcgwth.supabase.co:5432/postgres" -c "\dt public.*"
```

---

## 🎯 Your Next Action

**RIGHT NOW:**
1. Go to Clerk Dashboard
2. Create the JWT template with the secret above
3. Test using SupabaseTestScreen
4. Come back here once tests pass ✅

Good luck! 🚀
