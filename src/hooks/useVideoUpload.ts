import { useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import { StorageService } from '../services/storageService';
import { VideoService } from '../services/videoService';
import { VideoGenerationParams } from '../types/video';
import { Video } from '../types/supabase';

const SUPABASE_VIDEO_STYLES = ['cinematic', 'anime', 'realistic', 'abstract'] as const;
type SupabaseVideoStyle = (typeof SUPABASE_VIDEO_STYLES)[number];

const STYLE_ALIASES: Record<string, SupabaseVideoStyle> = {
  'watermark remover': 'realistic',
  'watermark-remover': 'realistic',
  'watermarkremover': 'realistic',
  'sora 2': 'cinematic',
  'sora-2': 'cinematic',
  'veo 3': 'cinematic',
  'veo 3.1': 'cinematic',
};

const normalizeVideoStyle = (style?: string): SupabaseVideoStyle => {
  const normalized = (style || '').trim().toLowerCase();
  if (!normalized) {
    return 'cinematic';
  }

  if (STYLE_ALIASES[normalized]) {
    return STYLE_ALIASES[normalized];
  }

  const match = SUPABASE_VIDEO_STYLES.find((value) => value === normalized);
  return match ?? 'cinematic';
};

interface UploadOptions {
  thumbnailUri?: string;
  sourceImageUri?: string;
  title?: string;
}

/**
 * Hook for uploading videos to Supabase with progress tracking
 *
 * Usage:
 * ```
 * const { uploadVideo, isUploading, progress, error } = useVideoUpload();
 *
 * await uploadVideo(videoUri, {
 *   prompt: "A beautiful sunset",
 *   style: "cinematic",
 *   duration: 5,
 *   aspectRatio: "16:9",
 *   fps: 30
 * }, {
 *   thumbnailUri: thumbnailUri,
 *   sourceImageUri: imageUri
 * });
 * ```
 */
export function useVideoUpload() {
  const { userId } = useAuth();
  const { client } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a video file and create metadata record
   *
   * @param videoUri - Local video file URI
   * @param params - Video generation parameters
   * @param options - Optional thumbnail and source image URIs
   * @returns Created video record
   */
  const uploadVideo = async (
    videoUri: string,
    params: VideoGenerationParams,
    options: UploadOptions = {}
  ): Promise<Video> => {
    if (!client || !userId) {
      const errorMsg = 'Not authenticated. Please sign in first.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const storageService = new StorageService(client);
      const videoService = new VideoService(client);

      // Step 1: Upload thumbnail if provided (10% progress)
      let thumbnailPath: string | undefined;
      if (options.thumbnailUri) {
        setProgress(5);
        const thumbnail = await storageService.uploadThumbnail(
          userId,
          options.thumbnailUri
        );
        thumbnailPath = thumbnail.path;
        setProgress(10);
      }

      // Step 2: Upload source image if provided (20% progress)
      let sourceImagePath: string | undefined;
      if (options.sourceImageUri) {
        setProgress(15);
        const sourceImage = await storageService.uploadSourceImage(
          userId,
          options.sourceImageUri
        );
        sourceImagePath = sourceImage.path;
        setProgress(20);
      }

      // Step 3: Upload video (20% -> 80% progress)
      setProgress(30);
      const video = await storageService.uploadVideo(userId, videoUri);
      setProgress(80);

      // Step 4: Create database record (80% -> 100% progress)
      const normalizedStyle = normalizeVideoStyle(params.style);

      const metadata = await videoService.createVideoMetadata({
        userId,
        title: options.title,
        prompt: params.prompt,
        style: normalizedStyle,
        duration: params.duration,
        aspectRatio: params.aspectRatio,
        fps: params.fps,
        storagePath: video.path,
        thumbnailPath,
        sourceImagePath,
        fileSize: video.size,
        mimeType: 'video/mp4',
      });

      setProgress(100);
      setIsUploading(false);

      return metadata;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
      throw err;
    }
  };

  /**
   * Reset upload state
   */
  const reset = () => {
    setProgress(0);
    setError(null);
    setIsUploading(false);
  };

  return {
    uploadVideo,
    isUploading,
    progress,
    error,
    reset,
  };
}
