import { queryOptions } from "@tanstack/react-query";

// Mock data
const mockAnimations = [
  {
    id: 1,
    title: "Derivative of x²",
    description:
      "Animated visualization of the derivative concept using limits",
    thumbnail:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=d/dx(x²)",
    duration: 154, // 2:34 in seconds
    createdAt: new Date("2025-08-20"),
    size: "12.5 MB",
    format: "MP4",
    prompt: "Show the derivative of x² as the limit of the difference quotient",
  },
  {
    id: 2,
    title: "Matrix Multiplication",
    description: "2x2 matrix multiplication with geometric transformations",
    thumbnail:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=Matrix×Matrix",
    duration: 198, // 3:18 in seconds
    createdAt: new Date("2025-08-19"),
    size: "18.2 MB",
    format: "MP4",
    prompt:
      "Demonstrate matrix multiplication with 2x2 matrices using geometric transformations",
  },
  {
    id: 3,
    title: "Unit Circle Animation",
    description: "Sine and cosine wave formation from unit circle",
    thumbnail:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=sin(θ)+cos(θ)",
    duration: 252, // 4:12 in seconds
    createdAt: new Date("2025-08-18"),
    size: "24.8 MB",
    format: "MP4",
    prompt: "Animate the unit circle showing sine and cosine wave formation",
  },
  {
    id: 4,
    title: "Fourier Transform",
    description: "Breaking down complex waves into sine components",
    thumbnail:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=Fourier+Transform",
    duration: 345, // 5:45 in seconds
    createdAt: new Date("2025-08-17"),
    size: "32.1 MB",
    format: "MP4",
    prompt:
      "Demonstrate Fourier transform by decomposing a square wave into sine components",
  },
  {
    id: 5,
    title: "Pythagorean Theorem",
    description: "Visual proof of the Pythagorean theorem",
    thumbnail:
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=a²+b²=c²",
    duration: 236, // 3:56 in seconds
    createdAt: new Date("2025-08-16"),
    size: "21.7 MB",
    format: "MP4",
    prompt:
      "Create a visual proof of the Pythagorean theorem with animated squares",
  },
  {
    id: 6,
    title: "Complex Numbers",
    description: "Multiplication in the complex plane",
    thumbnail: "https://via.placeholder.com/300x200/1f2937/ffffff?text=z₁×z₂",
    duration: 273, // 4:33 in seconds
    createdAt: new Date("2025-08-15"),
    size: "26.4 MB",
    format: "MP4",
    prompt: "Visualize complex number multiplication in the complex plane",
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Query function to fetch all animations
async function fetchAnimations() {
  // Simulate network delay
  await delay(1000);

  // Simulate occasional errors for testing
  if (Math.random() > 0.95) {
    throw new Error("Failed to fetch animations");
  }

  return mockAnimations;
}

// Query function to fetch a single animation
async function fetchAnimation(id) {
  await delay(800);

  if (Math.random() > 0.95) {
    throw new Error(`Failed to fetch animation with id ${id}`);
  }

  return mockAnimations.find((animation) => animation.id === id);
}

// Query options for all animations
export const animationsQueryOptions = queryOptions({
  queryKey: ["animations"],
  queryFn: fetchAnimations,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Query options for a single animation
export const animationQueryOptions = (id) =>
  queryOptions({
    queryKey: ["animations", id],
    queryFn: () => fetchAnimation(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Mutation for creating a new animation (mock)
export async function createAnimation(data) {
  await delay(1500);

  const newAnimation = {
    id: Math.max(...mockAnimations.map((a) => a.id)) + 1,
    title: data.title,
    description:
      data.description || "Mathematical animation created with Manimate",
    thumbnail:
      data.thumbnail ||
      "https://via.placeholder.com/300x200/1f2937/ffffff?text=New+Animation",
    duration: Math.floor(Math.random() * 200) + 60,
    createdAt: new Date(),
    size: "15.0 MB",
    format: "MP4",
    prompt: data.prompt || data.title,
  };

  mockAnimations.push(newAnimation);
  return newAnimation;
}

// Mutation for deleting an animation (mock)
export async function deleteAnimation(id) {
  await delay(1000);

  const index = mockAnimations.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error(`Animation with id ${id} not found`);
  }

  mockAnimations.splice(index, 1);
}

// Mutation for updating an animation (mock)
export async function updateAnimation(id, data) {
  await delay(1200);

  const index = mockAnimations.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error(`Animation with id ${id} not found`);
  }

  mockAnimations[index] = { ...mockAnimations[index], ...data };
  return mockAnimations[index];
}
