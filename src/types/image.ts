export type ImageStyle = 'photorealistic' | 'artistic' | 'sketch' | 'cartoon' | 'oil-painting' | 'watercolor';
export type ImageAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
export type ImageQuality = 'standard' | 'hd' | 'ultra-hd';
export type TemplateType = 'ring-camera' | 'security-camera' | 'smartphone' | 'body-cam' | 'drone' | 'dashcam';

export interface GeneratedImage {
  id: string;
  prompt: string;
  style: ImageStyle;
  templateType?: TemplateType;
  aspectRatio: ImageAspectRatio;
  quality: ImageQuality;
  createdAt: Date;
  thumbnailGradient: string[];
  isFavorite: boolean;
  imageUrl?: string; // For actual generated images
}

export interface Template {
  id: TemplateType;
  name: string;
  description: string;
  icon: string;
  gradient: string[];
  previewPrompt?: string; // Example prompt for this template
  styleModifier?: string; // Additional style instructions for this template
}

export interface ImageGenerationParams {
  prompt: string;
  style: ImageStyle;
  templateType?: TemplateType;
  aspectRatio: ImageAspectRatio;
  quality: ImageQuality;
}
