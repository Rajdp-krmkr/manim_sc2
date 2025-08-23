import { queryOptions } from "@tanstack/react-query";

// Mock video generation options
const mockVideoOptions = [
  {
    id: 1,
    title: "Style A: Mathematical Precision",
    thumbnail:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=Precise+Math",
    description:
      "Clean, precise mathematical animations with sharp lines and clear equations",
    style: "mathematical",
    renderTime: 45,
    popularity: 92,
    features: ["LaTeX rendering", "Grid backgrounds", "Precise geometry"],
  },
  {
    id: 2,
    title: "Style B: Colorful Learning",
    thumbnail:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=Colorful+Math",
    description: "Bright, engaging animations perfect for educational content",
    style: "educational",
    renderTime: 60,
    popularity: 88,
    features: ["Vibrant colors", "Smooth transitions", "Student-friendly"],
  },
  {
    id: 3,
    title: "Style C: Research Paper",
    thumbnail:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=Research+Style",
    description: "Professional style suitable for academic presentations",
    style: "academic",
    renderTime: 35,
    popularity: 85,
    features: ["Monochrome palette", "Publication ready", "Formal layout"],
  },
  {
    id: 4,
    title: "Style D: Interactive Demo",
    thumbnail:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=Interactive",
    description: "Dynamic animations with interactive elements and highlights",
    style: "interactive",
    renderTime: 75,
    popularity: 90,
    features: ["Interactive highlights", "Step-by-step", "User engagement"],
  },
];

// Mock generation queue and status
const mockGenerationJobs = [
  {
    id: "job_1",
    videoId: "video_1",
    status: "completed",
    progress: 100,
    createdAt: new Date("2025-08-22"),
    completedAt: new Date("2025-08-22"),
    renderTime: 45,
    style: "mathematical",
  },
  {
    id: "job_2",
    videoId: "video_2",
    status: "processing",
    progress: 67,
    createdAt: new Date("2025-08-23"),
    estimatedTime: 120,
    style: "educational",
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Query function to fetch all video options
async function fetchVideoOptions() {
  await delay(1200);

  if (Math.random() > 0.95) {
    throw new Error("Failed to fetch video options");
  }

  return mockVideoOptions;
}

// Query function to fetch a single video option
async function fetchVideoOption(id) {
  await delay(800);

  if (Math.random() > 0.95) {
    throw new Error(`Failed to fetch video option with id ${id}`);
  }

  return mockVideoOptions.find((video) => video.id === id);
}

// Query function to fetch generation queue
async function fetchGenerationQueue() {
  await delay(600);

  if (Math.random() > 0.95) {
    throw new Error("Failed to fetch generation queue");
  }

  return mockGenerationJobs;
}

// Query function to fetch generation job status
async function fetchGenerationStatus(jobId) {
  await delay(400);

  if (Math.random() > 0.95) {
    throw new Error(`Failed to fetch status for job ${jobId}`);
  }

  const job = mockGenerationJobs.find((j) => j.id === jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  // Simulate progress updates for processing jobs
  if (job.status === "processing" && job.progress < 100) {
    job.progress = Math.min(job.progress + Math.floor(Math.random() * 10), 100);
    if (job.progress === 100) {
      job.status = "completed";
      job.completedAt = new Date();
    }
  }

  return job;
}

// Query options for all video options
export const videoOptionsQueryOptions = queryOptions({
  queryKey: ["videoOptions"],
  queryFn: fetchVideoOptions,
  staleTime: 10 * 60 * 1000, // 10 minutes
});

// Query options for a single video option
export const videoOptionQueryOptions = (id) =>
  queryOptions({
    queryKey: ["videoOptions", id],
    queryFn: () => fetchVideoOption(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

// Query options for generation queue
export const generationQueueQueryOptions = queryOptions({
  queryKey: ["generationQueue"],
  queryFn: fetchGenerationQueue,
  staleTime: 30 * 1000, // 30 seconds (more frequent updates)
  refetchInterval: 5000, // Poll every 5 seconds
});

// Query options for generation status
export const generationStatusQueryOptions = (jobId) =>
  queryOptions({
    queryKey: ["generationStatus", jobId],
    queryFn: () => fetchGenerationStatus(jobId),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 2000, // Poll every 2 seconds for active jobs
  });

// Function to generate a video (mock)
export async function generateVideo(optionId, sceneData = {}) {
  await delay(2000);

  const videoOption = mockVideoOptions.find((v) => v.id === optionId);
  if (!videoOption) {
    throw new Error(`Video option with id ${optionId} not found`);
  }

  const jobId = `job_${Date.now()}_${optionId}`;
  const videoId = `video_${Date.now()}_${optionId}`;

  // Add to mock queue
  const newJob = {
    id: jobId,
    videoId,
    status: "processing",
    progress: 0,
    createdAt: new Date(),
    estimatedTime: videoOption.renderTime,
    style: videoOption.style,
    sceneData,
  };

  mockGenerationJobs.push(newJob);

  return {
    jobId,
    videoId,
    status: "queued",
    estimatedTime: videoOption.renderTime,
  };
}

// Function to cancel generation
export async function cancelGeneration(jobId) {
  await delay(500);

  const jobIndex = mockGenerationJobs.findIndex((j) => j.id === jobId);
  if (jobIndex === -1) {
    throw new Error(`Job ${jobId} not found`);
  }

  const job = mockGenerationJobs[jobIndex];
  if (job.status === "completed") {
    throw new Error("Cannot cancel completed job");
  }

  job.status = "cancelled";
  job.cancelledAt = new Date();

  return job;
}

// Function to retry failed generation
export async function retryGeneration(jobId) {
  await delay(1000);

  const job = mockGenerationJobs.find((j) => j.id === jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (job.status !== "failed") {
    throw new Error("Can only retry failed jobs");
  }

  job.status = "processing";
  job.progress = 0;
  job.retryCount = (job.retryCount || 0) + 1;

  return job;
}
