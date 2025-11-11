import { useState, useCallback } from 'react';
import { kieAIService } from '../services/kieai.service';
import { KieAIModel, VideoGenerationRequest, TaskState } from '../types/kieai';

export interface UseKieAIResult {
  generateVideo: (params: VideoGenerationRequest) => Promise<string>;
  loading: boolean;
  error: string | null;
  videoUrl: string | null;
  taskId: string | null;
  progress: TaskState | 'idle' | 'submitting';
  reset: () => void;
}

export const useKieAI = (): UseKieAIResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<TaskState | 'idle' | 'submitting'>('idle');

  const generateVideo = useCallback(async (params: VideoGenerationRequest): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      setProgress('submitting');
      setVideoUrl(null);
      setTaskId(null);

      console.log('Generating video with params:', params);

      // Submit generation request
      const response = await kieAIService.generateVideo(params);

      if (response.code !== 200) {
        throw new Error(response.msg || 'Failed to submit video generation');
      }

      const newTaskId = response.data.taskId;
      setTaskId(newTaskId);
      setProgress('queueing');

      console.log('Video generation task submitted:', newTaskId);

      // Wait for completion with progress updates
      const url = await kieAIService.waitForCompletion(
        newTaskId,
        params.model,
        (state) => {
          console.log('Generation progress:', state);
          setProgress(state as TaskState);
        },
        60, // max 60 attempts
        5000 // poll every 5 seconds
      );

      setVideoUrl(url);
      setProgress('success');
      setLoading(false);

      console.log('Video generation completed:', url);

      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Video generation error:', errorMessage);
      setError(errorMessage);
      setProgress('fail');
      setLoading(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setVideoUrl(null);
    setTaskId(null);
    setProgress('idle');
  }, []);

  return {
    generateVideo,
    loading,
    error,
    videoUrl,
    taskId,
    progress,
    reset,
  };
};

export default useKieAI;
