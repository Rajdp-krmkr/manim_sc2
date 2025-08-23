import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  animationsQueryOptions,
  animationQueryOptions,
  createAnimation,
  deleteAnimation,
  updateAnimation,
} from "@/queries/animation-queries";

// Hook for fetching all animations
export function useAnimations() {
  return useQuery(animationsQueryOptions);
}

// Hook for fetching a single animation
export function useAnimation(id) {
  return useQuery(animationQueryOptions(id));
}

// Hook for creating an animation
export function useCreateAnimation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnimation,
    onSuccess: () => {
      // Invalidate and refetch animations list
      queryClient.invalidateQueries({ queryKey: ["animations"] });
    },
    onError: (error) => {
      console.error("Error creating animation:", error);
    },
  });
}

// Hook for deleting an animation
export function useDeleteAnimation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnimation,
    onSuccess: () => {
      // Invalidate and refetch animations list
      queryClient.invalidateQueries({ queryKey: ["animations"] });
    },
    onError: (error) => {
      console.error("Error deleting animation:", error);
    },
  });
}

// Hook for updating an animation
export function useUpdateAnimation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateAnimation(id, data),
    onSuccess: (updatedAnimation) => {
      // Update the specific animation in cache
      queryClient.setQueryData(
        ["animations", updatedAnimation.id],
        updatedAnimation
      );
      // Invalidate animations list to reflect changes
      queryClient.invalidateQueries({ queryKey: ["animations"] });
    },
    onError: (error) => {
      console.error("Error updating animation:", error);
    },
  });
}
