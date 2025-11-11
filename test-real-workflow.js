/**
 * Real-world workflow test
 * Simulates what your app will do: create user, save video, fetch videos
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://csgivxxfumtrpqwcgwth.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZ2l2eHhmdW10cnBxd2Nnd3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTQyMzEsImV4cCI6MjA3ODQzMDIzMX0.BN4dAOLg37PXe1PSbxKkIL6RudjO58PercD880kh8rk';

async function testRealWorkflow() {
  console.log('\n🎬 REAL WORKFLOW TEST\n');
  console.log('Simulating actual app usage...\n');

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const testUserId = 'user_workflow_' + Date.now();

  try {
    // Step 1: User signs in and syncs to Supabase
    console.log('1️⃣ User Sign In - Sync to Supabase');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'testuser@example.com',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      })
      .select()
      .single();

    if (userError) throw userError;
    console.log('   ✅ User created:', user.email);

    // Step 2: User generates a video and saves metadata
    console.log('\n2️⃣ Video Generated - Save Metadata');
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert({
        user_id: testUserId,
        title: 'My First Video',
        description: 'A beautiful cinematic scene',
        prompt: 'Man walking dog in sunset',
        style: 'cinematic',
        duration: 5,
        aspect_ratio: '16:9',
        fps: 30,
        storage_path: `${testUserId}/video_${Date.now()}.mp4`,
        thumbnail_path: `${testUserId}/thumb_${Date.now()}.jpg`,
        status: 'ready'
      })
      .select()
      .single();

    if (videoError) throw videoError;
    console.log('   ✅ Video saved:', video.id);
    console.log('   Title:', video.title);
    console.log('   Storage:', video.storage_path);

    // Step 3: User opens Gallery - Fetch their videos
    console.log('\n3️⃣ Gallery Screen - Fetch User Videos');
    const { data: videos, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    console.log('   ✅ Fetched videos:', videos.length);
    videos.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.title} (${v.style})`);
    });

    // Step 4: User favorites a video
    console.log('\n4️⃣ User Favorites Video');
    const { data: favorited, error: favError } = await supabase
      .from('videos')
      .update({ is_favorite: true })
      .eq('id', video.id)
      .select()
      .single();

    if (favError) throw favError;
    console.log('   ✅ Video favorited:', favorited.is_favorite);

    // Step 5: Fetch only favorites
    console.log('\n5️⃣ Fetch Favorite Videos');
    const { data: favorites, error: favFetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', testUserId)
      .eq('is_favorite', true);

    if (favFetchError) throw favFetchError;
    console.log('   ✅ Favorites found:', favorites.length);

    // Cleanup
    console.log('\n🧹 Cleanup...');
    await supabase.from('videos').delete().eq('user_id', testUserId);
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('   ✅ Test data removed');

    console.log('\n====================================');
    console.log('🎉 REAL WORKFLOW TEST PASSED!');
    console.log('====================================\n');
    console.log('✅ User sync works');
    console.log('✅ Video metadata save works');
    console.log('✅ Video fetch works');
    console.log('✅ Video update works');
    console.log('✅ Filtering works\n');
    console.log('Your app is ready to use Supabase!\n');

  } catch (error) {
    console.error('\n❌ WORKFLOW FAILED:', error.message);
    console.error('\nFull error:', error);

    // Cleanup on error
    try {
      await supabase.from('videos').delete().eq('user_id', testUserId);
      await supabase.from('users').delete().eq('id', testUserId);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

testRealWorkflow().catch(console.error);
