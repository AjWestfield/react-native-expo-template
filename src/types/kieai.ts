// KIEAI API Types
export type KieAIModel = 'Sora 2' | 'VEO 3.1' | 'Watermark Remover';
export type VeoModel = 'veo3' | 'veo3_fast';
export type SoraModel = 'sora-2-text-to-video' | 'sora-2-image-to-video';
export type WatermarkModel = 'sora-watermark-remover';

export type AspectRatio = '16:9' | '9:16' | 'Auto';

export type GenerationType =
  | 'TEXT_2_VIDEO'
  | 'FIRST_AND_LAST_FRAMES_2_VIDEO'
  | 'REFERENCE_2_VIDEO';

export type TaskState =
  | 'wait'
  | 'waiting'
  | 'queueing'
  | 'queuing'
  | 'generating'
  | 'success'
  | 'fail';

// VEO 3.1 Request
export interface VeoGenerateRequest {
  prompt: string;
  model?: VeoModel;
  imageUrls?: string[];
  generationType?: GenerationType;
  aspectRatio?: AspectRatio;
  seeds?: number; // 10000-99999
  callBackUrl?: string;
  enableTranslation?: boolean;
  watermark?: string;
}

// Sora 2 Request (actual KIEAI /jobs/createTask API structure)
export interface SoraGenerateRequest {
  model: SoraModel; // "sora-2-text-to-video" or "sora-2-image-to-video"
  callBackUrl?: string;
  input: {
    prompt: string;
    image_urls?: string[]; // Required for image-to-video
    aspect_ratio?: 'portrait' | 'landscape'; // portrait=9:16, landscape=16:9
    n_frames?: '10' | '15'; // Video duration in seconds
    remove_watermark?: boolean;
  };
}

// Watermark Remover Request (uses /jobs/createTask API)
export interface WatermarkRemoverRequest {
  model: WatermarkModel; // "sora-watermark-remover"
  callBackUrl?: string;
  input: {
    video_url: string; // Must be from sora.chatgpt.com
  };
}

// Generic Video Generation Request
export interface VideoGenerationRequest {
  prompt: string;
  model: KieAIModel;
  imageUrls?: string[];
  videoUrl?: string; // For watermark removal
  aspectRatio?: AspectRatio;
  duration?: '10' | '15' | '8'; // Sora 2: 10 or 15, VEO 3.1: 8 (fixed)
  callBackUrl?: string;
}

// API Response
export interface KieAIResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// Generate Response
export interface GenerateResponseData {
  taskId: string;
}

export type GenerateResponse = KieAIResponse<GenerateResponseData>;

// Task Status Response
export interface VideoInfo {
  videoId?: string;
  taskId: string;
  videoUrl: string;
  imageUrl?: string;
}

export interface TaskStatusData {
  taskId: string;
  parentTaskId?: string;
  generateParam?: {
    prompt: string;
    imageUrl?: string;
    expandPrompt?: boolean;
  };
  state: TaskState;
  generateTime?: string;
  videoInfo?: VideoInfo;
  failCode?: number;
  failMsg?: string;
  expireFlag?: number;
}

export type TaskStatusResponse = KieAIResponse<TaskStatusData>;

// VEO Response Object Structure
export interface VeoResponseData {
  taskId: string;
  resultUrls: string[];
  originUrls: string[];
  resolution: string;
}

// VEO-specific Task Status Response (actual API structure)
export interface VeoTaskStatusData {
  taskId: string;
  paramJson: string; // JSON string containing request parameters
  response: VeoResponseData | null; // Object containing video URLs when complete
  successFlag: number; // 0 = Generating, 1 = Success, 2 = Failed, 3 = Generation Failed
  fallbackFlag: boolean;
  completeTime: string | null;
  createTime: string;
  errorCode: string | null;
  errorMessage: string | null;
}

export type VeoTaskStatusResponse = KieAIResponse<VeoTaskStatusData>;

// Sora-specific Task Status Response (actual /jobs/recordInfo API structure)
export interface SoraTaskStatusData {
  taskId: string;
  model: string; // "sora-2-text-to-video" or "sora-2-image-to-video"
  state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';
  param: string; // JSON string of request parameters
  resultJson: string; // JSON string: {"resultUrls":["..."],"resultWaterMarkUrls":["..."]}
  failCode: string;
  failMsg: string;
  completeTime: number | null;
  createTime: number;
  updateTime: number;
}

export type SoraTaskStatusResponse = KieAIResponse<SoraTaskStatusData>;

// Error Response
export interface KieAIError {
  code: number;
  msg: string;
  details?: string;
}

// API Error Codes
export enum KieAIErrorCode {
  SUCCESS = 200,
  PROCESSING = 400, // 1080P is processing
  UNAUTHORIZED = 401,
  INSUFFICIENT_CREDITS = 402,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  RATE_LIMITED = 429,
  MAINTENANCE = 455,
  SERVER_ERROR = 500,
  GENERATION_FAILED = 501,
  FEATURE_DISABLED = 505,
}

// Model Configuration
export interface ModelConfig {
  apiModel: string;
  endpoint: string;
  supportsImageToVideo: boolean;
  supportsTextToVideo: boolean;
  maxDuration: number; // seconds
  pricing: number; // per second
}

export const MODEL_CONFIGS: Record<KieAIModel, ModelConfig> = {
  'Sora 2': {
    apiModel: 'sora-2-text-to-video',
    endpoint: '/sora/generate',
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: 15,
    pricing: 0.015,
  },
  'VEO 3.1': {
    apiModel: 'veo3_fast',
    endpoint: '/veo/generate',
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: 8,
    pricing: 0.05, // $0.40 per 8-second video
  },
  'Watermark Remover': {
    apiModel: 'sora-watermark-remover',
    endpoint: '/jobs/createTask',
    supportsImageToVideo: false,
    supportsTextToVideo: false,
    maxDuration: 0, // N/A - uses source video duration
    pricing: 0.01, // Pricing per removal (estimate)
  },
};
