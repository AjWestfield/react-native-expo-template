import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeneratedVideo, AspectRatio } from '../types/video';

const STORAGE_KEY = '@gallery_videos_v1';
type Listener = (videos: GeneratedVideo[]) => void;

const listeners = new Set<Listener>();
let galleryCache: GeneratedVideo[] = [];
let hasHydrated = false;
let hydrationPromise: Promise<void> | null = null;

const gradientPalette: [string, string][] = [
  ['#FF6B6B', '#4ECDC4'],
  ['#A8E6CF', '#FFD3B6'],
  ['#667EEA', '#764BA2'],
  ['#F093FB', '#F5576C'],
  ['#43E97B', '#38F9D7'],
  ['#4FACFE', '#00F2FE'],
  ['#FAD961', '#F76B1C'],
  ['#C6FFDD', '#FBD786'],
  ['#30E8BF', '#FF8235'],
  ['#FF9A9E', '#FAD0C4'],
];

const notify = () => {
  const snapshot = [...galleryCache];
  listeners.forEach((listener) => listener(snapshot));
};

const persist = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(galleryCache));
  } catch (error) {
    console.error('Failed to persist gallery videos', error);
  }
};

const hydrate = async () => {
  if (hasHydrated) {
    return;
  }

  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: GeneratedVideo[] = JSON.parse(raw);
          galleryCache = parsed.map((video) => ({
            ...video,
            createdAt: video.createdAt || new Date().toISOString(),
            thumbnailGradient:
              video.thumbnailGradient && video.thumbnailGradient.length > 0
                ? video.thumbnailGradient
                : pickGradient(video.id),
            thumbnailUri: video.thumbnailUri ?? null,
            supabaseVideoId: video.supabaseVideoId ?? null,
            storagePath: video.storagePath ?? null,
          }));
        }
      } catch (error) {
        console.warn('Failed to hydrate gallery store', error);
      } finally {
        hasHydrated = true;
        hydrationPromise = null;
      }
    })();
  }

  await hydrationPromise;
};

const pickGradient = (seed: string): [string, string] => {
  if (!seed) {
    return gradientPalette[0];
  }

  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = Math.abs(hash) % gradientPalette.length;
  return gradientPalette[index];
};

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const normalizeAspectRatio = (value?: string): AspectRatio => {
  if (!value) {
    return '9:16';
  }

  const normalized = value.toLowerCase();
  if (normalized === 'vertical' || normalized === '9:16') {
    return '9:16';
  }

  if (normalized === 'horizontal' || normalized === '16:9') {
    return '16:9';
  }

  return (value as AspectRatio) || '9:16';
};

export interface GalleryVideoInput {
  prompt: string;
  model?: string;
  duration?: number | string;
  aspectRatio?: string;
  videoUrl: string;
  thumbnailUri?: string | null;
  supabaseVideoId?: string | null;
  storagePath?: string | null;
}

export const addGalleryVideo = async (input: GalleryVideoInput) => {
  await hydrate();

  const duration =
    typeof input.duration === 'string'
      ? parseInt(input.duration, 10) || 10
      : input.duration ?? 10;

  const newVideo: GeneratedVideo = {
    id: createId(),
    prompt: input.prompt,
    style: input.model?.toLowerCase() ?? 'custom',
    duration,
    aspectRatio: normalizeAspectRatio(input.aspectRatio),
    fps: 30,
    createdAt: new Date().toISOString(),
    thumbnailGradient: pickGradient(input.prompt + input.videoUrl),
    isFavorite: false,
    videoUrl: input.videoUrl,
    localUri: null,
    savedToDevice: false,
    thumbnailUri: input.thumbnailUri ?? null,
    supabaseVideoId: input.supabaseVideoId ?? null,
    storagePath: input.storagePath ?? null,
  };

  galleryCache = [newVideo, ...galleryCache];
  await persist();
  notify();

  return newVideo;
};

export const updateGalleryVideo = async (
  videoId: string,
  patch: Partial<GeneratedVideo>
) => {
  await hydrate();

  let updated: GeneratedVideo | null = null;
  galleryCache = galleryCache.map((video) => {
    if (video.id !== videoId) {
      return video;
    }

    updated = {
      ...video,
      ...patch,
    };

    return updated;
  });

  if (updated) {
    await persist();
    notify();
  }

  return updated;
};

export const toggleGalleryFavorite = async (videoId: string, force?: boolean) => {
  await hydrate();
  const target = galleryCache.find((video) => video.id === videoId);
  if (!target) {
    return null;
  }

  const nextValue = typeof force === 'boolean' ? force : !target.isFavorite;
  return updateGalleryVideo(videoId, { isFavorite: nextValue });
};

export const useGalleryVideos = () => {
  const [videos, setVideos] = useState<GeneratedVideo[]>(galleryCache);
  const [isReady, setIsReady] = useState(hasHydrated);

  useEffect(() => {
    let mounted = true;

    hydrate().then(() => {
      if (mounted) {
        setVideos([...galleryCache]);
        setIsReady(true);
      }
    });

    const listener: Listener = (next) => {
      if (mounted) {
        setVideos(next);
      }
    };

    listeners.add(listener);

    return () => {
      mounted = false;
      listeners.delete(listener);
    };
  }, []);

  return { videos, isReady };
};

export const removeGalleryVideo = async (videoId: string) => {
  await hydrate();
  const beforeLength = galleryCache.length;
  galleryCache = galleryCache.filter((video) => video.id !== videoId);
  if (galleryCache.length === beforeLength) {
    return;
  }
  await persist();
  notify();
};

export const clearGalleryVideos = async () => {
  await hydrate();
  if (galleryCache.length === 0) {
    return;
  }
  galleryCache = [];
  await persist();
  notify();
};
