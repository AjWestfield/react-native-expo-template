/**
 * Improved Supabase Integration Test Screen
 *
 * This version includes:
 * - Better timeout handling
 * - JWT validation before database operations
 * - Direct API testing
 * - Comprehensive error diagnostics
 * - Step-by-step debugging approach
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useSupabase } from '../hooks/useSupabase';
import {
  DiagnosticResult,
  validateJWTForSupabase,
  testDirectAPIAccess,
  testDatabaseConnection,
  withTimeout,
} from '../utils/supabase-diagnostics';
import { UserService } from '../services/userService';

export default function ImprovedSupabaseTestScreen() {
  const { getToken, userId, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { client, isLoading } = useSupabase();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [allTestsPassed, setAllTestsPassed] = useState(false);

  const log = (message: string, isError = false) => {
    setTestResults((prev) => [...prev, message]);
    console.log(message);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const runDiagnostics = async () => {
    setTestResults([]);
    setDiagnosticResults([]);
    setIsTesting(true);
    setAllTestsPassed(false);
    setCurrentTest('');
    const results: DiagnosticResult[] = [];

    try {
      log('🔍 SUPABASE + CLERK DIAGNOSTIC TEST\n');
      log('====================================\n');

      // PRE-FLIGHT CHECKS
      log('📋 Pre-flight Checks');

      if (!isSignedIn || !userId) {
        log('❌ FAILED: User not signed in\n', true);
        return;
      }
      log(`✅ User signed in: ${userId}`);

      if (!client) {
        log('❌ FAILED: Supabase client not initialized\n', true);
        return;
      }
      log('✅ Supabase client initialized\n');

      // STEP 1: Get and validate JWT token
      setCurrentTest('Step 1/6: Getting JWT Token...');
      log('🔐 Step 1: JWT Token Acquisition');

      let token: string | null = null;
      try {
        token = await withTimeout(
          getToken({ template: 'supabase' }),
          5000,
          'Get JWT Token'
        );
      } catch (error: any) {
        log(`❌ FAILED: ${error.message}`, true);
        log('💡 Ensure JWT template named "supabase" exists in Clerk Dashboard\n', true);
        return;
      }

      if (!token) {
        log('❌ FAILED: No token received from Clerk', true);
        log('💡 Configure JWT template in Clerk Dashboard\n', true);
        return;
      }

      log('✅ Token received successfully');
      log(`   Token length: ${token.length} characters\n`);

      // STEP 2: Validate JWT structure
      setCurrentTest('Step 2/6: Validating JWT Structure...');
      log('🔍 Step 2: JWT Structure Validation');

      const jwtValidation = validateJWTForSupabase(token);
      results.push(jwtValidation);

      if (!jwtValidation.passed) {
        log('❌ FAILED: JWT validation failed', true);
        if (jwtValidation.details?.issues) {
          jwtValidation.details.issues.forEach((issue: string) => {
            log(`   - ${issue}`, true);
          });
        }
        if (jwtValidation.error) {
          log(`   Error: ${jwtValidation.error}`, true);
        }
        log('\n💡 Check Clerk JWT template configuration\n', true);
        return;
      }

      log('✅ JWT structure is valid');
      log(`   User ID (sub): ${jwtValidation.details.payload.sub}`);
      log(`   Email: ${jwtValidation.details.payload.email}`);
      log(`   Audience: ${jwtValidation.details.payload.aud}`);
      log(`   Expires: ${jwtValidation.details.payload.exp?.toLocaleString()}\n`);

      // STEP 3: Test direct API access
      setCurrentTest('Step 3/6: Testing Direct API Access...');
      log('🌐 Step 3: Direct API Access Test');

      const apiTest = await testDirectAPIAccess(
        process.env.EXPO_PUBLIC_SUPABASE_URL!,
        token,
        5000
      );
      results.push(apiTest);

      if (!apiTest.passed) {
        log('❌ FAILED: Direct API access failed', true);
        log(`   Status: ${apiTest.details?.status}`, true);
        log(`   Message: ${apiTest.message}`, true);
        if (apiTest.error) {
          log(`   Error: ${apiTest.error}`, true);
        }
        log('\n💡 This suggests JWT signature mismatch between Clerk and Supabase\n', true);
        log('   Action items:', true);
        log('   1. Verify JWT secret in Clerk matches Supabase JWT secret', true);
        log('   2. Check Supabase Project Settings > API > JWT Settings', true);
        log('   3. Ensure JWT template uses HS256 algorithm\n', true);
        return;
      }

      log('✅ Direct API access successful');
      log(`   HTTP Status: ${apiTest.details.status}\n`);

      // STEP 4: Test database connection
      setCurrentTest('Step 4/6: Testing Database Connection...');
      log('🗄️  Step 4: Database Connection Test');

      const dbTest = await testDatabaseConnection(client, 8000);
      results.push(dbTest);

      if (!dbTest.passed) {
        log('❌ FAILED: Database connection failed', true);
        if (dbTest.error) {
          log(`   Error: ${JSON.stringify(dbTest.error, null, 2)}`, true);
        }
        log('\n💡 Check Supabase project status and network connectivity\n', true);
        return;
      }

      log('✅ Database connection successful\n');

      // STEP 5: Test user sync with detailed logging
      setCurrentTest('Step 5/6: Testing User Sync...');
      log('👤 Step 5: User Sync to Supabase');

      try {
        const userService = new UserService(client);

        log('   Preparing user data...');
        const userInsert = {
          id: user!.id,
          email: user!.emailAddresses[0]?.emailAddress || '',
          full_name: user!.fullName || null,
          avatar_url: user!.imageUrl || null,
        };
        log(`   User ID: ${userInsert.id}`);
        log(`   Email: ${userInsert.email}`);

        log('   Executing upsert...');
        const syncedUser = await withTimeout(
          userService.syncUser(user!),
          10000,
          'User Sync'
        );

        log('✅ User sync successful');
        log(`   Supabase User ID: ${syncedUser.id}`);
        log(`   Email: ${syncedUser.email}`);
        log(`   Name: ${syncedUser.full_name || 'Not set'}\n`);

        results.push({
          test: 'User Sync',
          passed: true,
          message: 'User successfully synced to Supabase',
        });
      } catch (error: any) {
        log('❌ FAILED: User sync failed', true);
        log(`   Error: ${error.message}`, true);

        // Detailed error analysis
        if (error.message.includes('timeout')) {
          log('\n💡 Operation timed out - likely causes:', true);
          log('   1. JWT signature verification failing silently', true);
          log('   2. RLS policy blocking the operation without error', true);
          log('   3. Network connectivity issues\n', true);
        } else if (error.code) {
          log(`   Error Code: ${error.code}`, true);
          if (error.code === 'PGRST301') {
            log('   💡 This is a JWT verification error', true);
            log('   Check that JWT secret in Clerk matches Supabase\n', true);
          } else if (error.code === '42501') {
            log('   💡 This is an RLS policy error', true);
            log('   User cannot insert/update due to RLS policy\n', true);
          }
        }

        log(`\n   Full error: ${JSON.stringify(error, null, 2)}\n`, true);

        results.push({
          test: 'User Sync',
          passed: false,
          message: 'User sync failed',
          error: error.message,
        });
        return;
      }

      // STEP 6: Verify user can be read back
      setCurrentTest('Step 6/6: Verifying User Data...');
      log('✅ Step 6: Verify User Retrieval');

      try {
        const userService = new UserService(client);
        const retrievedUser = await withTimeout(
          userService.getUser(userId),
          5000,
          'Get User'
        );

        if (!retrievedUser) {
          log('❌ FAILED: User was synced but cannot be retrieved', true);
          log('💡 Check SELECT RLS policy on users table\n', true);
          return;
        }

        log('✅ User can be retrieved successfully');
        log(`   Retrieved user ID: ${retrievedUser.id}`);
        log(`   Email matches: ${retrievedUser.email === user!.emailAddresses[0]?.emailAddress}\n`);

        results.push({
          test: 'User Retrieval',
          passed: true,
          message: 'User data retrieved successfully',
        });
      } catch (error: any) {
        log('❌ FAILED: User retrieval failed', true);
        log(`   Error: ${error.message}\n`, true);
        return;
      }

      // ALL TESTS PASSED
      setDiagnosticResults(results);
      setAllTestsPassed(true);

      log('====================================');
      log('🎉 ALL DIAGNOSTICS PASSED!');
      log('====================================\n');
      log('✅ Clerk + Supabase integration is working correctly!\n');
      log('Next steps:');
      log('  1. Test video upload functionality');
      log('  2. Test storage bucket access');
      log('  3. Integrate into your app screens\n');

    } catch (error: any) {
      log(`\n❌ UNEXPECTED ERROR: ${error.message}`, true);
      log(`\nStack trace:\n${error.stack}`, true);
      console.error('Full error:', error);
    } finally {
      setIsTesting(false);
      setCurrentTest('');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Initializing Supabase...</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⚠️ Not Signed In</Text>
        <Text style={styles.errorText}>
          Please sign in with Clerk to test Supabase integration
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Supabase Diagnostics</Text>
          <Text style={styles.subtitle}>Improved Testing</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color="#FF4444" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {allTestsPassed && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.successText}>All Diagnostics Passed!</Text>
        </View>
      )}

      {isTesting && currentTest && (
        <View style={styles.testingBanner}>
          <ActivityIndicator size="small" color="#fff" style={styles.testingSpinner} />
          <Text style={styles.testingText}>{currentTest}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, isTesting && styles.buttonDisabled]}
        onPress={runDiagnostics}
        disabled={isTesting}
      >
        <Ionicons
          name="bug-outline"
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.buttonText}>
          {isTesting ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer}>
        {testResults.length === 0 ? (
          <View style={styles.placeholderContainer}>
            <Ionicons name="information-circle-outline" size={48} color="#6b7280" />
            <Text style={styles.placeholderText}>
              This diagnostic tool will:{'\n\n'}
              • Validate JWT token structure{'\n'}
              • Test direct API access{'\n'}
              • Check database connectivity{'\n'}
              • Verify RLS policies{'\n'}
              • Test user sync operations{'\n\n'}
              Tap "Run Diagnostics" to begin
            </Text>
          </View>
        ) : (
          testResults.map((result, index) => (
            <Text
              key={index}
              style={[
                styles.resultText,
                result.includes('❌') && styles.errorText,
                result.includes('✅') && styles.successTextResult,
                result.includes('⚠️') && styles.warningText,
                result.includes('💡') && styles.hintText,
              ]}
            >
              {result}
            </Text>
          ))
        )}
      </ScrollView>

      {diagnosticResults.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Test Summary</Text>
          {diagnosticResults.map((result, index) => (
            <View key={index} style={styles.summaryItem}>
              <Ionicons
                name={result.passed ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={result.passed ? '#10b981' : '#ef4444'}
              />
              <Text style={styles.summaryText}>{result.test}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  signOutButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testingBanner: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testingSpinner: {
    marginRight: 12,
  },
  testingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  button: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  resultText: {
    color: '#d1d5db',
    fontSize: 13,
    fontFamily: 'Courier',
    marginBottom: 4,
    lineHeight: 18,
  },
  successTextResult: {
    color: '#10b981',
  },
  errorText: {
    color: '#ef4444',
  },
  warningText: {
    color: '#f59e0b',
  },
  hintText: {
    color: '#60a5fa',
    fontStyle: 'italic',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 14,
  },
  summaryContainer: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  summaryText: {
    color: '#d1d5db',
    fontSize: 13,
  },
});
