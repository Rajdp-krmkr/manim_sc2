import { queryOptions } from "@tanstack/react-query";

// Mock video details data
const mockVideoDetails = {
  1: {
    id: "1",
    title: "Derivative of x²",
    description:
      "Animated visualization of the derivative concept using limits",
    videoUrl: "/videos/derivative-x-squared.mp4",
    thumbnailUrl:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=d/dx(x²)",
    duration: 154, // 2:34 in seconds
    createdAt: new Date("2025-08-20"),
    status: "completed",
    style: "mathematical",
    resolution: "1920x1080",
    frameRate: 30,
    fileSize: 13107200, // 12.5MB in bytes
    prompt: "Show the derivative of x² as the limit of the difference quotient",
    tags: ["calculus", "derivatives", "limits"],
  },
  2: {
    id: "2",
    title: "Matrix Multiplication",
    description: "2x2 matrix multiplication with geometric transformations",
    videoUrl: "/videos/matrix-multiplication.mp4",
    thumbnailUrl:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=Matrix×Matrix",
    duration: 198, // 3:18 in seconds
    createdAt: new Date("2025-08-19"),
    status: "completed",
    style: "educational",
    resolution: "1920x1080",
    frameRate: 30,
    fileSize: 19088384, // 18.2MB in bytes
    prompt:
      "Demonstrate matrix multiplication with 2x2 matrices using geometric transformations",
    tags: ["linear-algebra", "matrices", "transformations"],
  },
  3: {
    id: "3",
    title: "Unit Circle Animation",
    description: "Sine and cosine wave formation from unit circle",
    videoUrl: "/videos/unit-circle.mp4",
    thumbnailUrl:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=sin(θ)+cos(θ)",
    duration: 252, // 4:12 in seconds
    createdAt: new Date("2025-08-18"),
    status: "completed",
    style: "interactive",
    resolution: "1920x1080",
    frameRate: 30,
    fileSize: 26030080, // 24.8MB in bytes
    prompt: "Animate the unit circle showing sine and cosine wave formation",
    tags: ["trigonometry", "unit-circle", "sine", "cosine"],
  },
};

const mockComments = [
  {
    id: "comment1",
    videoId: "1",
    author: "MathStudent",
    content:
      "This really helped me understand derivatives! The visual approach is perfect.",
    createdAt: new Date("2025-08-21"),
    likes: 15,
    replies: [],
  },
  {
    id: "comment2",
    videoId: "1",
    author: "TeacherMike",
    content:
      "I'm using this in my calculus class. Students love the animations!",
    createdAt: new Date("2025-08-21"),
    likes: 8,
    replies: [
      {
        id: "reply1",
        author: "MathStudent",
        content: "Lucky students! I wish my teacher used these.",
        createdAt: new Date("2025-08-22"),
        likes: 3,
      },
    ],
  },
  {
    id: "comment3",
    videoId: "2",
    author: "LinearAlgebraFan",
    content:
      "The geometric interpretation of matrix multiplication is brilliant!",
    createdAt: new Date("2025-08-20"),
    likes: 12,
    replies: [],
  },
];

