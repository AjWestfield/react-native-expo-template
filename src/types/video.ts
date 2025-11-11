export type VideoStyle = string;
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
  createdAt: string;
  thumbnailGradient: string[];
  isFavorite: boolean;
  videoUrl?: string;
  localUri?: string | null;
  savedToDevice?: boolean;
  thumbnailUri?: string | null;
  supabaseVideoId?: string | null;
  storagePath?: string | null;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number; // 0-100
  error?: string;
}
