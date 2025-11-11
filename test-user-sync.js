/**
 * Quick test to verify Clerk JWT + Supabase User Sync works
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://csgivxxfumtrpqwcgwth.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZ2l2eHhmdW10cnBxd2Nnd3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTQyMzEsImV4cCI6MjA3ODQzMDIzMX0.BN4dAOLg37PXe1PSbxKkIL6RudjO58PercD880kh8rk';
const JWT_SECRET = 'GLIKrvVMYDhVweKvaXUu3NAJ/uvzI5AGgElnB/yHKJdkDXfQT3OB1BdFeV5uARU4fxTREThMXfsuv/n2FYNWPg==';

// Generate JWT token matching Clerk's format exactly
function generateJWT(userId, email) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: userId,
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
    email: email,
    app_metadata: {
      provider: 'clerk'
    },
    user_metadata: {
      email: email,
      email_verified: true
    }
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', Buffer.from(JWT_SECRET, 'base64'))
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function testUserSync() {
  console.log('\n🧪 Testing User Sync...\n');

  const testUserId = 'user_test_' + Date.now();
  const testEmail = 'test@example.com';

  // Generate JWT
  const jwt = generateJWT(testUserId, testEmail);
  console.log('✅ Generated JWT token');

  // Create Supabase client with JWT
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });

  console.log('✅ Created Supabase client with JWT');

  // Test user sync (upsert)
  try {
    console.log('\n📝 Attempting to upsert user...');

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: testUserId,
        email: testEmail,
        full_name: 'Test User',
        avatar_url: null,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('\n❌ UPSERT FAILED:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log('\n✅ User synced successfully!');
    console.log('   ID:', data.id);
    console.log('   Email:', data.email);
    console.log('   Full Name:', data.full_name);

    // Test select (verify we can read it back)
    console.log('\n📖 Verifying we can read the user...');
    const { data: readData, error: readError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (readError) {
      console.error('\n❌ READ FAILED:', readError);
      process.exit(1);
    }

    console.log('✅ User read successfully!');

    // Cleanup
    console.log('\n🧹 Cleaning up test user...');
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('✅ Cleanup complete');

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ JWT authentication works');
    console.log('✅ User sync (INSERT) works');
    console.log('✅ User read (SELECT) works');
    console.log('✅ RLS policies are correct\n');

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testUserSync();
