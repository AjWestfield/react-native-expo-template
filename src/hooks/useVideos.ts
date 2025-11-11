import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import { VideoService } from '../services/videoService';
import { StorageService } from '../services/storageService';
import { Video, VideoStatus } from '../types/supabase';

interface UseVideosOptions {
  autoFetch?: boolean; // Automatically fetch videos on mount
  filterByStatus?: VideoStatus;
  limit?: number;
  orderBy?: 'created_at' | 'updated_at' | 'view_count';
  ascending?: boolean;
}

/**
 * Hook for fetching and managing user videos from Supabase
 *
 * Usage:
 * ```
 * const {
 *   videos,
 *   isLoading,
 *   error,
 *   refresh,
 *   toggleFavorite,
 *   deleteVideo
 * } = useVideos({ autoFetch: true });
 * ```
 */
export function useVideos(options: UseVideosOptions = {}) {
  const { userId } = useAuth();
  const { client, isLoading: isSupabaseLoading } = useSupabase();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch videos from Supabase
   */
  const fetchVideos = useCallback(async () => {
    if (!client || !userId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const videoService = new VideoService(client);

      let fetchedVideos: Video[];

      if (options.filterByStatus) {
        fetchedVideos = await videoService.getVideosByStatus(
          userId,
          options.filterByStatus
        );
      } else {
        fetchedVideos = await videoService.getUserVideos(userId, {
          limit: options.limit,
          orderBy: options.orderBy || 'created_at',
          ascending: options.ascending || false,
        });
      }

      setVideos(fetchedVideos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch videos';
      setError(errorMessage);
      console.error('Error fetching videos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client, userId, options.filterByStatus, options.limit, options.orderBy, options.ascending]);

  /**
   * Refresh videos list
   */
  const refresh = useCallback(() => {
    return fetchVideos();
  }, [fetchVideos]);

  /**
   * Toggle favorite status for a video
   */
  const toggleFavorite = useCallback(
    async (videoId: string, isFavorite: boolean) => {
      if (!client) {
        throw new Error('Not authenticated');
      }

      try {
        const videoService = new VideoService(client);
        const updatedVideo = await videoService.toggleFavorite(videoId, isFavorite);

        // Update local state
        setVideos((prev) =>
          prev.map((v) => (v.id === videoId ? updatedVideo : v))
        );

        return updatedVideo;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to toggle favorite';
        console.error('Error toggling favorite:', err);
        throw new Error(errorMessage);
      }
    },
    [client]
  );

  /**
   * Delete a video (removes metadata and storage file)
   */
  const deleteVideo = useCallback(
    async (videoId: string) => {
      if (!client) {
        throw new Error('Not authenticated');
      }

      try {
        const videoService = new VideoService(client);
        const storageService = new StorageService(client);

        // Get video to retrieve storage paths
        const video = await videoService.getVideo(videoId);
        if (!video) {
          throw new Error('Video not found');
        }

        // Delete from storage
        await storageService.deleteVideo(video.storage_path);

        // Delete thumbnail if exists
        if (video.thumbnail_path) {
          await storageService.deleteThumbnail(video.thumbnail_path);
        }

        // Delete source image if exists
        if (video.source_image_path) {
          await storageService.deleteSourceImage(video.source_image_path);
        }

        // Delete metadata from database
        await videoService.deleteVideo(videoId);

        // Update local state
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete video';
        console.error('Error deleting video:', err);
        throw new Error(errorMessage);
      }
    },
    [client]
  );

  /**
   * Update video status
   */
  const updateStatus = useCallback(
    async (videoId: string, status: VideoStatus, errorMessage?: string) => {
      if (!client) {
        throw new Error('Not authenticated');
      }

      try {
        const videoService = new VideoService(client);
        const updatedVideo = await videoService.updateVideoStatus(
          videoId,
          status,
          errorMessage
        );

        // Update local state
        setVideos((prev) =>
          prev.map((v) => (v.id === videoId ? updatedVideo : v))
        );

        return updatedVideo;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update status';
        console.error('Error updating status:', err);
        throw new Error(errorMsg);
      }
    },
    [client]
  );

  /**
   * Get signed URL for a video (refresh expired URL)
   */
  const getVideoUrl = useCallback(
    async (storagePath: string, expiresIn: number = 3600): Promise<string> => {
      if (!client) {
        throw new Error('Not authenticated');
      }

      try {
        const storageService = new StorageService(client);
        return await storageService.getVideoUrl(storagePath, expiresIn);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get video URL';
        console.error('Error getting video URL:', err);
        throw new Error(errorMessage);
      }
    },
    [client]
  );

  /**
   * Search videos by prompt text
   */
  const searchVideos = useCallback(
    async (searchTerm: string) => {
      if (!client || !userId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const videoService = new VideoService(client);
        const results = await videoService.searchVideos(userId, searchTerm);
        setVideos(results);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        console.error('Error searching videos:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [client, userId]
  );

  /**
   * Get favorite videos only
   */
  const getFavorites = useCallback(async () => {
    if (!client || !userId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const videoService = new VideoService(client);
      const favorites = await videoService.getFavoriteVideos(userId);
      setVideos(favorites);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch favorites';
      setError(errorMessage);
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client, userId]);

  // Auto-fetch videos on mount if enabled
  useEffect(() => {
    if (options.autoFetch && !isSupabaseLoading) {
      fetchVideos();
    }
  }, [options.autoFetch, isSupabaseLoading, fetchVideos]);

  return {
    videos,
    isLoading: isLoading || isSupabaseLoading,
    error,
    refresh,
    toggleFavorite,
    deleteVideo,
    updateStatus,
    getVideoUrl,
    searchVideos,
    getFavorites,
  };
}
