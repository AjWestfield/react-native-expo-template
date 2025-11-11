import { SupabaseClient } from '@supabase/supabase-js';
import { User, UserInsert, UserUpdate, Database } from '../types/supabase';

/**
 * Service for managing user data in Supabase
 * Handles syncing Clerk users to Supabase and CRUD operations
 */
export class UserService {
  constructor(private supabase: SupabaseClient<Database, 'public'>) {}

  private get client() {
    return this.supabase as unknown as SupabaseClient<any>;
  }

  /**
   * Sync Clerk user to Supabase users table
   * Call this after successful authentication or when user data changes
   *
   * @param clerkUser - User data from Clerk
   * @returns The synced user record
   */
  async syncUser(clerkUser: {
    id: string;
    emailAddresses: Array<{ emailAddress: string }>;
    fullName?: string | null;
    imageUrl?: string;
  }): Promise<User> {
    const userInsert: UserInsert = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      full_name: clerkUser.fullName || null,
      avatar_url: clerkUser.imageUrl || null,
    };

    const { data, error } = await this.client
      .from('users')
      .upsert(userInsert, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error syncing user to Supabase:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get user by ID
   *
   * @param userId - Clerk user ID
   * @returns User record or null if not found
   */
  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return null;
      }
      console.error('Error fetching user:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update user profile
   *
   * @param userId - Clerk user ID
   * @param updates - Fields to update
   * @returns Updated user record
   */
  async updateUser(userId: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await this.client
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete user record
   * Note: This should typically be triggered by Clerk webhooks when a user is deleted
   *
   * @param userId - Clerk user ID
   */
  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.client.from('users').delete().eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Check if user exists in Supabase
   *
   * @param userId - Clerk user ID
   * @returns True if user exists, false otherwise
   */
  async userExists(userId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('Error checking user existence:', error);
      throw error;
    }

    return !!data;
  }
}
