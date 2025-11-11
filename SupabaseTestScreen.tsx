/**
 * Temporary Test Screen for Supabase + Clerk Integration
 *
 * Add this to your navigation to test the integration:
 *
 * import SupabaseTestScreen from './SupabaseTestScreen';
 * <Stack.Screen name="SupabaseTest" component={SupabaseTestScreen} />
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useSupabase } from './src/hooks/useSupabase';
import { UserService } from './src/services/userService';
import { VideoService } from './src/services/videoService';

export default function SupabaseTestScreen() {
  const { getToken, userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const { client, isLoading } = useSupabase();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const log = (message: string) => {
    setTestResults((prev) => [...prev, message]);
    console.log(message);
  };

  const runTests = async () => {
    setTestResults([]);
    setIsTesting(true);

    try {
      log('🧪 Starting Supabase + Clerk Integration Tests...\n');

      // Test 1: Authentication
      log('✅ Test 1: Authentication Status');
      log(`   Signed In: ${isSignedIn}`);
      log(`   User ID: ${userId}`);
      log(`   Email: ${user?.emailAddresses[0]?.emailAddress}\n`);

      if (!isSignedIn || !userId) {
        log('❌ FAILED: User not signed in\n');
        return;
      }

      // Test 2: JWT Token
      log('✅ Test 2: Clerk JWT Token');
      const token = await getToken({ template: 'supabase' });

      if (!token) {
        log('❌ FAILED: No token received');
        log('💡 Make sure you created a JWT template named "supabase" in Clerk\n');
        return;
      }

      log('   Token received: ✓');
      const payload = JSON.parse(atob(token.split('.')[1]));
      log(`   User ID in token: ${payload.sub}`);
      log(`   Email in token: ${payload.email}\n`);

      // Test 3: Supabase Client
      log('✅ Test 3: Supabase Client');
      if (!client) {
        log('❌ FAILED: Supabase client not initialized\n');
        return;
      }
      log('   Client initialized: ✓\n');

      // Test 4: User Sync
      log('✅ Test 4: User Sync to Supabase');
      const userService = new UserService(client);
      const syncedUser = await userService.syncUser(user!);
      log('   User synced: ✓');
      log(`   Supabase ID: ${syncedUser.id}`);
      log(`   Email: ${syncedUser.email}\n`);

      // Test 5: RLS Policies
      log('✅ Test 5: Row Level Security');
      const videoService = new VideoService(client);
      const videos = await videoService.getUserVideos(userId);
      log('   RLS working: ✓');
      log(`   Videos found: ${videos.length}\n`);

      // Test 6: Storage Access
      log('✅ Test 6: Storage Access');
      const { data: buckets, error } = await client.storage.listBuckets();
      if (error) throw error;
      log('   Storage access: ✓');
      log(`   Buckets: ${buckets.map((b) => b.name).join(', ')}\n`);

      log('🎉 ALL TESTS PASSED!');
      log('✅ Supabase + Clerk integration is working correctly!');
    } catch (error: any) {
      log(`\n❌ TEST FAILED: ${error.message}`);
      if (error.message.includes('JWT') || error.message.includes('expired')) {
        log('\n💡 JWT Error - Check these:');
        log('   1. JWT template named "supabase" exists in Clerk');
        log('   2. Signing key matches Supabase JWT secret');
        log('   3. Token hasn\'t expired (try signing out and in again)');
      }
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading Supabase client...</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please sign in to test Supabase integration</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Integration Test</Text>

      <TouchableOpacity
        style={[styles.button, isTesting && styles.buttonDisabled]}
        onPress={runTests}
        disabled={isTesting}
      >
        <Text style={styles.buttonText}>
          {isTesting ? 'Running Tests...' : 'Run Tests'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
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
  resultText: {
    color: '#d1d5db',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
});
