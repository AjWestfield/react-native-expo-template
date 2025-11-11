/**
 * Simple test - bypass RLS using service_role key
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://csgivxxfumtrpqwcgwth.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZ2l2eHhmdW10cnBxd2Nnd3RoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg1NDIzMSwiZXhwIjoyMDc4NDMwMjMxfQ.Srwd6QJcKJl70yHs7orhWBnurX5m4AdonpIuJYXqWi0';

async function test() {
  console.log('\n🧪 Testing Basic Supabase Connection...\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Test 1: Insert user (bypassing RLS with service_role)
  const testUserId = 'user_test_' + Date.now();

  console.log('1. Testing INSERT...');
  const { data: insertData, error: insertError } = await supabase
    .from('users')
    .insert({
      id: testUserId,
      email: 'test@example.com',
      full_name: 'Test User',
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ INSERT FAILED:', insertError);
    process.exit(1);
  }

  console.log('✅ INSERT worked:', insertData.id);

  // Test 2: Read it back
  console.log('\n2. Testing SELECT...');
  const { data: selectData, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('id', testUserId)
    .single();

  if (selectError) {
    console.error('❌ SELECT FAILED:', selectError);
    process.exit(1);
  }

  console.log('✅ SELECT worked:', selectData.email);

  // Cleanup
  console.log('\n3. Cleaning up...');
  await supabase.from('users').delete().eq('id', testUserId);
  console.log('✅ Cleanup complete');

  console.log('\n🎉 Basic Supabase connection works!\n');
  console.log('Now we need to fix the JWT token auth issue for RLS.\n');
}

test().catch(console.error);
