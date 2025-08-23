import { queryOptions } from "@tanstack/react-query";

// Mock scene templates based on different topics
const mockSceneTemplates = [
  {
    id: "calculus-derivatives",
    topic: "Calculus: Derivatives",
    scenes: [
      "Introduction to the concept of instantaneous rate of change with a car speedometer.",
      "Visual representation of secant lines approaching a tangent line on a curve.",
      "The limit definition of a derivative shown step by step.",
      "Examples of common derivative rules: power rule, product rule, chain rule.",
      "Real-world applications of derivatives in physics and economics.",
    ],
    category: "mathematics",
    difficulty: "intermediate",
  },
  {
    id: "linear-algebra",
    topic: "Linear Algebra: Matrix Transformations",
    scenes: [
      "Introduction to matrices as transformations of geometric objects.",
      "Demonstration of rotation matrices transforming a square.",
      "Scaling transformations and their matrix representations.",
      "Combining transformations through matrix multiplication.",
      "Eigenvalues and eigenvectors shown as special transformation directions.",
    ],
    category: "mathematics",
    difficulty: "advanced",
  },
  {
    id: "trigonometry",
    topic: "Trigonometry: Unit Circle",
    scenes: [
      "Setting up the unit circle with radius 1 centered at origin.",
      "Defining sine and cosine as coordinates of points on the circle.",
      "Animating the rotation and showing how sine and cosine waves form.",
      "Special angles and their exact trigonometric values.",
      "Applications in wave motion and periodic phenomena.",
    ],
    category: "mathematics",
    difficulty: "beginner",
  },
  {
    id: "fourier-analysis",
    topic: "Fourier Analysis",
    scenes: [
      "Introduction to the idea of decomposing complex signals.",
      "Building a square wave from sine wave components.",
      "The Fourier series representation with increasing terms.",
      "Frequency domain vs time domain visualization.",
      "Applications in signal processing and music analysis.",
    ],
    category: "mathematics",
    difficulty: "advanced",
  },
];

const mockSceneSuggestions = [
  {
    id: "derivative-intro",
    text: "Show how the derivative represents the slope of a tangent line",
    category: "calculus",
  },
  {
    id: "matrix-rotation",
    text: "Demonstrate how rotation matrices transform geometric shapes",
    category: "linear-algebra",
  },
  {
    id: "sine-wave",
    text: "Animate the formation of sine waves from the unit circle",
    category: "trigonometry",
  },
  {
    id: "fourier-square",
    text: "Build a square wave using Fourier series approximation",
    category: "signal-processing",
  },
  {
    id: "limit-concept",
    text: "Visualize limits approaching a point on a function",
    category: "calculus",
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Query function to fetch scene templates by topic
async function fetchSceneTemplates(topic = "") {
  await delay(800);

  if (Math.random() > 0.95) {
    throw new Error("Failed to fetch scene templates");
  }

  if (!topic) {
    return mockSceneTemplates;
  }

  return mockSceneTemplates.filter(
    (template) =>
      template.topic.toLowerCase().includes(topic.toLowerCase()) ||
      template.category.toLowerCase().includes(topic.toLowerCase())
  );
}

// Query function to fetch scene suggestions
async function fetchSceneSuggestions(category = "") {
  await delay(600);

  if (Math.random() > 0.95) {
    throw new Error("Failed to fetch scene suggestions");
  }

  if (!category) {
    return mockSceneSuggestions;
  }

  return mockSceneSuggestions.filter((suggestion) =>
    suggestion.category.toLowerCase().includes(category.toLowerCase())
  );
}

// Query function to fetch a single scene template
async function fetchSceneTemplate(id) {
  await delay(500);

  if (Math.random() > 0.95) {
    throw new Error(`Failed to fetch scene template with id ${id}`);
  }

  return mockSceneTemplates.find((template) => template.id === id);
}

// Query options for scene templates
export const sceneTemplatesQueryOptions = (topic = "") =>
  queryOptions({
    queryKey: ["sceneTemplates", topic],
    queryFn: () => fetchSceneTemplates(topic),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

// Query options for scene suggestions
export const sceneSuggestionsQueryOptions = (category = "") =>
  queryOptions({
    queryKey: ["sceneSuggestions", category],
    queryFn: () => fetchSceneSuggestions(category),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

// Query options for a single scene template
export const sceneTemplateQueryOptions = (id) =>
  queryOptions({
    queryKey: ["sceneTemplates", id],
    queryFn: () => fetchSceneTemplate(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

// Mutation for creating a custom scene (mock)
export async function createCustomScene(data) {
  await delay(1000);

  const newScene = {
    id: `custom-${Date.now()}`,
    topic: data.topic,
    scenes: data.scenes || [],
    category: data.category || "custom",
    difficulty: data.difficulty || "beginner",
    createdAt: new Date(),
  };

  return newScene;
}

// Mutation for saving scene progress
export async function saveSceneProgress(sceneId, progress) {
  await delay(800);

  return {
    sceneId,
    progress,
    savedAt: new Date(),
  };
}
