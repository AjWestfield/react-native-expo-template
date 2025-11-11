-- Fix for missing INSERT policy on users table
-- This allows users to create their own record when syncing from Clerk

-- Add INSERT policy for users table
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = id::text);