const mockPlaylistData = [
  {
    id: "calc-basics",
    title: "Calculus Fundamentals",
    description: "Essential calculus concepts visualized",
    videos: ["1", "4", "5"],
    createdAt: new Date("2025-08-15"),
    isPublic: true,
  },
  {
    id: "linear-algebra-intro",
    title: "Linear Algebra Introduction",
    description: "Understanding matrices and vectors",
    videos: ["2"],
    createdAt: new Date("2025-08-16"),
    isPublic: false,
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Query function to fetch video details
async function fetchVideoDetail(id) {
  await delay(1000);

  if (Math.random() > 0.95) {
    throw new Error(`Failed to fetch video with id ${id}`);
  }

  const video = mockVideoDetails[id];
  if (!video) {
    throw new Error(`Video with id ${id} not found`);
  }

  return video;
}

// Query function to fetch video comments
async function fetchVideoComments(videoId) {
  await delay(800);

  if (Math.random() > 0.95) {
    throw new Error(`Failed to fetch comments for video ${videoId}`);
  }

  return mockComments.filter((comment) => comment.videoId === videoId);
}

// Query function to fetch related videos
async function fetchRelatedVideos(videoId, limit = 4) {
  await delay(600);

  if (Math.random() > 0.95) {
    throw new Error(`Failed to fetch related videos for ${videoId}`);
  }

  // Simple mock: return other videos (excluding current one)
  const allVideos = Object.values(mockVideoDetails);
  const relatedVideos = allVideos
    .filter((video) => video.id !== videoId)
    .slice(0, limit);

  return relatedVideos;
}

// Query function to fetch video analytics
async function fetchVideoAnalytics(videoId) {
  await delay(700);

  if (Math.random() > 0.95) {
    throw new Error(`Failed to fetch analytics for video ${videoId}`);
  }

  return {
    videoId,
    views: Math.floor(Math.random() * 10000) + 500,
    likes: Math.floor(Math.random() * 500) + 50,
    shares: Math.floor(Math.random() * 100) + 10,
    watchTime: Math.floor(Math.random() * 3600) + 300, // seconds
    completionRate: (Math.random() * 40 + 60).toFixed(1), // 60-100%
    createdAt: new Date(),
  };
}

// Query function to fetch user playlists
async function fetchUserPlaylists() {
  await delay(500);

  if (Math.random() > 0.95) {
    throw new Error("Failed to fetch playlists");
  }

  return mockPlaylistData;
}

// Query options for video details
export const videoDetailQueryOptions = (id) =>
  queryOptions({
    queryKey: ["videoDetails", id],
    queryFn: () => fetchVideoDetail(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Query options for video comments
export const videoCommentsQueryOptions = (videoId) =>
  queryOptions({
    queryKey: ["videoComments", videoId],
    queryFn: () => fetchVideoComments(videoId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

// Query options for related videos
export const relatedVideosQueryOptions = (videoId, limit = 4) =>
  queryOptions({
    queryKey: ["relatedVideos", videoId, limit],
    queryFn: () => fetchRelatedVideos(videoId, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

// Query options for video analytics
export const videoAnalyticsQueryOptions = (videoId) =>
  queryOptions({
    queryKey: ["videoAnalytics", videoId],
    queryFn: () => fetchVideoAnalytics(videoId),
    staleTime: 60 * 1000, // 1 minute
  });

// Query options for user playlists
export const userPlaylistsQueryOptions = queryOptions({
  queryKey: ["userPlaylists"],
  queryFn: fetchUserPlaylists,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutation for adding a comment
export async function addVideoComment(videoId, content, author = "Anonymous") {
  await delay(1000);

  const newComment = {
    id: `comment_${Date.now()}`,
    videoId,
    author,
    content,
    createdAt: new Date(),
    likes: 0,
    replies: [],
  };

  mockComments.push(newComment);
  return newComment;
}

// Mutation for liking a video
export async function likeVideo(videoId) {
  await delay(500);

  return {
    videoId,
    liked: true,
    likeCount: Math.floor(Math.random() * 100) + 50,
  };
}

// Mutation for sharing a video
export async function shareVideo(videoId, platform = "copy") {
  await delay(300);

  const video = mockVideoDetails[videoId];
  if (!video) {
    throw new Error(`Video ${videoId} not found`);
  }

  const shareUrl = `https://manimate.com/video/${videoId}`;

  return {
    videoId,
    platform,
    shareUrl,
    sharedAt: new Date(),
  };
}

// Mutation for downloading a video
export async function downloadVideo(videoId) {
  await delay(2000); // Simulate download preparation

  const video = mockVideoDetails[videoId];
  if (!video) {
    throw new Error(`Video ${videoId} not found`);
  }

  return {
    videoId,
    downloadUrl: video.videoUrl,
    filename: `${video.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp4`,
    fileSize: video.fileSize,
  };
}

// Mutation for adding video to playlist
export async function addToPlaylist(videoId, playlistId) {
  await delay(600);

  const playlist = mockPlaylistData.find((p) => p.id === playlistId);
  if (!playlist) {
    throw new Error(`Playlist ${playlistId} not found`);
  }

  if (!playlist.videos.includes(videoId)) {
    playlist.videos.push(videoId);
  }

  return playlist;
}
