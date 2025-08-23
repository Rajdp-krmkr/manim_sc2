import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  videoDetailQueryOptions,
  videoCommentsQueryOptions,
  relatedVideosQueryOptions,
  videoAnalyticsQueryOptions,
  userPlaylistsQueryOptions,
  addVideoComment,
  likeVideo,
  shareVideo,
  downloadVideo,
  addToPlaylist,
} from "@/queries/video-detail-queries";

// Hook for fetching video details
export function useVideoDetail(id) {
  return useQuery(videoDetailQueryOptions(id));
}

// Hook for fetching video comments
export function useVideoComments(videoId) {
  return useQuery(videoCommentsQueryOptions(videoId));
}

// Hook for fetching related videos
export function useRelatedVideos(videoId, limit = 4) {
  return useQuery(relatedVideosQueryOptions(videoId, limit));
}

// Hook for fetching video analytics
export function useVideoAnalytics(videoId) {
  return useQuery(videoAnalyticsQueryOptions(videoId));
}

// Hook for fetching user playlists
export function useUserPlaylists() {
  return useQuery(userPlaylistsQueryOptions);
}

// Hook for adding a comment
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, content, author }) =>
      addVideoComment(videoId, content, author),
    onSuccess: (newComment) => {
      // Update comments cache
      queryClient.setQueryData(
        ["videoComments", newComment.videoId],
        (oldComments) => [...(oldComments || []), newComment]
      );
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
    },
  });
}

// Hook for liking a video
export function useLikeVideo() {
  return useMutation({
    mutationFn: likeVideo,
    onError: (error) => {
      console.error("Error liking video:", error);
    },
  });
}

// Hook for sharing a video
export function useShareVideo() {
  return useMutation({
    mutationFn: ({ videoId, platform }) => shareVideo(videoId, platform),
    onError: (error) => {
      console.error("Error sharing video:", error);
    },
  });
}

// Hook for downloading a video
export function useDownloadVideo() {
  return useMutation({
    mutationFn: downloadVideo,
    onSuccess: (downloadData) => {
      // Trigger download in browser
      const link = document.createElement("a");
      link.href = downloadData.downloadUrl;
      link.download = downloadData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error) => {
      console.error("Error downloading video:", error);
    },
  });
}

// Hook for adding video to playlist
export function useAddToPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, playlistId }) => addToPlaylist(videoId, playlistId),
    onSuccess: () => {
      // Refresh playlists
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] });
    },
    onError: (error) => {
      console.error("Error adding to playlist:", error);
    },
  });
}
