import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  KieAIModel,
  VideoGenerationRequest,
  GenerateResponse,
  TaskStatusResponse,
  VeoTaskStatusResponse,
  SoraTaskStatusResponse,
  KieAIError,
  KieAIErrorCode,
  MODEL_CONFIGS,
  VeoGenerateRequest,
  SoraGenerateRequest,
  WatermarkRemoverRequest,
  GenerationType,
} from '../types/kieai';
import { KIEAI_API_KEY } from '@env';
import { kieaiUploadService } from './kieaiUpload.service';

type AnyTaskStatusResponse = TaskStatusResponse | VeoTaskStatusResponse | SoraTaskStatusResponse;

class KieAIService {
  private api: AxiosInstance;
  private baseURL = 'https://api.kie.ai/api/v1';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || KIEAI_API_KEY || '';

    if (!this.apiKey) {
      console.warn('KIEAI_API_KEY not found. API calls will fail.');
    }

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError<KieAIError>): Promise<never> {
    if (error.response) {
      const { code, msg } = error.response.data;

      switch (code) {
        case KieAIErrorCode.UNAUTHORIZED:
          throw new Error('Unauthorized: Invalid API key');
        case KieAIErrorCode.INSUFFICIENT_CREDITS:
          throw new Error('Insufficient credits. Please top up your account.');
        case KieAIErrorCode.RATE_LIMITED:
          throw new Error('Rate limit exceeded. Please try again later.');
        case KieAIErrorCode.VALIDATION_ERROR:
          throw new Error(`Validation error: ${msg}`);
        case KieAIErrorCode.GENERATION_FAILED:
          throw new Error(`Video generation failed: ${msg}`);
        case KieAIErrorCode.MAINTENANCE:
          throw new Error('Service is under maintenance. Please try again later.');
        default:
          throw new Error(msg || 'An error occurred with the KIEAI API');
      }
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }

    throw new Error(error.message || 'Network error occurred');
  }

  /**
   * Generate video using VEO 3.1
   */
  async generateVeoVideo(params: VeoGenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await this.api.post<GenerateResponse>('/veo/generate', {
        prompt: params.prompt,
        model: params.model || 'veo3_fast',
        imageUrls: params.imageUrls,
        aspectRatio: params.aspectRatio || '16:9',
        generationType: params.generationType,
        seeds: params.seeds,
        callBackUrl: params.callBackUrl,
        enableTranslation: params.enableTranslation ?? true,
        watermark: params.watermark,
      });

      return response.data;
    } catch (error) {
      console.error('VEO video generation error:', error);
      throw error;
    }
  }

  /**
   * Generate video using Sora 2 (uses /jobs/createTask endpoint)
   */
  async generateSoraVideo(params: SoraGenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await this.api.post<GenerateResponse>('/jobs/createTask', params);

      return response.data;
    } catch (error) {
      console.error('Sora video generation error:', error);
      throw error;
    }
  }

  /**
   * Remove watermark from Sora video (uses /jobs/createTask endpoint)
   */
  async generateWatermarkRemoval(params: WatermarkRemoverRequest): Promise<GenerateResponse> {
    try {
      const response = await this.api.post<GenerateResponse>('/jobs/createTask', {
        model: 'sora-watermark-remover',
        callBackUrl: params.callBackUrl,
        input: {
          video_url: params.input.video_url,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Watermark removal error:', error);
      throw error;
    }
  }

  /**
   * Process image URLs - upload local files to kie.ai if needed
   * @param imageUrls Array of local file URIs or public URLs
   * @returns Array of public URLs ready for video generation
   */
  private async processImageUrls(imageUrls?: string[]): Promise<string[] | undefined> {
    if (!imageUrls || imageUrls.length === 0) {
      return undefined;
    }

    console.log('Processing image URLs:', imageUrls);

    try {
      const publicUrls = await kieaiUploadService.processImageUris(imageUrls);
      console.log('Processed image URLs:', publicUrls);
      return publicUrls;
    } catch (error) {
      console.error('Failed to process image URLs:', error);
      throw new Error(
        `Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generic video generation method that routes to correct API
   */
  async generateVideo(params: VideoGenerationRequest): Promise<GenerateResponse> {
    const config = MODEL_CONFIGS[params.model];

    if (!config) {
      throw new Error(`Unsupported model: ${params.model}`);
    }

    // Process image URLs first - upload local files if needed
    const processedImageUrls = await this.processImageUrls(params.imageUrls);

    if (params.model === 'Watermark Remover') {
      if (!params.videoUrl) {
        throw new Error('Video URL is required for watermark removal');
      }
      return this.generateWatermarkRemoval({
        model: 'sora-watermark-remover',
        callBackUrl: params.callBackUrl,
        input: {
          video_url: params.videoUrl,
        },
      });
    } else if (params.model === 'VEO 3.1') {
      // Determine generation type based on imageUrls
      const hasImages = processedImageUrls && processedImageUrls.length > 0;
      let generationType: GenerationType | undefined;

      if (hasImages) {
        // Use FIRST_AND_LAST_FRAMES_2_VIDEO for image-to-video
        // - 1 image: Video unfolds around the image
        // - 2 images: First image as first frame, second as last frame
        generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO';
      } else {
        // Use TEXT_2_VIDEO for text-only generation
        generationType = 'TEXT_2_VIDEO';
      }

      return this.generateVeoVideo({
        prompt: params.prompt,
        model: 'veo3_fast',
        imageUrls: processedImageUrls,
        aspectRatio: params.aspectRatio,
        generationType,
        callBackUrl: params.callBackUrl,
      });
    } else if (params.model === 'Sora 2') {
      // Determine if it's text-to-video or image-to-video based on imageUrls
      const hasImages = processedImageUrls && processedImageUrls.length > 0;
      const soraModel = hasImages ? 'sora-2-image-to-video' : 'sora-2-text-to-video';

      // Map aspectRatio to Sora's aspect_ratio format
      const aspectRatioMapping: Record<string, 'portrait' | 'landscape'> = {
        '9:16': 'portrait',
        '16:9': 'landscape',
      };
      const aspect_ratio = aspectRatioMapping[params.aspectRatio || '16:9'] || 'landscape';

      return this.generateSoraVideo({
        model: soraModel as 'sora-2-text-to-video' | 'sora-2-image-to-video',
        callBackUrl: params.callBackUrl,
        input: {
          prompt: params.prompt,
          image_urls: hasImages ? processedImageUrls : undefined,
          aspect_ratio,
          n_frames: params.duration && params.duration !== '8' ? params.duration : '10', // Use provided duration, default to 10s
          remove_watermark: true,
        },
      });
    }

    throw new Error(`Model ${params.model} not implemented`);
  }

  /**
   * Get task status for VEO
   */
  async getVeoTaskStatus(taskId: string): Promise<VeoTaskStatusResponse> {
    try {
      const response = await this.api.get<VeoTaskStatusResponse>('/veo/record-info', {
        params: { taskId },
      });

      return response.data;
    } catch (error) {
      console.error('VEO task status error:', error);
      throw error;
    }
  }

  /**
   * Get task status for Sora (uses /jobs/recordInfo endpoint)
   */
  async getSoraTaskStatus(taskId: string): Promise<SoraTaskStatusResponse> {
    try {
      const response = await this.api.get<SoraTaskStatusResponse>('/jobs/recordInfo', {
        params: { taskId },
      });

      return response.data;
    } catch (error) {
      console.error('Sora task status error:', error);
      throw error;
    }
  }

  /**
   * Generic task status method
   */
  async getTaskStatus(taskId: string, model: KieAIModel): Promise<AnyTaskStatusResponse> {
    if (model === 'VEO 3.1') {
      return this.getVeoTaskStatus(taskId);
    } else if (model === 'Sora 2' || model === 'Watermark Remover') {
      // Both Sora 2 and Watermark Remover use the /jobs/recordInfo endpoint
      return this.getSoraTaskStatus(taskId);
    }

    throw new Error(`Unsupported model: ${model}`);
  }

  /**
   * Poll for task completion
   */
  async waitForCompletion(
    taskId: string,
    model: KieAIModel,
    onProgress?: (state: string) => void,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        if (model === 'VEO 3.1') {
          // Handle VEO response structure
          const status = await this.getVeoTaskStatus(taskId);

          // Map VEO's successFlag to state string
          // 0: Generating, 1: Success, 2: Failed, 3: Generation Failed
          let state: string;
          if (status.data.successFlag === 1) {
            state = 'success';
          } else if (status.data.successFlag === 2 || status.data.successFlag === 3) {
            state = 'fail';
          } else {
            state = 'generating';
          }

          // Update progress callback
          if (onProgress) {
            onProgress(state);
          }

          // Check if completed successfully
          if (status.data.successFlag === 1 && status.data.response) {
            // response is an object containing resultUrls and originUrls arrays
            const responseData = status.data.response;
            // Try resultUrls first (preferred), then originUrls as fallback
            const videoUrl = responseData.resultUrls?.[0] || responseData.originUrls?.[0];
            if (videoUrl) {
              console.log('VEO video URL retrieved:', videoUrl);
              return videoUrl;
            } else {
              console.error('No video URL found in VEO response:', responseData);
              throw new Error('Video URL not found in response');
            }
          }

          // Check if failed
          if (status.data.successFlag === 2 || status.data.successFlag === 3) {
            throw new Error(status.data.errorMessage || 'Video generation failed');
          }
        } else if (model === 'Sora 2' || model === 'Watermark Remover') {
          // Handle Sora and Watermark Remover response structure (both use /jobs API)
          const status = await this.getSoraTaskStatus(taskId);

          // Update progress callback
          if (onProgress && status.data.state) {
            onProgress(status.data.state);
          }

          // Check if completed successfully
          if (status.data.state === 'success' && status.data.resultJson) {
            const videoUrl = this.extractResultUrl(status.data.resultJson);
            if (videoUrl) {
              return videoUrl;
            }
          }

          // Check if failed
          if (status.data.state === 'fail') {
            throw new Error(status.data.failMsg || 'Video generation failed');
          }
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        // If it's the last attempt, throw the error
        if (i === maxAttempts - 1) {
          throw error;
        }
        // Otherwise, continue polling
        console.warn(`Polling attempt ${i + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error('Video generation timeout. Please check task status later.');
  }

  /**
   * Get account credits (if available)
   */
  async getCredits(): Promise<number> {
    try {
      const response = await this.api.get('/common/credits');
      return response.data.data?.credits || 0;
    } catch (error) {
      console.error('Get credits error:', error);
      return 0;
    }
  }

  /**
   * Extract the first available result URL from resultJson payloads
   */
  private extractResultUrl(resultJson?: string | null): string | null {
    if (!resultJson || typeof resultJson !== 'string') {
      return null;
    }

    try {
      const parsed = JSON.parse(resultJson);
      const candidateFields = [
        parsed.resultUrls,
        parsed.resultUrl,
        parsed.resultWaterMarkUrls,
        parsed.resultWatermarkUrls,
        parsed.resultVideoUrls,
        parsed.resultVideoUrl,
        parsed.videoUrls,
        parsed.videoUrl,
        parsed.url,
      ];

      for (const field of candidateFields) {
        if (!field) {
          continue;
        }

        if (Array.isArray(field)) {
          const firstUrl = field.find((item) => typeof item === 'string' && item.startsWith('http'));
          if (firstUrl) {
            return firstUrl;
          }
        } else if (typeof field === 'string' && field.startsWith('http')) {
          return field;
        }
      }
    } catch (error) {
      console.error('Failed to parse resultJson while extracting video URL:', error);
    }

    return null;
  }
}

// Export singleton instance
export const kieAIService = new KieAIService();
export default KieAIService;
