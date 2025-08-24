"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGeneration } from "@/context/GenerationContext";
import Navbar from "@/components/Navbar";
import {
  FiPlus,
  FiTrash2,
  FiPlay,
  FiArrowLeft,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
  FiRefreshCw,
  FiCheck,
  FiEye,
  FiMaximize2,
  FiMinimize2,
  FiX,
} from "react-icons/fi";

// Component that uses useSearchParams - needs to be wrapped in Suspense
const SceneBuilderContent = () => {
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

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreenVersion, setFullscreenVersion] = useState(null);

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

  const deleteScene = (versionId, sceneId) => {
    if (window.confirm("Are you sure you want to delete this scene?")) {
      removeScene(versionId, sceneId);
    }
  };

  // Carousel navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % scriptVersions.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + scriptVersions.length) % scriptVersions.length
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6366f1 #1f2937;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
          border-radius: 4px;
          border: 1px solid #374151;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #7c3aed 0%, #6366f1 100%);
        }
        .glass-effect {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(75, 85, 99, 0.3);
        }
        .gradient-border {
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(17, 24, 39, 0.9),
            rgba(31, 41, 55, 0.9)
          );
          border: 1px solid transparent;
        }
        .gradient-border::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 1px;
          background: linear-gradient(
            145deg,
            rgba(99, 102, 241, 0.5),
            rgba(168, 85, 247, 0.5),
            rgba(34, 197, 94, 0.5)
          );
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: xor;
        }
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradient 8s ease infinite;
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .floating {
          animation: floating 6s ease-in-out infinite;
        }
        @keyframes floating {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
      <Navbar />

      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Scene Builder
          </h1>
          <p className="text-base text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
            Create and customize your animation scenes with three different
            script variations. Build compelling mathematical visualizations step
            by step.
          </p>

          {/* Topic Input and Generation Controls */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your animation topic..."
                  className="flex-1 bg-transparent text-white placeholder:text-gray-400 border-none outline-none text-base font-medium min-h-[36px]"
                />
                {/* <button
                  onClick={startScriptGeneration}
                  disabled={!topic || isGenerating || !user?.uid}
                  className="bg-white text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <FiLoader className="animate-spin text-sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="text-sm" />
                      Generate Scripts
                    </>
                  )}
                </button> */}
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <div
              className={`w-2 h-2 rounded-full shadow-lg ${
                connectionStatus === "connected"
                  ? "bg-green-400 shadow-green-400/50"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-400 shadow-yellow-400/50 animate-pulse"
                  : "bg-red-400 shadow-red-400/50"
              }`}
            />
            <span className="text-xs text-gray-400 font-medium">
              Connection:{" "}
              <span className="text-white font-semibold">
                {connectionStatus}
              </span>
            </span>
          </div>

          {/* Generation Progress */}
          {isGenerating && generationProgress.total > 0 && (
            <div className="max-w-md mx-auto mb-6">
              <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 shadow-xl">
                <div className="flex justify-between text-sm text-gray-300 mb-3 font-medium">
                  <span>Script Generation Progress</span>
                  <span className="text-white font-bold">
                    {generationProgress.completed}/{generationProgress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-white to-gray-200 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
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
            </div>
          )}
        </div>

        {/* Carousel Layout */}
        <div className="relative w-full mb-8">
          {/* Carousel Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevSlide}
              disabled={isGenerating}
              className="bg-gray-900/90 hover:bg-gray-800/90 disabled:bg-gray-900/40 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-700/60 hover:border-gray-600/80"
            >
              <FiChevronLeft className="text-lg" />
            </button>

            <div className="flex items-center gap-2">
              {scriptVersions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isGenerating}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "bg-white shadow-lg shadow-white/50"
                      : "bg-gray-600 hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={isGenerating}
              className="bg-gray-900/90 hover:bg-gray-800/90 disabled:bg-gray-900/40 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-700/60 hover:border-gray-600/80"
            >
              <FiChevronRight className="text-lg" />
            </button>
          </div>

          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-3xl">
            <div className="flex items-stretch">
              {scriptVersions.map((version, index) => (
                <div
                  key={version.id}
                  className={`flex-shrink-0 transition-all duration-700 ease-out px-4 ${
                    currentSlide === index
                      ? "w-3/5" // 60% width for focused slide
                      : "w-1/5" // 20% width for non-focused slides
                  }`}
                  style={{
                    transform: `translateX(-${currentSlide * 20}%)`,
                  }}
                >
                  <div
                    className={`transition-all duration-500 h-full ${
                      currentSlide === index
                        ? "scale-100 opacity-100"
                        : "scale-90 opacity-60"
                    }`}
                  >
                    <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-gray-500/60 h-full min-h-[500px]">
                      {/* Version Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h2
                          className={`font-bold text-white flex items-center gap-2 ${
                            currentSlide === index
                              ? "text-xl md:text-2xl"
                              : "text-base"
                          }`}
                        >
                          {currentSlide === index
                            ? version.title
                            : version.title.split(" - ")[0]}
                          {version.isComplete && (
                            <FiCheck className="text-green-400 text-lg" />
                          )}
                        </h2>
                        <div className="flex items-center gap-2">
                          {currentSlide === index && (
                            <button
                              onClick={() =>
                                setFullscreenVersion({
                                  versionId: version.id,
                                  version: version,
                                })
                              }
                              className="bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 hover:text-white p-2 rounded-md transition-all duration-200"
                              title="View script in fullscreen"
                            >
                              <FiMaximize2 className="text-sm" />
                            </button>
                          )}
                          {version.isComplete ? (
                            <span
                              className={`bg-green-500/20 text-green-400 rounded-full border border-green-500/40 font-semibold ${
                                currentSlide === index
                                  ? "text-xs px-3 py-1.5"
                                  : "text-xs px-2 py-1"
                              }`}
                            >
                              {currentSlide === index ? "Complete" : "✓"}
                            </span>
                          ) : isGenerating ? (
                            <span
                              className={`bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/40 flex items-center gap-2 font-semibold ${
                                currentSlide === index
                                  ? "text-xs px-3 py-1.5"
                                  : "text-xs px-2 py-1"
                              }`}
                            >
                              <FiLoader className="animate-spin w-3 h-3" />
                              {currentSlide === index ? "Generating" : "..."}
                            </span>
                          ) : (
                            <span
                              className={`bg-gray-500/20 text-gray-400 rounded-full border border-gray-500/40 font-semibold ${
                                currentSlide === index
                                  ? "text-xs px-3 py-1.5"
                                  : "text-xs px-2 py-1"
                              }`}
                            >
                              {currentSlide === index ? "Waiting" : "○"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content - Only show details for focused slide */}
                      {currentSlide === index ? (
                        <>
                          {/* Received At */}
                          {version.receivedAt && (
                            <p className="text-xs text-gray-400 mb-4 font-medium">
                              Received:{" "}
                              <span className="text-gray-300">
                                {new Date(
                                  version.receivedAt
                                ).toLocaleTimeString()}
                              </span>
                            </p>
                          )}

                          {/* Scenes List */}
                          <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                            {version.scenes.map((scene) => (
                              <div
                                key={scene.id}
                                className="bg-gray-800/60 border border-gray-600/50 rounded-lg p-4 hover:bg-gray-800/80 transition-all duration-200"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-bold text-white">
                                    Scene {scene.id}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    {scene.duration && (
                                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md border border-blue-500/40 font-semibold">
                                        {scene.duration}s
                                      </span>
                                    )}
                                    {scene.sequence && (
                                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md border border-purple-500/40 font-semibold">
                                        Seq: {scene.sequence}
                                      </span>
                                    )}
                                    <button
                                      onClick={() =>
                                        deleteScene(version.id, scene.id)
                                      }
                                      disabled={isGenerating}
                                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 hover:border-red-500/60 p-1.5 rounded-md transition-all duration-200 disabled:opacity-50"
                                      title="Delete scene"
                                    >
                                      <FiX className="text-sm" />
                                    </button>
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
                                  className="w-full h-24 p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder:text-gray-400 resize-none focus:outline-none focus:border-white/60 focus:bg-gray-700/70 transition-all duration-200 text-sm leading-relaxed"
                                  disabled={isGenerating}
                                />

                                {scene.originalAnim && (
                                  <div className="mt-3">
                                    <p className="text-xs text-gray-400 mb-2 font-semibold">
                                      Original Animation Code:
                                    </p>
                                    <div className="bg-gray-900/80 border border-gray-600/40 rounded-lg p-3">
                                      <p className="text-xs text-gray-300 font-mono leading-relaxed">
                                        {scene.originalAnim}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Add Scene Button */}
                          <button
                            onClick={() => addScene(version.id)}
                            disabled={isGenerating}
                            className="w-full mt-4 bg-white/15 hover:bg-white/25 disabled:bg-gray-800/50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-gray-600/50 hover:border-gray-500/70 font-semibold text-sm shadow-lg hover:shadow-xl"
                          >
                            <FiPlus className="text-base" />
                            Add Scene
                          </button>
                        </>
                      ) : (
                        /* Preview for non-focused slides */
                        <div className="flex flex-col justify-center items-center h-full text-center py-8">
                          <div className="mb-4">
                            <span className="text-4xl text-gray-500">
                              {version.isComplete ? "📄" : "⭯"}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            {version.scenes.length} scene
                            {version.scenes.length !== 1 ? "s" : ""}
                          </p>
                          <button
                            onClick={() => goToSlide(index)}
                            className="text-white/80 hover:text-white text-sm font-medium hover:underline transition-colors"
                          >
                            Click to edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators with Labels */}
          <div className="flex justify-center items-center gap-6 mt-8">
            {scriptVersions.map((version, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentSlide === index
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50 hover:text-gray-300"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index ? "bg-white" : "bg-gray-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  {version.title.split(" - ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-12">
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
              className="bg-gray-900/90 hover:bg-gray-800/90 disabled:bg-gray-900/40 disabled:cursor-not-allowed text-gray-300 hover:text-white px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 border border-gray-700/60 hover:border-gray-600/80 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              <FiTrash2 className="text-xl" />
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
              className="bg-gray-900/90 hover:bg-gray-800/90 text-gray-300 hover:text-white px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 border border-gray-700/60 hover:border-gray-600/80 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              <FiEye className="text-xl" />
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
              className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiPlay className="text-xl" />
              Test API Response
            </button>
          </div>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-12 bg-gray-900/80 backdrop-blur-xl border border-gray-600/50 rounded-2xl p-6 max-w-4xl mx-auto shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6">
              Debug Information
            </h3>
            <div className="text-base text-gray-300 space-y-3 font-mono grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-400">Chat ID:</span>
                  <span className="text-white font-semibold">
                    {chatID || "Not set"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Connection:</span>
                  <span
                    className={`font-semibold ${
                      connectionStatus === "connected"
                        ? "text-green-400"
                        : connectionStatus === "connecting"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {connectionStatus}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Is Generating:</span>
                  <span className="text-white font-semibold">
                    {isGenerating.toString()}
                  </span>
                </p>
              </div>
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-400">Received Scripts:</span>
                  <span className="text-white font-semibold">
                    {receivedScripts.length}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">All Complete:</span>
                  <span className="text-white font-semibold">
                    {allScriptsComplete.toString()}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Progress:</span>
                  <span className="text-white font-semibold">
                    {generationProgress.completed}/{generationProgress.total}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenVersion && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-600/50">
              <h3 className="text-xl font-bold text-white">
                {fullscreenVersion.version.title} - Fullscreen View
              </h3>
              <button
                onClick={() => setFullscreenVersion(null)}
                className="bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-white p-2 rounded-lg transition-all duration-200"
              >
                <FiMinimize2 className="text-lg" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-6">
                {fullscreenVersion.version.scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className="bg-gray-800/60 border border-gray-600/50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-white">
                        Scene {scene.id}
                      </h4>
                      <div className="flex items-center gap-2">
                        {scene.duration && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md border border-blue-500/40 font-semibold">
                            {scene.duration}s
                          </span>
                        )}
                        {scene.sequence && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md border border-purple-500/40 font-semibold">
                            Seq: {scene.sequence}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            deleteScene(fullscreenVersion.version.id, scene.id)
                          }
                          disabled={isGenerating}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 hover:border-red-500/60 p-1.5 rounded-md transition-all duration-200 disabled:opacity-50"
                          title="Delete scene"
                        >
                          <FiX className="text-sm" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={scene.prompt}
                      onChange={(e) =>
                        updateScene(fullscreenVersion.version.id, scene.id, {
                          prompt: e.target.value,
                        })
                      }
                      placeholder="Enter scene description..."
                      className="w-full h-32 p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder:text-gray-400 resize-none focus:outline-none focus:border-white/60 focus:bg-gray-700/70 transition-all duration-200 text-sm leading-relaxed"
                      disabled={isGenerating}
                    />

                    {scene.originalAnim && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-2 font-semibold">
                          Original Animation Code:
                        </p>
                        <div className="bg-gray-900/80 border border-gray-600/40 rounded-lg p-3">
                          <p className="text-xs text-gray-300 font-mono leading-relaxed">
                            {scene.originalAnim}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Scene Button in Fullscreen */}
                <button
                  onClick={() => addScene(fullscreenVersion.version.id)}
                  disabled={isGenerating}
                  className="w-full bg-white/15 hover:bg-white/25 disabled:bg-gray-800/50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-gray-600/50 hover:border-gray-500/70 font-semibold text-sm shadow-lg hover:shadow-xl"
                >
                  <FiPlus className="text-base" />
                  Add Scene
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-600/50 flex justify-end gap-3">
              <button
                onClick={() => setFullscreenVersion(null)}
                className="bg-gray-700/50 hover:bg-gray-700/70 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component with Suspense wrapper
const SceneBuilderPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              Loading scene builder...
            </h3>
          </div>
        </div>
      }
    >
      <SceneBuilderContent />
    </Suspense>
  );
};

export default SceneBuilderPage;
