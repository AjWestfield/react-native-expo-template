/**
 * Supabase Integration Test Screen
 * Add this to your app to test the Clerk + Supabase integration
 *
 * Navigate to this screen after signing in to run tests manually
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
import { useSupabase } from '../../src/hooks/useSupabase';
import { UserService } from '../../src/services/userService';
import { VideoService } from '../../src/services/videoService';

// Timeout utility - prevents hanging on any async operation
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, testName: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${testName} took longer than ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

export default function TestScreen() {
  const { getToken, userId, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { client, isLoading } = useSupabase();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);

  const log = (message: string, isError = false) => {
    setTestResults((prev) => [...prev, message]);
    console.log(message);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleCancel = () => {
    setCancelRequested(true);
    log('\n⚠️ CANCEL REQUESTED - Stopping tests...', true);
  };

  const checkCancellation = () => {
    if (cancelRequested) {
      throw new Error('Tests cancelled by user');
    }
  };

  const runTests = async () => {
    setTestResults([]);
    setIsTesting(true);
    setAllTestsPassed(false);
    setCancelRequested(false);
    setCurrentTest('');
    let testsFailed = false;

    try {
      log('🧪 SUPABASE + CLERK INTEGRATION TEST\n');
      log('====================================\n');

      // Test 1: Authentication Status
      setCurrentTest('Test 1/6: Checking Authentication...');
      checkCancellation();

      log('✅ Test 1: Authentication Status');
      log(`   Signed In: ${isSignedIn}`);
      log(`   User ID: ${userId}`);
      log(`   Email: ${user?.emailAddresses[0]?.emailAddress}\n`);

      if (!isSignedIn || !userId) {
        log('❌ FAILED: User not signed in\n', true);
        testsFailed = true;
        return;
      }

      // Test 2: Clerk JWT Token
      setCurrentTest('Test 2/6: Getting JWT Token...');
      checkCancellation();

      log('✅ Test 2: Clerk JWT Token');

      let token: string | null = null;
      try {
        token = await withTimeout(
          getToken({ template: 'supabase' }),
          10000,
          'Get JWT Token'
        );
      } catch (error: any) {
        log(`❌ FAILED: ${error.message}`, true);
        log('💡 Check that JWT template named "supabase" exists in Clerk\n', true);
        testsFailed = true;
        return;
      }

      if (!token) {
        log('❌ FAILED: No token received', true);
        log('💡 Check that JWT template named "supabase" exists in Clerk\n', true);
        testsFailed = true;
        return;
      }

      log('   Token received: ✓');

      // Decode token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        log(`   User ID in token: ${payload.sub}`);
        log(`   Email in token: ${payload.email}`);
        log(`   Audience: ${payload.aud}`);

        if (payload.aud !== 'authenticated') {
          log('   ⚠️  Warning: aud should be "authenticated"\n');
        } else {
          log('   ✓ Audience is correct\n');
        }
      } catch (e: any) {
        log(`   ⚠️  Could not decode token: ${e.message}\n`);
      }

      // Test 3: Supabase Client
      setCurrentTest('Test 3/6: Checking Supabase Client...');
      checkCancellation();

      log('✅ Test 3: Supabase Client');
      if (!client) {
        log('❌ FAILED: Supabase client not initialized\n', true);
        testsFailed = true;
        return;
      }
      log('   Client initialized: ✓');
      log(`   Project URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL}\n`);

      // Test 4: User Sync to Supabase
      setCurrentTest('Test 4/6: Syncing User to Supabase...');
      checkCancellation();

      log('✅ Test 4: User Sync to Supabase');
      try {
        const userService = new UserService(client);
        const syncedUser = await withTimeout(
          userService.syncUser(user!),
          10000,
          'User Sync'
        );
        log('   User synced: ✓');
        log(`   Supabase ID: ${syncedUser.id}`);
        log(`   Email: ${syncedUser.email}\n`);
      } catch (error: any) {
        log(`❌ FAILED: ${error.message}\n`, true);
        log(`   Full error: ${JSON.stringify(error, null, 2)}\n`, true);
        if (error.message.includes('JWT')) {
          log('💡 JWT Error - Check signing key in Clerk matches Supabase\n', true);
        }
        testsFailed = true;
        return;
      }

      // Test 5: Row Level Security
      setCurrentTest('Test 5/6: Testing Row Level Security...');
      checkCancellation();

      log('✅ Test 5: Row Level Security');
      try {
        const videoService = new VideoService(client);
        const videos = await withTimeout(
          videoService.getUserVideos(userId),
          10000,
          'RLS Test - Get User Videos'
        );
        log('   RLS working: ✓');
        log(`   Videos found: ${videos.length}\n`);
      } catch (error: any) {
        log(`❌ FAILED: ${error.message}\n`, true);
        log(`   Full error: ${JSON.stringify(error, null, 2)}\n`, true);
        testsFailed = true;
        return;
      }

      // Test 6: Storage Access
      setCurrentTest('Test 6/6: Testing Storage Access...');
      checkCancellation();

      log('✅ Test 6: Storage Access');
      try {
        const result = await withTimeout(
          client.storage.listBuckets(),
          10000,
          'Storage Access - List Buckets'
        );

        if (result.error) throw result.error;

        log('   Storage access: ✓');
        log(`   Buckets: ${result.data.map((b) => b.name).join(', ')}\n`);
      } catch (error: any) {
        log(`❌ FAILED: ${error.message}\n`, true);
        log(`   Full error: ${JSON.stringify(error, null, 2)}\n`, true);
        testsFailed = true;
        return;
      }

      // All tests completed successfully
      if (!testsFailed) {
        log('====================================');
        log('🎉 ALL TESTS PASSED!');
        log('✅ Supabase + Clerk integration working!');
        log('====================================\n');
        log('🚀 Next steps:');
        log('   1. Integrate into your app screens');
        log('   2. Start using Supabase for data storage');
        log('   3. Upload videos and test the full flow\n');
        setAllTestsPassed(true);
      }

    } catch (error: any) {
      if (error.message.includes('cancelled by user')) {
        log('\n⚠️ TESTS CANCELLED\n', true);
      } else {
        log(`\n❌ UNEXPECTED ERROR: ${error.message}`, true);
        log(`   Full error details: ${JSON.stringify(error, null, 2)}`, true);
        log('\n💡 Check console for stack trace', true);
        console.error('Full error object:', error);
      }
      testsFailed = true;
    } finally {
      setIsTesting(false);
      setCurrentTest('');
      setCancelRequested(false);
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
        <Text style={styles.title}>Supabase Test</Text>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF4444" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {allTestsPassed && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✅ All Tests Passed!</Text>
        </View>
      )}

      {isTesting && currentTest && (
        <View style={styles.testingBanner}>
          <ActivityIndicator size="small" color="#fff" style={styles.testingSpinner} />
          <Text style={styles.testingText}>{currentTest}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isTesting && styles.buttonDisabled]}
          onPress={runTests}
          disabled={isTesting}
        >
          <Text style={styles.buttonText}>
            {isTesting ? 'Running Tests...' : 'Run Tests'}
          </Text>
        </TouchableOpacity>

        {isTesting && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={cancelRequested}
          >
            <Ionicons name="stop-circle-outline" size={20} color="#fff" />
            <Text style={styles.cancelButtonText}>
              {cancelRequested ? 'Cancelling...' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.resultsContainer}>
        {testResults.length === 0 ? (
          <Text style={styles.placeholderText}>
            Tap "Run Tests" to start testing Supabase integration.{'\n\n'}
            Each test has a 10-second timeout to prevent hanging.
          </Text>
        ) : (
          testResults.map((result, index) => (
            <Text
              key={index}
              style={[
                styles.resultText,
                result.includes('❌') && styles.errorText,
                result.includes('✅') && styles.successTextResult,
                result.includes('⚠️') && styles.warningText,
              ]}
            >
              {result}
            </Text>
          ))
        )}
      </ScrollView>
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
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  cancelButtonText: {
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
  placeholderText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 14,
  },
});
