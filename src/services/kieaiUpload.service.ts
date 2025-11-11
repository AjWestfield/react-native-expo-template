import axios, { AxiosInstance } from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import { KIEAI_API_KEY } from '@env';

/**
 * KIE AI File Upload Service
 * Uploads local images to kie.ai's file storage and returns public URLs
 * Files are automatically deleted after 3 days
 */

export interface UploadResponse {
  success: boolean;
  code: number;
  msg: string;
  data: {
    fileName: string;
    filePath: string;
    downloadUrl: string;  // Use this URL for video generation
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
}

class KieAIUploadService {
  private api: AxiosInstance;
  private baseURL = 'https://kieai.redpandaai.co';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || KIEAI_API_KEY || '';

    if (!this.apiKey) {
      console.warn('KIEAI_API_KEY not found. Upload calls will fail.');
    }

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds for uploads
    });
  }

  /**
   * Upload a local image file using Base64 encoding
   * Best for images ≤10MB
   *
   * @param localUri Local file URI from expo-image-picker (file://...)
   * @param uploadPath Optional folder path (e.g., 'images/video-gen')
   * @param fileName Optional custom filename
   * @returns Upload response with downloadUrl
   */
  async uploadImageBase64(
    localUri: string,
    uploadPath: string = 'images/video-generation',
    fileName?: string
  ): Promise<UploadResponse> {
    try {
      console.log('Uploading image to kie.ai:', localUri);

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: 'base64',
      });

      // Get file extension
      const extension = localUri.split('.').pop()?.toLowerCase() || 'jpg';

      // Determine MIME type
      const mimeType = this.getMimeType(extension);

      // Create data URI
      const base64Data = `data:${mimeType};base64,${base64}`;

      // Generate filename if not provided
      if (!fileName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        fileName = `image_${timestamp}_${random}.${extension}`;
      }

      console.log('Uploading to kie.ai with:', {
        fileName,
        uploadPath,
        mimeType,
        size: base64.length,
      });

      // Upload via Base64 endpoint
      const response = await this.api.post<UploadResponse>('/api/file-base64-upload', {
        base64Data,
        uploadPath,
        fileName,
      });

      if (!response.data.success || response.data.code !== 200) {
        throw new Error(response.data.msg || 'Upload failed');
      }

      console.log('Upload successful:', response.data.data.downloadUrl);

      return response.data;
    } catch (error) {
      console.error('KIE AI upload error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Upload failed: ${error.response.data?.msg || error.message}`);
      }
      throw error instanceof Error ? error : new Error('Failed to upload image');
    }
  }

  /**
   * Upload multiple local images
   *
   * @param localUris Array of local file URIs
   * @param uploadPath Optional folder path
   * @returns Array of download URLs
   */
  async uploadMultipleImages(
    localUris: string[],
    uploadPath: string = 'images/video-generation'
  ): Promise<string[]> {
    try {
      console.log(`Uploading ${localUris.length} images to kie.ai...`);

      // Upload sequentially to avoid rate limits
      const downloadUrls: string[] = [];

      for (const uri of localUris) {
        const response = await this.uploadImageBase64(uri, uploadPath);
        downloadUrls.push(response.data.downloadUrl);

        // Small delay between uploads
        if (localUris.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`Successfully uploaded ${downloadUrls.length} images`);

      return downloadUrls;
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to upload multiple images');
    }
  }

  /**
   * Check if URI is a local file (needs upload)
   */
  isLocalUri(uri: string): boolean {
    return uri.startsWith('file://') ||
           uri.startsWith('content://') ||
           uri.startsWith('assets-library://') ||
           uri.startsWith('ph://'); // iOS Photos
  }

  /**
   * Check if URI is already a public URL
   */
  isPublicUrl(uri: string): boolean {
    return uri.startsWith('http://') || uri.startsWith('https://');
  }

  /**
   * Process URI - upload if local, return as-is if already public
   *
   * @param uri Local file URI or public URL
   * @returns Public URL usable by kie.ai video generation
   */
  async processImageUri(uri: string): Promise<string> {
    if (this.isPublicUrl(uri)) {
      console.log('URI is already a public URL:', uri);
      return uri;
    }

    if (this.isLocalUri(uri)) {
      console.log('URI is local, uploading to kie.ai...');
      const response = await this.uploadImageBase64(uri);
      return response.data.downloadUrl;
    }

    throw new Error(`Unsupported URI format: ${uri}`);
  }

  /**
   * Process multiple URIs - upload local files, keep public URLs as-is
   *
   * @param uris Array of local file URIs or public URLs
   * @returns Array of public URLs
   */
  async processImageUris(uris: string[]): Promise<string[]> {
    const results: string[] = [];

    for (const uri of uris) {
      const publicUrl = await this.processImageUri(uri);
      results.push(publicUrl);
    }

    return results;
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(extension: string): string {
    const ext = extension.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      bmp: 'image/bmp',
      svg: 'image/svg+xml',
    };

    return mimeTypes[ext] || 'image/jpeg';
  }
}

// Export singleton instance
export const kieaiUploadService = new KieAIUploadService();
export default KieAIUploadService;
