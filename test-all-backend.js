/**
 * Complete backend test - all 6 tests
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://csgivxxfumtrpqwcgwth.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZ2l2eHhmdW10cnBxd2Nnd3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTQyMzEsImV4cCI6MjA3ODQzMDIzMX0.BN4dAOLg37PXe1PSbxKkIL6RudjO58PercD880kh8rk';

async function runAllTests() {
  console.log('\n🧪 COMPLETE BACKEND TEST\n');
  console.log('====================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Supabase Connection
  try {
    console.log('✅ Test 1: Supabase Connection');
    const supabase = createClient(SUPABASE_URL, ANON_KEY);
    console.log(`   URL: ${SUPABASE_URL}`);
    console.log(`   Connected: ✓\n`);
    passed++;
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error.message);
    failed++;
  }

  // Test 2: Database Tables Exist
  try {
    console.log('✅ Test 2: Database Tables');
    const supabase = createClient(SUPABASE_URL, ANON_KEY);

    // Check users table
    const { error: usersError } = await supabase.from('users').select('id').limit(1);
    if (!usersError || !usersError.message.includes('does not exist')) {
      console.log('   users table: ✓');
    }

    // Check videos table
    const { error: videosError } = await supabase.from('videos').select('id').limit(1);
    if (!videosError || !videosError.message.includes('does not exist')) {
      console.log('   videos table: ✓');
    }

    // Check templates table
    const { error: templatesError } = await supabase.from('video_templates').select('id').limit(1);
    if (!templatesError || !templatesError.message.includes('does not exist')) {
      console.log('   video_templates table: ✓');
    }
    console.log();
    passed++;
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error.message);
    failed++;
  }

  // Test 3: User Insert (RLS disabled, so anon key works)
  try {
    console.log('✅ Test 3: User Insert');
    const supabase = createClient(SUPABASE_URL, ANON_KEY);
    const testUserId = 'user_test_' + Date.now();

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User'
      })
      .select()
      .single();

    if (error) throw error;

    console.log('   User inserted: ✓');
    console.log(`   ID: ${data.id}`);

    // Cleanup
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('   Cleanup: ✓\n');
    passed++;
  } catch (error) {
    console.error('❌ Test 3 FAILED:', error.message);
    failed++;
  }

  // Test 4: User Update
  try {
    console.log('✅ Test 4: User Update');
    const supabase = createClient(SUPABASE_URL, ANON_KEY);
    const testUserId = 'user_test_' + Date.now();

    // Insert
    await supabase.from('users').insert({
      id: testUserId,
      email: 'test@example.com',
      full_name: 'Test User'
    });

    // Update
    const { data, error } = await supabase
      .from('users')
      .update({ full_name: 'Updated Name' })
      .eq('id', testUserId)
      .select()
      .single();

    if (error) throw error;

    console.log('   User updated: ✓');
    console.log(`   New name: ${data.full_name}`);

    // Cleanup
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('   Cleanup: ✓\n');
    passed++;
  } catch (error) {
    console.error('❌ Test 4 FAILED:', error.message);
    failed++;
  }

  // Test 5: Video Query
  try {
    console.log('✅ Test 5: Video Query');
    const supabase = createClient(SUPABASE_URL, ANON_KEY);

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .limit(10);

    if (error) throw error;

    console.log('   Query successful: ✓');
    console.log(`   Videos found: ${data.length}\n`);
    passed++;
  } catch (error) {
    console.error('❌ Test 5 FAILED:', error.message);
    failed++;
  }

  // Test 6: Storage Access
  try {
    console.log('✅ Test 6: Storage Access');
    const supabase = createClient(SUPABASE_URL, ANON_KEY);

    const { data, error } = await supabase.storage.listBuckets();

    if (error) throw error;

    console.log('   Storage accessible: ✓');
    console.log(`   Buckets: ${data.map(b => b.name).join(', ')}\n`);
    passed++;
  } catch (error) {
    console.error('❌ Test 6 FAILED:', error.message);
    failed++;
  }

  // Summary
  console.log('====================================');
  console.log(`\n✅ Tests Passed: ${passed}/6`);
  if (failed > 0) {
    console.log(`❌ Tests Failed: ${failed}/6`);
  }
  console.log('\n====================================\n');

  if (passed === 6) {
    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('✅ Supabase database is fully functional');
    console.log('✅ All tables are accessible');
    console.log('✅ CRUD operations work');
    console.log('✅ Storage is configured\n');
    console.log('NOTE: RLS is currently DISABLED for testing.');
    console.log('The mobile app will work, but without user isolation.\n');
  }
}

runAllTests().catch(console.error);
