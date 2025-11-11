# Supabase + Clerk Integration Setup Guide

This guide will walk you through setting up Supabase to work with your Clerk-authenticated React Native Expo app.

## Overview

The integration uses:
- **Clerk** for authentication (email/password and OAuth)
- **Supabase** for database and file storage
- **JWT Templates** to bridge Clerk authentication with Supabase Row Level Security

## Prerequisites

- Active Clerk account with a configured project
- Node.js and npm installed
- Expo CLI installed

---

## Phase 1: Supabase Project Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - Project name (e.g., "video-app")
   - Database password (save this securely!)
   - Region (choose closest to your users)
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### Step 2: Get Supabase Credentials

1. In your Supabase project, go to **Settings > API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (safe for client-side use)
3. Go to **Settings > API > JWT Settings**
4. Copy the **JWT Secret** (you'll need this for Clerk)

### Step 3: Update Environment Variables

Update your `.env` file with the Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Phase 2: Clerk JWT Template Setup

### Step 1: Create JWT Template in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **JWT Templates** in the sidebar
4. Click **"New template"**
5. Select **"Supabase"** from the template options

### Step 2: Configure the Template

1. **Template Name**: `supabase` (exactly this name)
2. **Signing Key**: Paste your **Supabase JWT Secret** from earlier
3. **Token Lifetime**: `3600` seconds (1 hour recommended)
4. Click **"Apply Changes"**

The template should include these default claims:
```json
{
  "iss": "https://your-clerk-instance",
  "sub": "{{user.id}}",
  "aud": "authenticated",
  "exp": "{{token.exp}}",
  "iat": "{{token.iat}}",
  "email": "{{user.email}}",
  "app_metadata": {
    "provider": "clerk"
  },
  "user_metadata": {
    "email": "{{user.email}}",
    "email_verified": "{{user.email_verified}}"
  }
}
```

---

## Phase 3: Database Schema Setup

### Step 1: Create Users Table

In your Supabase project, go to **SQL Editor** and run:

```sql
-- Users table to sync with Clerk
CREATE TABLE public.users (
  id TEXT PRIMARY KEY, -- Clerk user ID (e.g., "user_xxxxx")
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING ((auth.jwt() ->> 'sub'::text) = id::text);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING ((auth.jwt() ->> 'sub'::text) = id::text)
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = id::text);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Create Videos Table

```sql
-- Videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Video metadata
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,

  -- Style and settings
  style TEXT NOT NULL CHECK (style IN ('cinematic', 'anime', 'realistic', 'abstract')),
  duration INTEGER NOT NULL,
  aspect_ratio TEXT NOT NULL CHECK (aspect_ratio IN ('16:9', '9:16', '1:1', '4:3')),
  fps INTEGER NOT NULL CHECK (fps IN (24, 30, 60)),

  -- Storage paths
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  source_image_path TEXT,

  -- File info
  file_size BIGINT,
  mime_type TEXT DEFAULT 'video/mp4',

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed', 'queued')),
  error_message TEXT,

  -- Engagement
  is_favorite BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_videos_status ON public.videos(status);
CREATE INDEX idx_videos_favorites ON public.videos(user_id, is_favorite) WHERE is_favorite = true;

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own videos"
  ON public.videos FOR SELECT
  USING ((auth.jwt() ->> 'sub'::text) = user_id::text);

CREATE POLICY "Users can insert own videos"
  ON public.videos FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = user_id::text);

CREATE POLICY "Users can update own videos"
  ON public.videos FOR UPDATE
  USING ((auth.jwt() ->> 'sub'::text) = user_id::text)
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = user_id::text);

CREATE POLICY "Users can delete own videos"
  ON public.videos FOR DELETE
  USING ((auth.jwt() ->> 'sub'::text) = user_id::text);

-- Updated_at trigger
CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## Phase 4: Storage Buckets Setup

### Step 1: Create Storage Buckets

In Supabase **SQL Editor**, run:

```sql
-- Create videos bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
);

-- Create thumbnails bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create source-images bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'source-images',
  'source-images',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);
```

### Step 2: Set Storage Security Policies

