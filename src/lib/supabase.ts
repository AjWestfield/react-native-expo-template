import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

/**
 * Base Supabase client
 * NOTE: This client uses the anon key and should be enhanced with Clerk JWT tokens
 * for authenticated requests. Use the useSupabase hook for authenticated operations.
 */
export const supabase: SupabaseClient<Database, 'public'> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
      autoRefreshToken: false, // Clerk handles token refresh
      persistSession: false,   // Clerk manages sessions
      detectSessionInUrl: false,
    },
  }
);
