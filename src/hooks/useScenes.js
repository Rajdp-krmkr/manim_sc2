import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sceneTemplatesQueryOptions,
  sceneSuggestionsQueryOptions,
  sceneTemplateQueryOptions,
  createCustomScene,
  saveSceneProgress,
} from "@/queries/scene-queries";

// Hook for fetching scene templates
export function useSceneTemplates(topic = "") {
  return useQuery(sceneTemplatesQueryOptions(topic));
}

// Hook for fetching scene suggestions
export function useSceneSuggestions(category = "") {
  return useQuery(sceneSuggestionsQueryOptions(category));
}

// Hook for fetching a single scene template
export function useSceneTemplate(id) {
  return useQuery(sceneTemplateQueryOptions(id));
}

// Hook for creating a custom scene
export function useCreateCustomScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomScene,
    onSuccess: () => {
      // Invalidate scene templates to include new custom scene
      queryClient.invalidateQueries({ queryKey: ["sceneTemplates"] });
    },
    onError: (error) => {
      console.error("Error creating custom scene:", error);
    },
  });
}

// Hook for saving scene progress
export function useSaveSceneProgress() {
  return useMutation({
    mutationFn: ({ sceneId, progress }) => saveSceneProgress(sceneId, progress),
    onError: (error) => {
      console.error("Error saving scene progress:", error);
    },
  });
}