```sql
-- Videos bucket policies
CREATE POLICY "Users can upload own videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos' AND
    (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'videos' AND
    (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'videos' AND
    (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'videos' AND
    (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

-- Thumbnails policies
CREATE POLICY "Anyone can view thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload own thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails' AND
    (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'thumbnails' AND
    (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

-- Source images policies
CREATE POLICY "Users can upload own source images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'source-images' AND
    (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own source images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'source-images' AND
    (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own source images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'source-images' AND
    (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );
```

---

## Phase 5: Testing the Integration

### Step 1: Test JWT Token Generation

Add this temporarily to your app to verify JWT generation:

```typescript
import { useAuth } from '@clerk/clerk-expo';

const { getToken } = useAuth();
const token = await getToken({ template: 'supabase' });
console.log('Supabase JWT:', token);
```

You should see a JWT token logged. Verify it contains:
- `sub`: Your Clerk user ID
- `email`: Your email address
- `aud`: "authenticated"

### Step 2: Test User Sync

After signing in with Clerk, test user sync:

```typescript
import { useUser } from '@clerk/clerk-expo';
import { useSupabase } from './src/hooks/useSupabase';
import { UserService } from './src/services/userService';

const { user } = useUser();
const { client } = useSupabase();

if (user && client) {
  const userService = new UserService(client);
  await userService.syncUser(user);
  console.log('User synced to Supabase!');
}
```

### Step 3: Verify Database Access

Check Supabase dashboard **Table Editor** to see if:
1. User record was created in `users` table
2. User ID matches Clerk user ID

### Step 4: Test Video Upload

Use the `useVideoUpload` hook:

```typescript
import { useVideoUpload } from './src/hooks/useVideoUpload';

const { uploadVideo, progress } = useVideoUpload();

await uploadVideo(videoUri, {
  prompt: "Test video",
  style: "cinematic",
  duration: 5,
  aspectRatio: "16:9",
  fps: 30
});
```

---

## Troubleshooting

### Issue: "JWT is invalid" Error

**Solution:**
- Verify JWT secret in Clerk matches Supabase JWT secret exactly
- Check template name is exactly `supabase`
- Ensure you're calling `getToken({ template: 'supabase' })`

### Issue: "Row Level Security" Policy Error

**Solution:**
- Verify RLS policies were created correctly
- Test policy in SQL editor:
  ```sql
  SELECT set_config('request.jwt.claims', '{"sub": "user_123"}', TRUE);
  SELECT * FROM videos;
  ```

### Issue: Upload Fails with Permission Error

**Solution:**
- Check storage policies were created
- Verify file path format: `{userId}/{timestamp}.mp4`
- Ensure user is authenticated before upload

### Issue: Videos Not Appearing

**Solution:**
- Check `videos` table in Supabase dashboard
- Verify `user_id` matches Clerk user ID
- Check RLS policies allow SELECT access

---

## Code Implementation Files Created

✅ `/src/lib/supabase.ts` - Base Supabase client
✅ `/src/hooks/useSupabase.ts` - Authenticated Supabase client hook
✅ `/src/types/supabase.ts` - TypeScript types
✅ `/src/services/userService.ts` - User CRUD operations
✅ `/src/services/videoService.ts` - Video metadata operations
✅ `/src/services/storageService.ts` - File upload/download
✅ `/src/hooks/useVideoUpload.ts` - Video upload with progress
✅ `/src/hooks/useVideos.ts` - Fetch and manage videos

---

## Next Steps

After completing this setup:

1. **Integrate into your app screens:**
   - Update VideoGenerationScreen to use `useVideoUpload`
   - Update HomeScreen to use `useVideos`
   - Add user sync on app load

2. **Test thoroughly:**
   - Sign in with Clerk
   - Upload a video
   - View videos list
   - Toggle favorites
   - Delete videos

3. **Monitor in Supabase dashboard:**
   - Check logs for errors
   - Monitor storage usage
   - Review database queries

---

## Security Checklist

- [ ] JWT Template configured in Clerk
- [ ] JWT Secret matches between Clerk and Supabase
- [ ] RLS enabled on all tables
- [ ] Storage policies restrict access by user
- [ ] Environment variables properly configured
- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` in client

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase + Clerk Integration Guide](https://supabase.com/docs/guides/auth/social-login/auth-clerk)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Questions or Issues?** Check the Troubleshooting section above or reach out for help!
