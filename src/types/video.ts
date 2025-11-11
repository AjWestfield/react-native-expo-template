export type VideoStyle = 'cinematic' | 'anime' | 'realistic' | 'abstract';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type FPS = 24 | 30 | 60;

export interface VideoGenerationParams {
  prompt: string;
  style: VideoStyle;
  duration: number; // in seconds
  aspectRatio: AspectRatio;
  fps: FPS;
}

export interface GeneratedVideo {
  id: string;
  prompt: string;
  style: VideoStyle;
  duration: number;
  aspectRatio: AspectRatio;
  fps: FPS;
  createdAt: Date;
  thumbnailGradient: string[];
  isFavorite: boolean;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number; // 0-100
  error?: string;
}
