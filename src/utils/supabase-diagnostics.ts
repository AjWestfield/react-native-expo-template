/**
 * Supabase + Clerk Integration Diagnostics
 *
 * This utility provides comprehensive diagnostics for Clerk + Supabase integration issues.
 * Use this to identify JWT validation problems, RLS policy issues, and connection problems.
 */

import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

export interface DiagnosticResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
  error?: any;
}

type SupabaseQueryResult<T = any> = {
  data: T | null;
  error: PostgrestError | null;
  status?: number;
  statusText?: string;
  count?: number | null;
};

/**
 * Timeout wrapper for any promise
 * Returns a rejection if the promise takes longer than the specified timeout
 */
export function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms: ${operationName}`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Decode and validate JWT token
 */
export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format - must have 3 parts');
    }

    const payload = JSON.parse(atob(parts[1]));
    const header = JSON.parse(atob(parts[0]));

    return {
      header,
      payload,
      isExpired: payload.exp ? Date.now() >= payload.exp * 1000 : false,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
      issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
    };
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error}`);
  }
}

/**
 * Validate JWT structure and claims for Supabase compatibility
 */
export function validateJWTForSupabase(token: string): DiagnosticResult {
  try {
    const decoded = decodeJWT(token);
    const { header, payload, isExpired, expiresAt } = decoded;

    const issues: string[] = [];

    // Check required header fields
    if (!header.alg) {
      issues.push('Missing "alg" in header');
    } else if (header.alg !== 'HS256' && header.alg !== 'RS256') {
      issues.push(`Unexpected algorithm: ${header.alg} (should be HS256 or RS256)`);
    }

    // Check required payload fields
    if (!payload.sub) {
      issues.push('Missing "sub" claim (user ID)');
    }

    if (!payload.aud) {
      issues.push('Missing "aud" claim (audience)');
    } else if (payload.aud !== 'authenticated') {
      issues.push(`"aud" is "${payload.aud}" but should be "authenticated"`);
    }

    if (!payload.exp) {
      issues.push('Missing "exp" claim (expiration)');
    } else if (isExpired) {
      issues.push(`Token is expired (expired at ${expiresAt})`);
    }

    if (!payload.email) {
      issues.push('Missing "email" claim (recommended)');
    }

    return {
      test: 'JWT Structure Validation',
      passed: issues.length === 0 && !isExpired,
      message: issues.length === 0 ? 'JWT is valid for Supabase' : 'JWT has validation issues',
      details: {
        header,
        payload: {
          sub: payload.sub,
          email: payload.email,
          aud: payload.aud,
          exp: expiresAt,
          iat: decoded.issuedAt,
        },
        issues,
        isExpired,
      },
    };
  } catch (error: any) {
    return {
      test: 'JWT Structure Validation',
      passed: false,
      message: 'Failed to decode JWT',
      error: error.message,
    };
  }
}

/**
 * Test raw database connection without RLS
 * This bypasses RLS to test basic connectivity
 */
export async function testDatabaseConnection(
  client: SupabaseClient,
  timeoutMs: number = 5000
): Promise<DiagnosticResult> {
  try {
    const result = await withTimeout<SupabaseQueryResult>(
      client.from('users').select('count', { count: 'exact', head: true }),
      timeoutMs,
      'Database connection test'
    );

    return {
      test: 'Database Connection',
      passed: !result.error,
      message: result.error ? 'Database connection failed' : 'Database connection successful',
      details: {
        count: result.count,
        status: result.status,
        statusText: result.statusText,
      },
      error: result.error,
    };
  } catch (error: any) {
    return {
      test: 'Database Connection',
      passed: false,
      message: 'Database connection timed out or failed',
      error: error.message,
    };
  }
}

/**
 * Test JWT authentication by checking if auth.jwt() works
 */
export async function testJWTAuthentication(
  client: SupabaseClient,
  expectedUserId: string,
  timeoutMs: number = 5000
): Promise<DiagnosticResult> {
  try {
    // Query that uses auth.jwt() in a function
    const result = await withTimeout<SupabaseQueryResult<string | null>>(
      client.rpc('auth_user_id'),
      timeoutMs,
      'JWT authentication test'
    );

    if (result.error) {
      // If function doesn't exist, try alternative method
      if (result.error.code === '42883') {
        return {
          test: 'JWT Authentication',
          passed: false,
          message: 'Helper function auth_user_id() does not exist',
          details: {
            suggestion: 'Run the auth.user_id() function creation from schema',
          },
          error: result.error,
        };
      }

      return {
        test: 'JWT Authentication',
        passed: false,
        message: 'JWT authentication failed',
        error: result.error,
      };
    }

    const userId = typeof result.data === 'string' ? result.data : null;
    const matches = userId !== null && userId === expectedUserId;

    return {
      test: 'JWT Authentication',
      passed: matches,
      message: matches
        ? 'JWT authentication working correctly'
        : 'User ID mismatch - JWT may not be validated correctly',
      details: {
        expectedUserId,
        actualUserId: userId,
        matches,
      },
    };
  } catch (error: any) {
    return {
      test: 'JWT Authentication',
      passed: false,
      message: 'JWT authentication test timed out',
      error: error.message,
    };
  }
}

