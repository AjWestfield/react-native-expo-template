# Integration Examples

This guide shows how to integrate Supabase services into your existing React Native Expo app.

## Table of Contents
1. [User Sync on App Load](#user-sync-on-app-load)
2. [Video Upload in VideoGenerationScreen](#video-upload-in-videogenerationscreen)
3. [Fetch Videos in HomeScreen](#fetch-videos-in-homescreen)
4. [Profile Screen with User Data](#profile-screen-with-user-data)
5. [Video List with Favorites](#video-list-with-favorites)

---

## 1. User Sync on App Load

Sync Clerk user to Supabase when the app loads or user signs in.

### In your root component (e.g., `App.tsx` or `_layout.tsx`):

```typescript
import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useSupabase } from './src/hooks/useSupabase';
import { UserService } from './src/services/userService';

export default function App() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { client } = useSupabase();

  useEffect(() => {
    // Sync user to Supabase when authenticated
    const syncUser = async () => {
      if (isSignedIn && user && client) {
        try {
          const userService = new UserService(client);
          await userService.syncUser(user);
          console.log('User synced to Supabase');
        } catch (error) {
          console.error('Failed to sync user:', error);
        }
      }
    };

    syncUser();
  }, [isSignedIn, user, client]);

  return (
    // Your app components
  );
}
```

---

## 2. Video Upload in VideoGenerationScreen

Replace local video saving with Supabase upload.

### Before (existing code):
```typescript
// Saving to local state
const saveVideo = async (uri: string) => {
  // Save to AsyncStorage or local state
  setVideos([...videos, newVideo]);
};
```

### After (with Supabase):
```typescript
import { useVideoUpload } from '../hooks/useVideoUpload';
import { VideoGenerationParams } from '../types/video';

export function VideoGenerationScreen() {
  const { uploadVideo, isUploading, progress, error } = useVideoUpload();
  const [generationParams, setGenerationParams] = useState<VideoGenerationParams>({
    prompt: '',
    style: 'cinematic',
    duration: 5,
    aspectRatio: '16:9',
    fps: 30,
  });

  const handleGenerateAndUpload = async (videoUri: string) => {
    try {
      // Upload video to Supabase
      const videoRecord = await uploadVideo(
        videoUri,
        generationParams,
        {
          thumbnailUri: thumbnailUri, // Optional
          sourceImageUri: sourceImageUri, // Optional
          title: 'My Generated Video', // Optional
        }
      );

      console.log('Video uploaded:', videoRecord.id);
      Alert.alert('Success', 'Video uploaded successfully!');

      // Navigate to home or video detail screen
      navigation.navigate('Home');
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Error', 'Failed to upload video');
    }
  };

  return (
    <View>
      {/* Your video generation UI */}

      {isUploading && (
        <View style={styles.progressContainer}>
          <Text>Uploading... {Math.round(progress)}%</Text>
          <ProgressBar progress={progress / 100} />
        </View>
      )}

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <Button
        title="Generate & Upload"
        onPress={handleGenerateAndUpload}
        disabled={isUploading}
      />
    </View>
  );
}
```

---

## 3. Fetch Videos in HomeScreen

Display user's videos from Supabase instead of local storage.

### Before (existing code):
```typescript
// Fetching from AsyncStorage or local state
const [videos, setVideos] = useState([]);

useEffect(() => {
  const loadVideos = async () => {
    const stored = await AsyncStorage.getItem('@videos');
    setVideos(JSON.parse(stored) || []);
  };
  loadVideos();
}, []);
```

### After (with Supabase):
```typescript
import { useVideos } from '../hooks/useVideos';
import { StorageService } from '../services/storageService';

export function HomeScreen() {
  const {
    videos,
    isLoading,
    error,
    refresh,
    toggleFavorite,
    deleteVideo,
  } = useVideos({ autoFetch: true });

  const { client } = useSupabase();
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});

  // Get signed URLs for videos (they expire after 1 hour)
  useEffect(() => {
    const fetchUrls = async () => {
      if (!client) return;

      const storageService = new StorageService(client);
      const urls: Record<string, string> = {};

      for (const video of videos) {
        try {
          const url = await storageService.getVideoUrl(video.storage_path);
          urls[video.id] = url;
        } catch (error) {
          console.error('Failed to get URL for video:', video.id, error);
        }
      }

      setVideoUrls(urls);
    };

    fetchUrls();
  }, [videos, client]);

  const handleRefresh = async () => {
    await refresh();
  };

  const handleToggleFavorite = async (videoId: string, currentStatus: boolean) => {
    try {
      await toggleFavorite(videoId, !currentStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleDelete = async (videoId: string) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVideo(videoId);
              Alert.alert('Success', 'Video deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete video');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={refresh} />
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      refreshing={isLoading}
      onRefresh={handleRefresh}
      renderItem={({ item }) => (
        <VideoCard
          video={item}
          videoUrl={videoUrls[item.id]}
          onToggleFavorite={() => handleToggleFavorite(item.id, item.is_favorite)}
          onDelete={() => handleDelete(item.id)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text>No videos yet. Generate your first video!</Text>
        </View>
      }
    />
  );
}
```

---

## 4. Profile Screen with User Data

Display user profile from Supabase.

```typescript
import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useSupabase } from '../hooks/useSupabase';
import { UserService } from '../services/userService';
import { User } from '../types/supabase';

export function ProfileScreen() {
  const { userId } = useAuth();
  const { user: clerkUser } = useUser();
  const { client } = useSupabase();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!client || !userId) return;

      try {
        const userService = new UserService(client);
        const user = await userService.getUser(userId);
        setUserData(user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [client, userId]);

  const handleUpdateProfile = async (updates: { full_name?: string }) => {
    if (!client || !userId) return;

    try {
      const userService = new UserService(client);
      const updated = await userService.updateUser(userId, updates);
      setUserData(updated);
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: userData?.avatar_url || clerkUser?.imageUrl }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{userData?.full_name || 'Set your name'}</Text>
      <Text style={styles.email}>{userData?.email}</Text>

      <Button
        title="Edit Profile"
        onPress={() => navigation.navigate('EditProfile')}
      />
    </View>
  );
}
```

---

## 5. Video List with Favorites

Create a favorites tab or filter.

```typescript
import { useVideos } from '../hooks/useVideos';

export function FavoritesScreen() {
  const { videos, isLoading, getFavorites } = useVideos();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      await getFavorites();
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  return (
    <FlatList
      data={videos.filter(v => v.is_favorite)}
      renderItem={({ item }) => (
        <VideoCard video={item} />
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text>No favorite videos yet</Text>
        </View>
      }
    />
  );
}
```

---

## 6. Search Videos

Add search functionality.

```typescript
import { useState } from 'react';
import { useVideos } from '../hooks/useVideos';

export function SearchVideosScreen() {
  const { videos, searchVideos, isLoading } = useVideos();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      await searchVideos(query);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Search videos by prompt..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={videos}
          renderItem={({ item }) => <VideoCard video={item} />}
          ListEmptyComponent={
            <Text>No videos found for "{searchQuery}"</Text>
          }
        />
      )}
    </View>
  );
}
```

---

## 7. Real-time Video Status Updates (Optional)

Subscribe to video status changes in real-time.

```typescript
import { useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export function VideoDetailScreen({ videoId }) {
  const { client } = useSupabase();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    if (!client) return;

    // Subscribe to real-time updates for this video
    const subscription = client
      .from('videos')
      .on('UPDATE', (payload) => {
        if (payload.new.id === videoId) {
          setVideo(payload.new);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [client, videoId]);

  return (
    <View>
      <Text>Status: {video?.status}</Text>
      {video?.status === 'processing' && (
        <ActivityIndicator />
      )}
    </View>
  );
}
```

---

## Common Patterns

### Error Handling
```typescript
try {
  await uploadVideo(uri, params);
} catch (error) {
  if (error.message.includes('JWT')) {
    // Token expired, re-authenticate
    Alert.alert('Session Expired', 'Please sign in again');
  } else if (error.message.includes('storage')) {
    // Storage error
    Alert.alert('Upload Failed', 'Check your internet connection');
  } else {
    // Generic error
    Alert.alert('Error', error.message);
  }
}
```

### Loading States
```typescript
const { isLoading: isSupabaseLoading } = useSupabase();
const { isLoading: isVideosLoading } = useVideos();

const isLoading = isSupabaseLoading || isVideosLoading;

if (isLoading) {
  return <LoadingScreen />;
}
```

### Refresh Videos
```typescript
const { refresh } = useVideos({ autoFetch: true });

// Pull-to-refresh
<FlatList
  data={videos}
  refreshing={isLoading}
  onRefresh={refresh}
/>
```

---

## Next Steps

1. **Replace AsyncStorage calls** with Supabase services
2. **Add error boundaries** to catch Supabase errors
3. **Implement loading states** throughout the app
4. **Test offline behavior** and add retry logic
5. **Monitor Supabase dashboard** for performance issues

---

## Tips

- **Signed URLs expire after 1 hour** - refresh them when needed
- **Test RLS policies** thoroughly before production
- **Use transactions** for operations that affect multiple tables
- **Monitor storage usage** in Supabase dashboard
- **Implement retry logic** for network failures

---

Ready to integrate? Start with user sync, then video upload, then fetching!
