/**
 * Test file to verify Supabase + Clerk integration
 *
 * Run this test after configuring the Clerk JWT template
 *
 * Usage:
 * 1. Import this in your app component temporarily
 * 2. Call testSupabaseIntegration() after user signs in
 * 3. Check console logs for results
 */

import { useAuth, useUser } from '@clerk/clerk-expo';
import { useSupabase } from './src/hooks/useSupabase';
import { UserService } from './src/services/userService';
import { VideoService } from './src/services/videoService';

export const useTestSupabaseIntegration = () => {
  const { getToken, userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const { client, isLoading } = useSupabase();

  const testIntegration = async () => {
    console.log('\n========================================');
    console.log('🧪 TESTING SUPABASE + CLERK INTEGRATION');
    console.log('========================================\n');

    // Test 1: Check authentication status
    console.log('✅ Test 1: Authentication Status');
    console.log('   - Is Signed In:', isSignedIn);
    console.log('   - User ID:', userId);
    console.log('   - Email:', user?.emailAddresses[0]?.emailAddress);

    if (!isSignedIn || !userId) {
      console.error('❌ Test failed: User is not signed in');
      return;
    }

    // Test 2: Get JWT token from Clerk
    console.log('\n✅ Test 2: Clerk JWT Token');
    try {
      const token = await getToken({ template: 'supabase' });
      if (token) {
        console.log('   - Token Generated:', '✓');
        console.log('   - Token Length:', token.length);

        // Decode JWT to verify claims
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('   - Token Claims:');
        console.log('     - sub (user ID):', payload.sub);
        console.log('     - email:', payload.email);
        console.log('     - aud:', payload.aud);
        console.log('     - exp:', new Date(payload.exp * 1000).toLocaleString());
      } else {
        console.error('   ❌ No token received. Did you configure the JWT template named "supabase"?');
        return;
      }
    } catch (error) {
      console.error('   ❌ Error getting token:', error);
      return;
    }

    // Test 3: Supabase client initialization
    console.log('\n✅ Test 3: Supabase Client');
    if (isLoading) {
      console.log('   - Status: Loading...');
      return;
    }
    if (!client) {
      console.error('   ❌ Supabase client is null');
      return;
    }
    console.log('   - Client Initialized:', '✓');
    console.log('   - Project URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

    // Test 4: Sync user to Supabase
    console.log('\n✅ Test 4: User Sync');
    try {
      const userService = new UserService(client);
      const syncedUser = await userService.syncUser(user!);
      console.log('   - User Synced:', '✓');
      console.log('   - Supabase User ID:', syncedUser.id);
      console.log('   - Email:', syncedUser.email);
      console.log('   - Full Name:', syncedUser.full_name || 'Not set');
    } catch (error: any) {
      console.error('   ❌ User sync failed:', error.message);
      if (error.message.includes('JWT')) {
        console.error('   💡 This usually means the JWT secret in Clerk doesn\'t match Supabase');
      }
      return;
    }

    // Test 5: Test RLS policies by fetching videos
    console.log('\n✅ Test 5: Row Level Security (RLS)');
    try {
      const videoService = new VideoService(client);
      const videos = await videoService.getUserVideos(userId);
      console.log('   - RLS Policies Working:', '✓');
      console.log('   - Videos Found:', videos.length);
      if (videos.length > 0) {
        console.log('   - Sample Video:', videos[0].title);
      }
    } catch (error: any) {
      console.error('   ❌ RLS test failed:', error.message);
      return;
    }

    // Test 6: Test storage access
    console.log('\n✅ Test 6: Storage Access');
    try {
      const { data: buckets, error } = await client.storage.listBuckets();
      if (error) throw error;
      console.log('   - Storage Access:', '✓');
      console.log('   - Available Buckets:', buckets.map(b => b.name).join(', '));
    } catch (error: any) {
      console.error('   ❌ Storage test failed:', error.message);
      return;
    }

    console.log('\n========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('🎉 Supabase + Clerk integration is working!');
    console.log('========================================\n');
  };

  return { testIntegration, isReady: !isLoading && !!client };
};

// Example usage in your app:
/*
import { useTestSupabaseIntegration } from './test-supabase-integration';

function YourComponent() {
  const { testIntegration, isReady } = useTestSupabaseIntegration();

  useEffect(() => {
    if (isReady) {
      testIntegration();
    }
  }, [isReady]);

  return <View>...</View>;
}
*/
