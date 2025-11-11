-- ============================================================================
-- Supabase Database Schema for Video Generation App
-- ============================================================================
-- This file contains all SQL commands needed to set up your Supabase database
-- Run this in the Supabase SQL Editor in this order:
-- 1. Tables and RLS
-- 2. Storage Buckets
-- 3. Storage Policies
-- ============================================================================

-- ============================================================================
-- SECTION 1: TABLES AND ROW LEVEL SECURITY
-- ============================================================================

-- Users table to sync with Clerk
CREATE TABLE public.users (
  id TEXT PRIMARY KEY, -- Clerk user ID (e.g., "user_xxxxx")
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING ((auth.jwt() ->> 'sub'::text) = id::text);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = id::text);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING ((auth.jwt() ->> 'sub'::text) = id::text)
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = id::text);

-- Helper function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================

-- Videos table for storing video metadata
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

  -- Additional metadata (JSON for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance optimization
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_videos_status ON public.videos(status);
CREATE INDEX idx_videos_favorites ON public.videos(user_id, is_favorite) WHERE is_favorite = true;

-- Enable RLS on videos table
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos table
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

-- Trigger to auto-update updated_at on videos table
CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================

-- Optional: Video templates table for pre-loaded camera styles
CREATE TABLE public.video_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  style TEXT NOT NULL CHECK (style IN ('cinematic', 'anime', 'realistic', 'abstract')),
  thumbnail_gradient JSONB NOT NULL, -- Array of color strings
  default_duration INTEGER DEFAULT 5,
  default_aspect_ratio TEXT DEFAULT '16:9',
  default_fps INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on video_templates table
ALTER TABLE public.video_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Templates are viewable by everyone
CREATE POLICY "Templates are viewable by everyone"
  ON public.video_templates FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- SECTION 2: STORAGE BUCKETS
-- ============================================================================

-- Create videos bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false, -- Private bucket
  104857600, -- 100MB file size limit
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
) ON CONFLICT (id) DO NOTHING;

-- Create thumbnails bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true, -- Public bucket
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create source-images bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'source-images',
  'source-images',
  false, -- Private bucket
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 3: STORAGE SECURITY POLICIES
-- ============================================================================

-- Videos bucket policies (private access)
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

-- Thumbnails bucket policies (public read, user write)
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

-- Source images bucket policies (private access)
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

-- ============================================================================
-- SECTION 4: HELPER FUNCTIONS (Optional)
-- ============================================================================

-- Custom function to extract Clerk user ID from JWT
-- Note: Supabase's auth.uid() doesn't work with Clerk JWTs
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    NULL
  )::text;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify setup:

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check storage buckets
-- SELECT * FROM storage.buckets;

-- Check storage policies
-- SELECT * FROM pg_policies WHERE schemaname = 'storage';

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. File paths in storage must follow format: {userId}/{filename}
-- 2. The JWT from Clerk must contain 'sub' claim with user ID
-- 3. All RLS policies use: auth.jwt() ->> 'sub' to get user ID
-- 4. Make sure Clerk JWT template is configured with Supabase JWT secret
-- ============================================================================
