"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGeneration } from "@/context/GenerationContext";
import Navbar from "@/components/Navbar";
import {
  FiPlus,
  FiTrash2,
  FiPlay,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

const SceneBuilderPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { generationData, clearGenerationData } = useGeneration();
  const [topic, setTopic] = useState("");
  const [scenes, setScenes] = useState([
    { id: 1, prompt: "" },
    { id: 2, prompt: "" },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  useEffect(() => {
    // Check if we have generation data from context
    if (generationData) {
      console.log("Generation data received in scene-builder:", generationData);

      // Use the original topic that was submitted (prioritize originalTopic, then text, then fallback)
      const topicFromData =
        generationData.originalTopic ||
        generationData.text ||
        generationData.prompt ||
        "";
      setTopic(topicFromData);

      // If the response includes scene data, populate the scenes
      if (generationData?.data?.scenes) {
        const sceneData = generationData.data.scenes;
        if (Array.isArray(sceneData)) {
          // Sort scenes by sequence number and format them
          const sortedScenes = sceneData
            .sort((a, b) => (a.seq || 0) - (b.seq || 0))
            .map((scene, index) => ({
              id: index + 1,
              prompt: scene.text || "", // Use 'text' field as the input value
              duration: scene.duration_sec,
              sequence: scene.seq,
              originalAnim: scene.anim,
            }));
          setScenes(sortedScenes);
        }
      }
    } else {
      // Fallback to URL parameters if no generation data
      const topicFromUrl = searchParams.get("topic");
      if (topicFromUrl) {
        setTopic(decodeURIComponent(topicFromUrl));
      } else {
        // If no data from context or URL, redirect to home
        router.push("/");
      }
    }
  }, [generationData, searchParams, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  // Adjust textarea heights when scenes change
  useEffect(() => {
    const adjustTextareaHeights = () => {
      // Adjust main scene textareas
      const sceneTextareas = document.querySelectorAll(
        "textarea[data-scene-textarea]"
      );
      sceneTextareas.forEach((textarea) => {
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 300) + "px";
      });

      // Adjust animation code textareas
      const animTextareas = document.querySelectorAll(
        "textarea[data-anim-textarea]"
      );
      animTextareas.forEach((textarea) => {
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
      });
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(adjustTextareaHeights, 100);
    return () => clearTimeout(timer);
  }, [scenes]);

  const addScene = () => {
    if (scenes.length < 5) {
      // Maximum 5 scenes allowed
      const newScene = {
        id: scenes.length + 1,
        prompt: "",
      };
      setScenes([...scenes, newScene]);
    }
  };

  const removeScene = (sceneId) => {
    if (scenes.length > 2) {
      // Keep minimum 2 scenes
      setScenes(scenes.filter((scene) => scene.id !== sceneId));
    }
  };

  const updateScenePrompt = (sceneId, prompt) => {
    setScenes(
      scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, prompt } : scene
      )
    );
  };

  const updateSceneAnim = (sceneId, anim) => {
    setScenes(
      scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, originalAnim: anim } : scene
      )
    );
  };

  const toggleDropdown = (sceneId) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [sceneId]: !prev[sceneId],
    }));
  };

  const handleGenerate = async () => {
    // Validate that all scenes have prompts
    const emptyScenes = scenes.filter((scene) => !scene.prompt.trim());
    if (emptyScenes.length > 0) {
      alert("Please fill in all scene prompts before generating");
      return;
    }

    setIsGenerating(true);

    try {
      // Create the output data structure
      const outputData = {
        success: true,
        message: "Request processed successfully",
        data: {
          title: topic || "Animation Title",
          scenes: scenes.map((scene) => ({
            seq: scene.sequence || scene.id,
            text: scene.prompt,
            anim: scene.originalAnim || "",
            duration_sec: scene.duration || 10,
          })),
        },
        requestInfo: {
          text: topic,
          uid: user?.uid,
          timestamp: new Date().toISOString(),
        },
        originalTopic: topic,
        text: topic,
      };

      // Console log the data
      console.log("Generated animation data:", outputData);

      // Here you would typically send the data to your backend
      console.log("Sending data to backend...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to video selection page
      router.push("/video-selection");
    } catch (error) {
      console.error("Error generating animation:", error);
      alert("Failed to generate animation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6"
          >
            <FiArrowLeft className="text-lg" />
            <span>Back to Home</span>
          </button>

          <h1 className="text-4xl font-bold text-white mb-4">Scene Builder</h1>
          <p className="text-gray-400 mb-6">
            Break down your animation into multiple scenes for better
            storytelling
          </p>

          {/* Topic Display */}
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Topic:</h2>
            <p className="text-gray-300 text-lg">
              {topic || "No topic specified"}
            </p>
          </div>
        </div>

        {/* Scenes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white">
              Animation Scenes
            </h3>
            {scenes.length < 5 ? (
              <button
                onClick={addScene}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiPlus className="text-lg" />
                <span>Add Scene</span>
              </button>
            ) : (
              <div className="text-gray-500 text-sm px-4 py-2">
                Maximum 5 scenes reached
              </div>
            )}
          </div>

          {/* Scene Inputs */}
          <div className="space-y-6">
            {scenes.map((scene, index) => (
              <div
                key={scene.id}
                className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">
                    Scene {index + 1}
                  </h4>
                  {scenes.length > 2 && (
                    <button
                      onClick={() => removeScene(scene.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  )}
                </div>

                <textarea
                  value={scene.prompt}
                  onChange={(e) => updateScenePrompt(scene.id, e.target.value)}
                  placeholder={`Describe what happens in scene ${index + 1}...`}
                  className="w-full bg-gray-800/50 text-white placeholder:text-gray-500 border border-gray-600 rounded-lg p-4 min-h-[96px] max-h-[300px] resize-y overflow-y-auto focus:outline-none focus:border-white/50 transition-colors"
                  style={{ height: "auto" }}
                  data-scene-textarea
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 300) + "px";
                  }}
                />

                {/* Advanced Settings Dropdown */}
                <div className="mt-4">
                  <button
                    onClick={() => toggleDropdown(scene.id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    <span>Advanced Settings</span>
                    {openDropdowns[scene.id] ? (
                      <FiChevronUp className="text-sm" />
                    ) : (
                      <FiChevronDown className="text-sm" />
                    )}
                  </button>

                  {openDropdowns[scene.id] && (
                    <div className="mt-3 p-4 bg-gray-800/30 border border-gray-600 rounded-lg">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Animation Code
                      </label>
                      <textarea
                        value={scene.originalAnim || ""}
                        onChange={(e) =>
                          updateSceneAnim(scene.id, e.target.value)
                        }
                        placeholder="Enter animation code..."
                        className="w-full bg-gray-700/50 text-white placeholder:text-gray-500 border border-gray-600 rounded-lg p-3 text-sm min-h-[60px] max-h-[200px] resize-y overflow-y-auto focus:outline-none focus:border-white/50 transition-colors"
                        style={{ height: "auto" }}
                        data-anim-textarea
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.min(e.target.scrollHeight, 200) + "px";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Scene Button at Bottom */}
          {scenes.length < 5 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={addScene}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 border border-gray-600 hover:border-gray-500"
              >
                <FiPlus className="text-lg" />
                <span>Add Another Scene</span>
              </button>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span>Generating Animation...</span>
              </>
            ) : (
              <>
                <FiPlay className="text-xl" />
                <span>Generate Animation</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
                <div
                  className="absolute inset-2 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                ></div>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">
                Creating Your Animation...
              </h3>
              <p className="text-gray-300 text-sm">
                This may take a few moments
              </p>
              <div className="mt-4 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneBuilderPage;