/**
 * Test RLS policies for a specific table
 */
export async function testRLSPolicies(
  client: SupabaseClient,
  tableName: string,
  userId: string,
  timeoutMs: number = 5000
): Promise<DiagnosticResult> {
  const results: any = {
    select: null,
    insert: null,
    update: null,
    delete: null,
  };

  try {
    // Test SELECT
    const selectResult = await withTimeout<SupabaseQueryResult<unknown[]>>(
      client.from(tableName).select('*').limit(1),
      timeoutMs,
      `SELECT on ${tableName}`
    );
    results.select = {
      passed: !selectResult.error,
      error: selectResult.error?.message,
    };

    // Test INSERT (will create a test record)
    if (tableName === 'users') {
      const insertData = {
        id: userId,
        email: `test-${Date.now()}@example.com`,
      };

      const insertResult = await withTimeout<SupabaseQueryResult<any>>(
        client.from(tableName).upsert(insertData, { onConflict: 'id' }).select(),
        timeoutMs,
        `INSERT/UPSERT on ${tableName}`
      );
      results.insert = {
        passed: !insertResult.error,
        error: insertResult.error?.message,
        data: insertResult.data,
      };
    }

    const allPassed = Object.values(results).every((r: any) => r === null || r.passed);

    return {
      test: `RLS Policies (${tableName})`,
      passed: allPassed,
      message: allPassed
        ? `All RLS policies working for ${tableName}`
        : `Some RLS policies failed for ${tableName}`,
      details: results,
    };
  } catch (error: any) {
    return {
      test: `RLS Policies (${tableName})`,
      passed: false,
      message: `RLS policy test timed out for ${tableName}`,
      details: results,
      error: error.message,
    };
  }
}

/**
 * Run comprehensive diagnostics
 */
export async function runComprehensiveDiagnostics(
  client: SupabaseClient,
  token: string,
  userId: string
): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  console.log('🔍 Starting Supabase Diagnostics...\n');

  // 1. Validate JWT structure
  console.log('Test 1: Validating JWT structure...');
  const jwtValidation = validateJWTForSupabase(token);
  results.push(jwtValidation);
  console.log(jwtValidation.passed ? '✅ PASSED' : '❌ FAILED', jwtValidation.message);
  if (jwtValidation.details?.issues?.length > 0) {
    console.log('   Issues:', jwtValidation.details.issues);
  }

  // 2. Test database connection
  console.log('\nTest 2: Testing database connection...');
  const dbConnection = await testDatabaseConnection(client, 5000);
  results.push(dbConnection);
  console.log(dbConnection.passed ? '✅ PASSED' : '❌ FAILED', dbConnection.message);
  if (dbConnection.error) {
    console.log('   Error:', dbConnection.error);
  }

  // 3. Test JWT authentication (if helper function exists)
  console.log('\nTest 3: Testing JWT authentication...');
  const jwtAuth = await testJWTAuthentication(client, userId, 5000);
  results.push(jwtAuth);
  console.log(jwtAuth.passed ? '✅ PASSED' : '❌ FAILED', jwtAuth.message);
  if (jwtAuth.error) {
    console.log('   Error:', jwtAuth.error);
  }

  // 4. Test RLS policies
  console.log('\nTest 4: Testing RLS policies...');
  const rlsTest = await testRLSPolicies(client, 'users', userId, 10000);
  results.push(rlsTest);
  console.log(rlsTest.passed ? '✅ PASSED' : '❌ FAILED', rlsTest.message);
  if (rlsTest.error) {
    console.log('   Error:', rlsTest.error);
  }

  console.log('\n' + '='.repeat(50));
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('✅ ALL DIAGNOSTICS PASSED!');
  } else {
    console.log('❌ SOME DIAGNOSTICS FAILED');
    console.log('\nFailed tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.test}: ${r.message}`);
      });
  }
  console.log('='.repeat(50));

  return results;
}

/**
 * Direct HTTP test to Supabase REST API
 * This bypasses the Supabase client to test raw API access
 */
export async function testDirectAPIAccess(
  supabaseUrl: string,
  token: string,
  timeoutMs: number = 5000
): Promise<DiagnosticResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count&head=true`, {
      method: 'GET',
      headers: {
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const passed = response.ok || response.status === 200 || response.status === 206;

    return {
      test: 'Direct API Access',
      passed,
      message: passed ? 'API is accessible' : `API returned status ${response.status}`,
      details: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      },
    };
  } catch (error: any) {
    return {
      test: 'Direct API Access',
      passed: false,
      message: error.name === 'AbortError' ? 'API request timed out' : 'API request failed',
      error: error.message,
    };
  }
}
