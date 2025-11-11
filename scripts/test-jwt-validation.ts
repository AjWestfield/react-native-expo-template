/**
 * Standalone JWT + Supabase Validation Script
 *
 * This script tests Clerk JWT validation against Supabase without needing the mobile app.
 * Run this to quickly diagnose JWT signing issues.
 *
 * Usage:
 *   1. Get a JWT token from your app (console.log it)
 *   2. Run: npx ts-node scripts/test-jwt-validation.ts YOUR_JWT_TOKEN
 */

import * as crypto from 'crypto';

interface JWTPayload {
  sub: string;
  email?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

interface JWTHeader {
  alg: string;
  typ: string;
}

/**
 * Decode JWT without verification
 */
function decodeJWT(token: string): { header: JWTHeader; payload: JWTPayload } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

  return { header, payload };
}

/**
 * Verify JWT signature using HS256
 */
function verifyJWTSignature(token: string, secret: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const data = `${headerB64}.${payloadB64}`;

  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  const expectedSignature = hmac.digest('base64url');

  return expectedSignature === signatureB64;
}

/**
 * Test JWT against Supabase API directly
 */
async function testJWTWithSupabase(
  supabaseUrl: string,
  anonKey: string,
  jwtToken: string
): Promise<void> {
  console.log('\n🌐 Testing JWT with Supabase API...\n');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
        Prefer: 'count=exact',
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      console.log('   ✅ JWT accepted by Supabase API');
      const data = await response.text();
      console.log(`   Response: ${data || '(empty)'}`);
    } else {
      console.log('   ❌ JWT rejected by Supabase API');
      const error = await response.text();
      console.log(`   Error: ${error}`);

      if (response.status === 401) {
        console.log('\n💡 401 Unauthorized - JWT signature verification failed');
        console.log('   This means the JWT secret in Clerk does NOT match Supabase');
      }
    }
  } catch (error: any) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
}

/**
 * Main diagnostic function
 */
async function runJWTDiagnostics() {
  console.log('🔐 JWT + SUPABASE VALIDATION TEST');
  console.log('='.repeat(50));

  // Get parameters
  const jwtToken = process.argv[2];
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseJWTSecret = process.argv[3]; // Optional: Supabase JWT secret for local verification

  if (!jwtToken) {
    console.error('\n❌ Error: No JWT token provided');
    console.log('\nUsage:');
    console.log('  npx ts-node scripts/test-jwt-validation.ts YOUR_JWT_TOKEN [SUPABASE_JWT_SECRET]');
    console.log('\nTo get a JWT token:');
    console.log('  1. Add this to your app: console.log(await getToken({ template: "supabase" }))');
    console.log('  2. Copy the token from console');
    console.log('  3. Run this script with the token\n');
    process.exit(1);
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('\n❌ Error: Missing Supabase environment variables');
    console.log('Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set\n');
    process.exit(1);
  }

  console.log('\n📋 Configuration');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Token length: ${jwtToken.length} characters`);
  console.log(`   JWT Secret provided: ${supabaseJWTSecret ? 'Yes' : 'No'}\n`);

  // Step 1: Decode JWT
  console.log('🔍 Step 1: Decoding JWT\n');
  let decoded: { header: JWTHeader; payload: JWTPayload };

  try {
    decoded = decodeJWT(jwtToken);
    console.log('   Header:');
    console.log(`      alg: ${decoded.header.alg}`);
    console.log(`      typ: ${decoded.header.typ}`);
    console.log('   Payload:');
    console.log(`      sub: ${decoded.payload.sub}`);
    console.log(`      email: ${decoded.payload.email || 'not set'}`);
    console.log(`      aud: ${decoded.payload.aud || 'not set'}`);
    if (decoded.payload.exp) {
      const expDate = new Date(decoded.payload.exp * 1000);
      const isExpired = Date.now() >= decoded.payload.exp * 1000;
      console.log(`      exp: ${expDate.toISOString()} ${isExpired ? '(EXPIRED)' : '(valid)'}`);
    }
    if (decoded.payload.iat) {
      const iatDate = new Date(decoded.payload.iat * 1000);
      console.log(`      iat: ${iatDate.toISOString()}`);
    }
  } catch (error: any) {
    console.error(`   ❌ Failed to decode JWT: ${error.message}\n`);
    process.exit(1);
  }

  // Step 2: Validate JWT structure
  console.log('\n✅ Step 2: Validating JWT Structure\n');

  const issues: string[] = [];

  if (decoded.header.alg !== 'HS256' && decoded.header.alg !== 'RS256') {
    issues.push(`Unexpected algorithm: ${decoded.header.alg} (should be HS256 for Supabase)`);
  }

  if (!decoded.payload.sub) {
    issues.push('Missing "sub" claim (user ID)');
  }

  if (!decoded.payload.aud) {
    issues.push('Missing "aud" claim');
  } else if (decoded.payload.aud !== 'authenticated') {
    issues.push(`"aud" is "${decoded.payload.aud}" but should be "authenticated" for Supabase`);
  }

  if (!decoded.payload.exp) {
    issues.push('Missing "exp" claim (expiration)');
  } else if (Date.now() >= decoded.payload.exp * 1000) {
    issues.push('Token is expired');
  }

  if (issues.length > 0) {
    console.log('   ⚠️  JWT structure issues:');
    issues.forEach((issue) => console.log(`      - ${issue}`));
  } else {
    console.log('   ✅ JWT structure is valid');
  }

  // Step 3: Verify signature (if secret provided)
  if (supabaseJWTSecret) {
    console.log('\n🔐 Step 3: Verifying JWT Signature\n');

    if (decoded.header.alg !== 'HS256') {
      console.log(`   ⚠️  Cannot verify ${decoded.header.alg} signatures locally`);
      console.log('   Skipping local verification\n');
    } else {
      try {
        const isValid = verifyJWTSignature(jwtToken, supabaseJWTSecret);
        if (isValid) {
          console.log('   ✅ JWT signature is VALID');
          console.log('   The JWT was signed with the correct Supabase secret\n');
        } else {
          console.log('   ❌ JWT signature is INVALID');
          console.log('   The JWT was NOT signed with the provided Supabase secret');
          console.log('\n💡 This means:');
          console.log('   - The secret in Clerk Dashboard does NOT match your Supabase JWT secret');
          console.log('   - Update the signing key in Clerk JWT template\n');
        }
      } catch (error: any) {
        console.log(`   ❌ Signature verification failed: ${error.message}\n`);
      }
    }
  } else {
    console.log('\n⏭️  Step 3: Skipped (no JWT secret provided)');
    console.log('   Run with: npx ts-node scripts/test-jwt-validation.ts TOKEN SECRET\n');
  }

  // Step 4: Test with Supabase API
  await testJWTWithSupabase(supabaseUrl, supabaseAnonKey, jwtToken);

  console.log('\n' + '='.repeat(50));
  console.log('\n📝 Summary and Recommendations\n');

  if (issues.length === 0) {
    console.log('✅ JWT structure is correct');
  } else {
    console.log('❌ JWT has structural issues - fix these in Clerk JWT template:');
    issues.forEach((issue) => console.log(`   - ${issue}`));
  }

  console.log('\n💡 Next Steps:');
  console.log('   1. If signature verification failed, update JWT secret in Clerk');
  console.log('   2. If API test failed with 401, the secrets don\'t match');
  console.log('   3. If API test succeeded, check RLS policies in Supabase');
  console.log('   4. Run the improved test screen in your app for full integration test\n');
}

// Run the diagnostics
runJWTDiagnostics().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
