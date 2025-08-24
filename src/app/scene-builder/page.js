"use client";
import React, { useState, useEffect, useRef } from "react";
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
  FiLoader,
  FiRefreshCw,
  FiCheck,
  FiEye,
} from "react-icons/fi";

const SceneBuilderPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { generationData, clearGenerationData } = useGeneration();
  const [topic, setTopic] = useState("");

  // State for 3 different script versions
  const [scriptVersions, setScriptVersions] = useState([
    {
      id: 1,
      title: "Version A",
      scenes: [
        { id: 1, prompt: "" },
        { id: 2, prompt: "" },
      ],
      isComplete: false,
      receivedAt: null,
    },
    {
      id: 2,
      title: "Version B",
      scenes: [
        { id: 1, prompt: "" },
        { id: 2, prompt: "" },
      ],
      isComplete: false,
      receivedAt: null,
    },
    {
      id: 3,
      title: "Version C",
      scenes: [
        { id: 1, prompt: "" },
        { id: 2, prompt: "" },
      ],
      isComplete: false,
      receivedAt: null,
    },
  ]);

  // SSE and generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [receivedScripts, setReceivedScripts] = useState([]);
  const [allScriptsComplete, setAllScriptsComplete] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    completed: 0,
    total: 0,
  });
  const [chatID, setChatID] = useState(null);
  const [generationTokens, setGenerationTokens] = useState([]);

  // Refs
  const eventSourceRef = useRef(null);
  const isComponentMountedRef = useRef(true);

  // Backend configuration
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

  // Utility functions for scriptVersions
  const updateScene = (versionId, sceneId, updates) => {
    setScriptVersions((prev) =>
      prev.map((version) => {
        if (version.id === versionId) {
          return {
            ...version,
            scenes: version.scenes.map((scene) =>
              scene.id === sceneId ? { ...scene, ...updates } : scene
            ),
          };
        }
        return version;
      })
    );
  };

  const addScene = (versionId) => {
    setScriptVersions((prev) =>
      prev.map((version) => {
        if (version.id === versionId) {
          const newScene = {
            id: version.scenes.length + 1,
            prompt: "",
            duration: 5,
            sequence: version.scenes.length + 1,
          };
          return {
            ...version,
            scenes: [...version.scenes, newScene],
          };
        }
        return version;
      })
    );
  };

  const removeScene = (versionId, sceneId) => {
    setScriptVersions((prev) =>
      prev.map((version) => {
        if (version.id === versionId && version.scenes.length > 1) {
          return {
            ...version,
            scenes: version.scenes.filter((scene) => scene.id !== sceneId),
          };
        }
        return version;
      })
    );
  };

  // Generate unique chat ID
  useEffect(() => {
    if (user?.uid && !chatID) {
      const newChatID = `chat_${user.uid}_${Date.now()}`;
      setChatID(newChatID);
    }
  }, [user?.uid, chatID]);

  // Initialize SSE connection when chatID is available
  useEffect(() => {
    if (chatID && !eventSourceRef.current) {
      connectToSSE(chatID);
    }

    return () => {
      disconnectSSE();
    };
  }, [chatID]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      disconnectSSE();
    };
  }, []);

  // Connect to SSE
  const connectToSSE = (chatID) => {
    try {
      const eventSource = new EventSource(`${BACKEND_URL}/events/${chatID}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE Connection opened");
        setConnectionStatus("connected");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleSSEMessage(data);
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        setConnectionStatus("error");

        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (isComponentMountedRef.current) {
            disconnectSSE();
            connectToSSE(chatID);
          }
        }, 5000);
      };
    } catch (error) {
      console.error("Error connecting to SSE:", error);
      setConnectionStatus("error");
    }
  };

  // Disconnect SSE
  const disconnectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnectionStatus("disconnected");
    }
  };

  // Handle SSE messages
  const handleSSEMessage = (data) => {
    console.log("Received SSE message:", data);

    switch (data.type) {
      case "connected":
        console.log("SSE Connected:", data.message);
        break;

      case "script_ready":
        handleScriptReady(data);
        break;

      case "all_scripts_complete":
        handleAllScriptsComplete(data);
        break;

      default:
        console.log("Unknown SSE message type:", data.type);
    }
  };

  // Handle individual script ready
  const handleScriptReady = (data) => {
    const { data: scriptData, readyToken, scriptIndex, totalScripts } = data;

    setReceivedScripts((prev) => {
      const newScripts = [...prev];
      newScripts[scriptIndex - 1] = {
        script: scriptData,
        token: readyToken,
        index: scriptIndex,
        receivedAt: new Date().toISOString(),
      };
      return newScripts;
    });

    setGenerationProgress({
      completed: scriptIndex,
      total: totalScripts,
    });

    // Update the corresponding script version
    if (scriptIndex <= 3) {
      setScriptVersions((prev) =>
        prev.map((version) => {
          if (version.id === scriptIndex) {
            const scenes = scriptData.scenes
              ? scriptData.scenes.map((scene, index) => ({
                  id: index + 1,
                  prompt: scene.text || scene,
                  duration: scene.duration_sec,
                  sequence: scene.seq,
                  originalAnim: scene.anim,
                }))
              : [
                  { id: 1, prompt: "" },
                  { id: 2, prompt: "" },
                ];

            return {
              ...version,
              scenes,
              isComplete: true,
              receivedAt: new Date().toISOString(),
              scriptData,
            };
          }
          return version;
        })
      );
    }

    console.log(
      `Script ${scriptIndex}/${totalScripts} received and applied to Version ${scriptIndex}`
    );
  };

  // Handle all scripts complete
  const handleAllScriptsComplete = (data) => {
    const { allScripts, allTokens, scripts } = data;

    // Use scripts array if available (new format), otherwise fall back to allScripts
    const scriptsData = scripts || allScripts || [];

    setAllScriptsComplete(true);
    setIsGenerating(false);

    console.log("All scripts completed:", { scriptsData, allTokens });

    // Update all script versions with the received scripts data
    if (scriptsData && Array.isArray(scriptsData)) {
      setScriptVersions((prev) =>
        prev.map((version, index) => {
          if (index < scriptsData.length) {
            const scriptData = scriptsData[index];
            const scenes = scriptData.scenes
              ? scriptData.scenes.map((scene, sceneIndex) => ({
                  id: sceneIndex + 1,
                  prompt: scene.text || scene,
                  duration: scene.duration_sec || 5,
                  sequence: scene.seq,
                  originalAnim: scene.anim,
                }))
              : [
                  { id: 1, prompt: "" },
                  { id: 2, prompt: "" },
                ];

            return {
              ...version,
              scenes,
              isComplete: true,
              receivedAt: new Date().toISOString(),
              scriptData,
              title: `Version ${String.fromCharCode(65 + index)} - ${
                scriptData.title || version.title
              }`,
            };
          }
          return version;
        })
      );

      // Update other states
      setReceivedScripts(scriptsData);
      setGenerationProgress({
        completed: scriptsData.length,
        total: scriptsData.length,
      });

      console.log(
        `All ${scriptsData.length} scripts received and applied to versions`
      );
    }
  };

  // Start script generation
  const startScriptGeneration = async () => {
    if (!topic || !chatID || !user?.uid) {
      console.error("Missing required data for script generation");
      return;
    }

    setIsGenerating(true);
    setReceivedScripts([]);
    setAllScriptsComplete(false);
    setGenerationProgress({ completed: 0, total: 0 });

    // Reset script versions
    setScriptVersions((prev) =>
      prev.map((version) => ({
        ...version,
        isComplete: false,
        receivedAt: null,
        scenes: [
          { id: 1, prompt: "" },
          { id: 2, prompt: "" },
        ],
      }))
    );

    try {
      const response = await fetch(`${BACKEND_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: topic,
          uid: user.uid,
          chatID: chatID,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Script generation started:", result);
        setGenerationTokens(result.tokens || []);
        setGenerationProgress((prev) => ({
          ...prev,
          total: result.tokens?.length || 3,
        }));
      } else {
        throw new Error(result.message || "Failed to start script generation");
      }
    } catch (error) {
      console.error("Error starting script generation:", error);
      setIsGenerating(false);
      alert("Failed to start script generation. Please try again.");
    }
  };

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

      // Handle both old format (data.scenes) and new format (scripts array)
      let scriptsToProcess = [];

      if (generationData?.scripts && Array.isArray(generationData.scripts)) {
        // New format: scripts array
        scriptsToProcess = generationData.scripts;
      } else if (generationData?.data?.scenes) {
        // Old format: single data.scenes
        scriptsToProcess = [
          { scenes: generationData.data.scenes, title: "Generated Script" },
        ];
      }

      if (scriptsToProcess.length > 0) {
        // Populate script versions with the received scripts
        setScriptVersions((prev) =>
          prev.map((version, versionIndex) => {
            if (versionIndex < scriptsToProcess.length) {
              const scriptData = scriptsToProcess[versionIndex];
              const scenes = scriptData.scenes
                ? scriptData.scenes
                    .sort((a, b) => (a.seq || 0) - (b.seq || 0))
                    .map((scene, index) => ({
                      id: index + 1,
                      prompt: scene.text || "", // Use 'text' field as the input value
                      duration: scene.duration_sec || 5,
                      sequence: scene.seq,
                      originalAnim: scene.anim,
                    }))
                : [
                    { id: 1, prompt: "" },
                    { id: 2, prompt: "" },
                  ];

              return {
                ...version,
                scenes,
                isComplete: true,
                receivedAt: new Date().toISOString(),
                title: `Version ${String.fromCharCode(65 + versionIndex)} - ${
                  scriptData.title || version.title
                }`,
                scriptData,
              };
            }
            return version;
          })
        );

        console.log(
          `Populated ${scriptsToProcess.length} script versions with scenes`
        );
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
  }, [scriptVersions]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Scene Builder</h1>
          <p className="text-xl text-gray-300 mb-6">
            Create and customize your animation scenes
          </p>

          {/* Topic Input and Generation Controls */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your animation topic..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={startScriptGeneration}
                disabled={!topic || isGenerating || !user?.uid}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FiRefreshCw />
                    Generate Scripts
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex justify-center items-center gap-2 mb-4">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-300">
              Connection: {connectionStatus}
            </span>
          </div>

          {/* Generation Progress */}
          {isGenerating && generationProgress.total > 0 && (
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Script Generation Progress</span>
                <span>
                  {generationProgress.completed}/{generationProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (generationProgress.completed /
                        generationProgress.total) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {scriptVersions.map((version) => (
            <div
              key={version.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              {/* Version Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {version.title}
                  {version.isComplete && <FiCheck className="text-green-500" />}
                </h2>
                <div className="flex items-center gap-2">
                  {version.isComplete ? (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                      Complete
                    </span>
                  ) : isGenerating ? (
                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                      <FiLoader className="animate-spin w-3 h-3" />
                      Generating
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded-full">
                      Waiting
                    </span>
                  )}
                </div>
              </div>

              {/* Received At */}
              {version.receivedAt && (
                <p className="text-xs text-gray-400 mb-4">
                  Received: {new Date(version.receivedAt).toLocaleTimeString()}
                </p>
              )}

              {/* Scenes List */}
              <div className="space-y-4">
                {version.scenes.map((scene) => (
                  <div key={scene.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        Scene {scene.id}
                      </h3>
                      <div className="flex items-center gap-2">
                        {scene.duration && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            {scene.duration}s
                          </span>
                        )}
                        {scene.sequence && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                            Seq: {scene.sequence}
                          </span>
                        )}
                      </div>
                    </div>

                    <textarea
                      value={scene.prompt}
                      onChange={(e) =>
                        updateScene(version.id, scene.id, {
                          prompt: e.target.value,
                        })
                      }
                      placeholder="Enter scene description..."
                      className="w-full h-24 p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isGenerating}
                    />

                    {scene.originalAnim && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400">
                          Original Animation:
                        </p>
                        <p className="text-sm text-gray-300 bg-gray-600 p-2 rounded mt-1">
                          {scene.originalAnim}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Scene Button */}
              <button
                onClick={() => addScene(version.id)}
                disabled={isGenerating}
                className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <FiPlus />
                Add Scene
              </button>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="text-center mt-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                setScriptVersions((prev) =>
                  prev.map((version) => ({
                    ...version,
                    scenes: [
                      { id: 1, prompt: "" },
                      { id: 2, prompt: "" },
                    ],
                    isComplete: false,
                    receivedAt: null,
                  }))
                );
                setReceivedScripts([]);
                setAllScriptsComplete(false);
              }}
              disabled={isGenerating}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiTrash2 />
              Clear All
            </button>

            <button
              onClick={() => {
                const allScenes = scriptVersions.flatMap((version) =>
                  version.scenes.filter((scene) => scene.prompt.trim())
                );
                console.log("All scenes:", allScenes);
                alert(`Total scenes across all versions: ${allScenes.length}`);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiEye />
              Preview All
            </button>

            {/* Test Button for Simulating API Response */}
            <button
              onClick={() => {
                const mockApiResponse = {
                  success: true,
                  message: "All scripts generated successfully",
                  scripts: [
                    {
                      scenes: [
                        {
                          anim: "A square wave is shown on the screen.  The waveform is simple, showing a clear on/off pattern.",
                          seq: 1,
                          text: "Let's start with a simple square wave. Notice its sharp transitions between high and low states.",
                        },
                        {
                          anim: "The square wave is gradually decomposed into multiple sine waves of different frequencies and amplitudes.  The sine waves are shown overlaid, with their sum approaching the square wave.",
                          seq: 2,
                          text: "Now, we will visualize the Fourier Transform decomposing this square wave.  The Fourier transform reveals that a square wave is actually composed of many sine waves.",
                        },
                        {
                          anim: "Individual sine waves with specific frequencies and amplitudes are highlighted. The first sine wave (fundamental frequency) is the most prominent. Subsequent sine waves have odd multiples of the fundamental frequency, with decreasing amplitudes.",
                          seq: 3,
                          text: "Notice the fundamental frequency, the primary component. Then, observe the higher-order harmonics, odd multiples of the fundamental, contributing to the square wave's shape.",
                        },
                      ],
                      title:
                        "Visualizing Fourier Transform: Decomposing a Square Wave",
                    },
                    {
                      scenes: [
                        {
                          anim: "A square wave is shown on the screen. Its sharp edges and flat top are highlighted.",
                          seq: 1,
                          text: "Let's begin by looking at a square wave. Notice its distinct characteristics: flat tops and sharp transitions.",
                        },
                        {
                          anim: "The square wave is decomposed into its constituent sine waves. The fundamental frequency sine wave is shown first, followed by the addition of higher-order odd harmonics (3rd, 5th, 7th, etc.).  Each added harmonic refines the approximation of the square wave.",
                          seq: 2,
                          text: "The magic of Fourier Transform is its ability to decompose complex waveforms into simpler sine waves. We will visualize this process by adding sine waves of different frequencies and amplitudes.",
                        },
                      ],
                      title: "Alternative Fourier Transform Visualization",
                    },
                    {
                      scenes: [
                        {
                          anim: "A square wave is shown on the screen.  Its sharp edges and flat top and bottom are highlighted.",
                          seq: 1,
                          text: "Let's begin by looking at a square wave. Notice its distinct characteristics: the abrupt transitions and constant amplitude levels.",
                        },
                        {
                          anim: "The square wave is then decomposed into its constituent sine waves. The fundamental frequency sine wave is shown first, then the third harmonic, the fifth harmonic and so on, with each successive harmonic having a smaller amplitude.",
                          seq: 2,
                          text: "Now, we'll visualize the Fourier Transform at work.  A square wave, seemingly simple, is actually composed of an infinite series of sine waves. We'll show you how it works with several of the most important components.",
                        },
                      ],
                      title: "Third Fourier Transform Perspective",
                    },
                  ],
                  tokens: ["76a21c63", "fda904ea", "790cb145"],
                  chatID: "test_chat_123",
                };

                console.log("Testing with mock API response:", mockApiResponse);
                handleAllScriptsComplete(mockApiResponse);
              }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiPlay />
              Test API Response
            </button>
          </div>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Debug Info</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Chat ID: {chatID}</p>
              <p>Connection Status: {connectionStatus}</p>
              <p>Is Generating: {isGenerating.toString()}</p>
              <p>Received Scripts: {receivedScripts.length}</p>
              <p>All Scripts Complete: {allScriptsComplete.toString()}</p>
              <p>
                Generation Progress: {generationProgress.completed}/
                {generationProgress.total}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneBuilderPage;
