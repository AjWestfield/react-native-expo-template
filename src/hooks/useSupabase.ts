import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Hook that creates an authenticated Supabase client using Clerk JWT tokens
 *
 * This hook:
 * 1. Gets a Supabase-compatible JWT from Clerk
 * 2. Creates a Supabase client with that JWT as the access token
 * 3. Allows Row Level Security policies to use the Clerk user ID from the JWT
 *
 * Usage:
 * ```
 * const { client, isLoading } = useSupabase();
 * if (client) {
 *   const { data } = await client.from('videos').select('*');
 * }
 * ```
 */
export function useSupabase() {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState<SupabaseClient<Database, 'public'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setClient(null);
      setIsLoading(false);
      return;
    }

    const initializeClient = async () => {
      try {
        // Get Clerk JWT with Supabase template
        // This requires that you've set up a JWT template named 'supabase' in Clerk Dashboard
        const token = await getToken({ template: 'supabase' });

        if (!token) {
          console.error('No token received from Clerk. Make sure you have set up the Supabase JWT template in Clerk Dashboard.');
          setClient(null);
          setIsLoading(false);
          return;
        }

        // Create Supabase client with Clerk token
        const supabaseClient: SupabaseClient<Database, 'public'> = createClient<Database>(
          supabaseUrl,
          supabaseAnonKey,
          {
            auth: {
              storage: Platform.OS === 'web' ? undefined : AsyncStorage,
              autoRefreshToken: false, // Clerk handles token refresh
              persistSession: false,   // Clerk manages sessions
              detectSessionInUrl: false,
            },
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );

        setClient(supabaseClient);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        setClient(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();
  }, [isSignedIn, getToken]);

  return { client, isLoading };
}
