import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  videoOptionsQueryOptions,
  videoOptionQueryOptions,
  generationQueueQueryOptions,
  generationStatusQueryOptions,
  generateVideo,
  cancelGeneration,
  retryGeneration,
} from "@/queries/video-queries";

// Hook for fetching video generation options
export function useVideoOptions() {
  return useQuery(videoOptionsQueryOptions);
}

// Hook for fetching a single video option
export function useVideoOption(id) {
  return useQuery(videoOptionQueryOptions(id));
}

// Hook for fetching generation queue
export function useGenerationQueue() {
  return useQuery(generationQueueQueryOptions);
}

// Hook for fetching generation status
export function useGenerationStatus(jobId) {
  return useQuery(generationStatusQueryOptions(jobId));
}

// Hook for generating a video
export function useGenerateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ optionId, sceneData }) => generateVideo(optionId, sceneData),
    onSuccess: () => {
      // Refresh generation queue
      queryClient.invalidateQueries({ queryKey: ["generationQueue"] });
      // Refresh animations list (new video will appear there)
      queryClient.invalidateQueries({ queryKey: ["animations"] });
    },
    onError: (error) => {
      console.error("Error generating video:", error);
    },
  });
}

// Hook for canceling generation
export function useCancelGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelGeneration,
    onSuccess: () => {
      // Refresh generation queue
      queryClient.invalidateQueries({ queryKey: ["generationQueue"] });
    },
    onError: (error) => {
      console.error("Error canceling generation:", error);
    },
  });
}

// Hook for retrying failed generation
export function useRetryGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryGeneration,
    onSuccess: () => {
      // Refresh generation queue
      queryClient.invalidateQueries({ queryKey: ["generationQueue"] });
    },
    onError: (error) => {
      console.error("Error retrying generation:", error);
    },
  });
}
