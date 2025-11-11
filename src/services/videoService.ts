import { SupabaseClient } from '@supabase/supabase-js';
import { Video, VideoInsert, VideoUpdate, VideoStatus, Database } from '../types/supabase';

/**
 * Service for managing video metadata in Supabase
 * Handles CRUD operations for video records
 */
export class VideoService {
  constructor(private supabase: SupabaseClient<Database, 'public'>) {}

  private get client() {
    return this.supabase as unknown as SupabaseClient<any>;
  }

  /**
   * Create a new video metadata record
   *
   * @param params - Video metadata parameters
   * @returns The created video record
   */
  async createVideoMetadata(params: {
    userId: string;
    title?: string;
    prompt: string;
    style: string;
    duration: number;
    aspectRatio: string;
    fps: number;
    storagePath: string;
    thumbnailPath?: string;
    sourceImagePath?: string;
    fileSize?: number;
    mimeType?: string;
  }): Promise<Video> {
    const videoInsert: Partial<VideoInsert> = {
      user_id: params.userId,
      title: params.title || params.prompt.substring(0, 100),
      prompt: params.prompt,
      style: params.style as any,
      duration: params.duration,
      aspect_ratio: params.aspectRatio as any,
      fps: params.fps as any,
      storage_path: params.storagePath,
      thumbnail_path: params.thumbnailPath || null,
      source_image_path: params.sourceImagePath || null,
      file_size: params.fileSize || null,
      mime_type: params.mimeType || 'video/mp4',
      status: 'processing',
      description: null,
      error_message: null,
      is_favorite: false,
      view_count: 0,
      metadata: {},
    };

    const { data, error } = await this.client
      .from('videos')
      .insert(videoInsert as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating video metadata:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all videos for a specific user
   *
   * @param userId - Clerk user ID
   * @param options - Query options (limit, offset, orderBy)
   * @returns Array of video records
   */
  async getUserVideos(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: 'created_at' | 'updated_at' | 'view_count';
      ascending?: boolean;
    }
  ): Promise<Video[]> {
    let query = this.client
      .from('videos')
      .select('*')
      .eq('user_id', userId);

    // Apply ordering
    const orderBy = options?.orderBy || 'created_at';
    const ascending = options?.ascending || false;
    query = query.order(orderBy, { ascending });

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user videos:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single video by ID
   *
   * @param videoId - Video ID
   * @returns Video record or null if not found
   */
  async getVideo(videoId: string): Promise<Video | null> {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching video:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get favorite videos for a user
   *
   * @param userId - Clerk user ID
   * @returns Array of favorite video records
   */
  async getFavoriteVideos(userId: string): Promise<Video[]> {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorite videos:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Update video status
   *
   * @param videoId - Video ID
   * @param status - New status
   * @param errorMessage - Optional error message (for 'failed' status)
   * @returns Updated video record
   */
  async updateVideoStatus(
    videoId: string,
    status: VideoStatus,
    errorMessage?: string
  ): Promise<Video> {
    const { data, error } = await this.client
      .from('videos')
      .update({
        status,
        error_message: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId)
      .select()
      .single();

    if (error) {
      console.error('Error updating video status:', error);
      throw error;
    }

    return data;
  }

  /**
   * Toggle video favorite status
   *
   * @param videoId - Video ID
   * @param isFavorite - New favorite status
   * @returns Updated video record
   */
  async toggleFavorite(videoId: string, isFavorite: boolean): Promise<Video> {
    const { data, error } = await this.client
      .from('videos')
      .update({ is_favorite: isFavorite })
      .eq('id', videoId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling video favorite:', error);
      throw error;
    }

    return data;
  }

  /**
   * Increment video view count
   *
   * @param videoId - Video ID
   * @returns Updated video record
   */
  async incrementViewCount(videoId: string): Promise<Video> {
    // First get current view count
    const video = await this.getVideo(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    const { data, error } = await this.client
      .from('videos')
      .update({ view_count: video.view_count + 1 })
      .eq('id', videoId)
      .select()
      .single();

    if (error) {
      console.error('Error incrementing view count:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update video metadata
   *
   * @param videoId - Video ID
   * @param updates - Fields to update
   * @returns Updated video record
   */
  async updateVideo(videoId: string, updates: VideoUpdate): Promise<Video> {
    const { data, error } = await this.client
      .from('videos')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId)
      .select()
      .single();

    if (error) {
      console.error('Error updating video:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a video record
   * Note: This does NOT delete the video file from storage
   * Use StorageService.deleteVideo() to delete the file
   *
   * @param videoId - Video ID
   */
  async deleteVideo(videoId: string): Promise<void> {
    const { error } = await this.client
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  /**
   * Search videos by prompt text
   *
   * @param userId - Clerk user ID
   * @param searchTerm - Search term
   * @returns Array of matching video records
   */
  async searchVideos(userId: string, searchTerm: string): Promise<Video[]> {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .ilike('prompt', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching videos:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get videos by status
   *
   * @param userId - Clerk user ID
   * @param status - Video status
   * @returns Array of video records
   */
  async getVideosByStatus(userId: string, status: VideoStatus): Promise<Video[]> {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos by status:', error);
      throw error;
    }

    return data || [];
  }
}
