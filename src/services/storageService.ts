import { SupabaseClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system/legacy';
import { Database } from '../types/supabase';

/**
 * Service for managing file uploads and downloads in Supabase Storage
 * Handles video files, thumbnails, and source images
 */
export class StorageService {
  constructor(private supabase: SupabaseClient<Database, 'public'>) {}

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    if (typeof globalThis.atob === 'function') {
      const binaryString = globalThis.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }

    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    const bytesLength =
      (cleaned.length * 3) / 4 -
      (cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0);
    const bytes = new Uint8Array(bytesLength);

    let p = 0;
    for (let i = 0; i < cleaned.length; i += 4) {
      const enc1 = base64Chars.indexOf(cleaned[i]);
      const enc2 = base64Chars.indexOf(cleaned[i + 1]);
      const enc3 = base64Chars.indexOf(cleaned[i + 2]);
      const enc4 = base64Chars.indexOf(cleaned[i + 3]);

      bytes[p++] = (enc1 << 2) | (enc2 >> 4);
      if (enc3 !== 64 && enc3 !== -1) {
        bytes[p++] = ((enc2 & 15) << 4) | (enc3 >> 2);
      }
      if (enc4 !== 64 && enc4 !== -1) {
        bytes[p++] = ((enc3 & 3) << 6) | enc4;
      }
    }

    return bytes.buffer;
  }

  private async readFileAsArrayBuffer(
    uri: string,
  ): Promise<ArrayBuffer> {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    return this.base64ToArrayBuffer(base64);
  }

  /**
   * Upload video file to Supabase Storage
   * Uses ArrayBuffer for React Native compatibility
   *
   * @param userId - Clerk user ID (used for folder structure)
   * @param fileUri - Local file URI from expo-image-picker
   * @param fileName - Optional custom file name
   * @returns Object with storage path and signed URL
   */
  async uploadVideo(
    userId: string,
    fileUri: string,
    fileName?: string
  ): Promise<{ path: string; url: string; size: number }> {
    try {
      const extension =
        fileUri.split('.').pop()?.toLowerCase().replace(/\?.*$/, '') || 'mp4';
      const mimeType =
        extension === 'mov'
          ? 'video/quicktime'
          : extension === 'mkv'
            ? 'video/x-matroska'
            : 'video/mp4';
      const arrayBuffer = await this.readFileAsArrayBuffer(fileUri);

      // Generate unique file name
      const timestamp = Date.now();
      const filePath = `${userId}/${fileName || `${timestamp}.${extension}`}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from('videos')
        .upload(filePath, arrayBuffer, {
          contentType: mimeType,
          upsert: false,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get signed URL for private access (valid for 1 hour)
      const { data: urlData, error: urlError } = await this.supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 3600);

      if (urlError) {
        console.error('Signed URL error:', urlError);
        throw urlError;
      }

      return {
        path: filePath,
        url: urlData.signedUrl,
        size: arrayBuffer.byteLength,
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  /**
   * Upload thumbnail image to public bucket
   *
   * @param userId - Clerk user ID
   * @param imageUri - Local image URI
   * @param fileName - Optional custom file name
   * @returns Object with storage path and public URL
   */
  async uploadThumbnail(
    userId: string,
    imageUri: string,
    fileName?: string
  ): Promise<{ path: string; url: string }> {
    try {
      const timestamp = Date.now();
      const extension =
        imageUri.split('.').pop()?.toLowerCase().replace(/\?.*$/, '') || 'jpg';
      const mimeType = `image/${extension === 'png' ? 'png' : 'jpeg'}`;
      const arrayBuffer = await this.readFileAsArrayBuffer(imageUri);
      const filePath = `${userId}/${fileName || `${timestamp}.${extension}`}`;

      const { error: uploadError } = await this.supabase.storage
        .from('thumbnails')
        .upload(filePath, arrayBuffer, {
          contentType: mimeType,
          upsert: false,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
        throw uploadError;
      }

      // Thumbnails are public, get public URL
      const { data: urlData } = this.supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw error;
    }
  }

  /**
   * Upload source image to private bucket
   *
   * @param userId - Clerk user ID
   * @param imageUri - Local image URI
   * @param fileName - Optional custom file name
   * @returns Object with storage path and signed URL
   */
  async uploadSourceImage(
    userId: string,
    imageUri: string,
    fileName?: string
  ): Promise<{ path: string; url: string }> {
    try {
      const timestamp = Date.now();
      const extension =
        imageUri.split('.').pop()?.toLowerCase().replace(/\?.*$/, '') || 'jpg';
      const mimeType = `image/${extension === 'png' ? 'png' : 'jpeg'}`;
      const arrayBuffer = await this.readFileAsArrayBuffer(imageUri);
      const filePath = `${userId}/${fileName || `${timestamp}.${extension}`}`;

      const { error: uploadError } = await this.supabase.storage
        .from('source-images')
        .upload(filePath, arrayBuffer, {
          contentType: mimeType,
          upsert: false,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Source image upload error:', uploadError);
        throw uploadError;
      }

      // Get signed URL for private access
      const { data: urlData, error: urlError } = await this.supabase.storage
        .from('source-images')
        .createSignedUrl(filePath, 3600);

      if (urlError) {
        console.error('Signed URL error:', urlError);
        throw urlError;
      }

      return {
        path: filePath,
        url: urlData.signedUrl,
      };
    } catch (error) {
      console.error('Error uploading source image:', error);
      throw error;
    }
  }

  /**
   * Delete video from storage
   *
   * @param path - Storage path (e.g., "userId/timestamp.mp4")
   */
  async deleteVideo(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from('videos')
      .remove([path]);

    if (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  /**
   * Delete thumbnail from storage
   *
   * @param path - Storage path
   */
  async deleteThumbnail(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from('thumbnails')
      .remove([path]);

    if (error) {
      console.error('Error deleting thumbnail:', error);
      throw error;
    }
  }

  /**
   * Delete source image from storage
   *
   * @param path - Storage path
   */
  async deleteSourceImage(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from('source-images')
      .remove([path]);

    if (error) {
      console.error('Error deleting source image:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for video (for private buckets)
   * Useful for refreshing expired URLs
   *
   * @param path - Storage path
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Signed URL
   */
  async getVideoUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('videos')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error getting video URL:', error);
      throw error;
    }

    return data.signedUrl;
  }

  /**
   * Get signed URL for source image
   *
   * @param path - Storage path
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Signed URL
   */
  async getSourceImageUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('source-images')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error getting source image URL:', error);
      throw error;
    }

    return data.signedUrl;
  }

  /**
   * Get public URL for thumbnail
   *
   * @param path - Storage path
   * @returns Public URL
   */
  getThumbnailUrl(path: string): string {
    const { data } = this.supabase.storage
      .from('thumbnails')
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * List all files in user's video directory
   *
   * @param userId - Clerk user ID
   * @returns Array of file objects
   */
  async listUserVideos(userId: string) {
    const { data, error } = await this.supabase.storage
      .from('videos')
      .list(userId);

    if (error) {
      console.error('Error listing videos:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get file metadata
   *
   * @param bucket - Bucket name
   * @param path - File path
   * @returns File metadata including size, created_at, etc.
   */
  async getFileMetadata(bucket: 'videos' | 'thumbnails' | 'source-images', path: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(path.split('/')[0], {
        search: path.split('/')[1],
      });

    if (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }

    return data?.[0] || null;
  }
}
