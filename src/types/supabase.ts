/**
 * Database types for Supabase tables
 * These types match the database schema defined in the implementation plan
 */

export type VideoStyle = 'cinematic' | 'anime' | 'realistic' | 'abstract';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type FPS = 24 | 30 | 60;
export type VideoStatus = 'processing' | 'ready' | 'failed' | 'queued';

/**
 * User table - syncs with Clerk user data
 */
export interface User {
  id: string; // Matches Clerk user ID
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Videos table - stores metadata for generated videos
 */
export interface Video {
  id: string;
  user_id: string;

  // Video metadata
  title: string;
  description: string | null;
  prompt: string;

  // Style and settings
  style: VideoStyle;
  duration: number; // in seconds
  aspect_ratio: AspectRatio;
  fps: FPS;

  // Storage paths
  storage_path: string;
  thumbnail_path: string | null;
  source_image_path: string | null;

  // File info
  file_size: number | null;
  mime_type: string;

  // Status tracking
  status: VideoStatus;
  error_message: string | null;

  // Engagement
  is_favorite: boolean;
  view_count: number;

  // Additional metadata (JSON)
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Video templates table - pre-loaded camera style templates
 */
export interface VideoTemplate {
  id: string;
  name: string;
  description: string | null;
  style: VideoStyle;
  thumbnail_gradient: string[]; // Array of color strings
  default_duration: number;
  default_aspect_ratio: AspectRatio;
  default_fps: FPS;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

/**
 * Insert types (omit auto-generated fields)
 */
export type UserInsert = Omit<User, 'created_at' | 'updated_at'>;
export type VideoInsert = Omit<Video, 'id' | 'created_at' | 'updated_at'>;
export type VideoTemplateInsert = Omit<VideoTemplate, 'id' | 'created_at'>;

/**
 * Update types (all fields optional except id)
 */
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;
export type VideoUpdate = Partial<Omit<Video, 'id' | 'user_id' | 'created_at'>>;
export type VideoTemplateUpdate = Partial<Omit<VideoTemplate, 'id' | 'created_at'>>;

/**
 * Database helper types
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
        Relationships: [];
      };
      videos: {
        Row: Video;
        Insert: VideoInsert;
        Update: VideoUpdate;
        Relationships: [
          {
            foreignKeyName: 'videos_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      video_templates: {
        Row: VideoTemplate;
        Insert: VideoTemplateInsert;
        Update: VideoTemplateUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
