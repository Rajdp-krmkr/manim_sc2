"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGeneration } from "@/context/GenerationContext";
import Navbar from "@/components/Navbar";
import {
  FiPlay,
  FiArrowLeft,
  FiCheck,
  FiDownload,
  FiHeart,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";

const VideoSelectionPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { generationData } = useGeneration();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // SSE and script generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    completed: 0,
    total: 0,
    currentScript: null,
  });
  const [receivedScripts, setReceivedScripts] = useState([]);
  const [allScriptsComplete, setAllScriptsComplete] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [generationTokens, setGenerationTokens] = useState([]);
  const [chatID, setChatID] = useState(null);

  const eventSourceRef = useRef(null);
  const isComponentMountedRef = useRef(true);

  // Backend configuration
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://139.84.154.247:5001";

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

  // Auto-start script generation when component loads with generation data
  useEffect(() => {
    if (
      generationData &&
      chatID &&
      !isGenerating &&
      receivedScripts.length === 0
    ) {
      startScriptGeneration();
    }
  }, [generationData, chatID, isGenerating, receivedScripts.length]);

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
      currentScript: scriptData,
    });

    console.log(`Script ${scriptIndex}/${totalScripts} received`);
  };

  // Handle all scripts complete
  const handleAllScriptsComplete = (data) => {
    const { allScripts, allTokens } = data;

    setAllScriptsComplete(true);
    setIsGenerating(false);

    console.log("All scripts completed:", { allScripts, allTokens });

    // Convert scripts to video format for display
    convertScriptsToVideos(allScripts);
  };

  // Start script generation
  const startScriptGeneration = async () => {
    if (!generationData || !chatID || !user?.uid) {
      console.error("Missing required data for script generation");
      return;
    }

    setIsGenerating(true);
    setReceivedScripts([]);
    setAllScriptsComplete(false);
    setGenerationProgress({ completed: 0, total: 0, currentScript: null });

    try {
      const response = await fetch(`${BACKEND_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text:
            generationData.originalTopic ||
            generationData.text ||
            "Mathematical Animation",
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

  // Convert received scripts to video format
  const convertScriptsToVideos = (scripts) => {
    const generatedVideos = scripts.map((script, index) => ({
      id: index + 1,
      title: `Generated Style ${String.fromCharCode(65 + index)}`, // A, B, C
      description:
        script.scenes?.[0]?.substring(0, 100) + "..." ||
        "AI-generated mathematical animation",
      thumbnail: "/assests/heroVid.mp4", // Placeholder
      videoUrl: "/assests/heroVid.mp4", // Placeholder - would be actual generated video
      duration: "0:45", // Placeholder
      style: `Generated Style ${index + 1}`,
      script: script,
      scenes: script.scenes || [],
    }));

    setVideos(generatedVideos);
  };

  // Retry script generation
  const retryGeneration = () => {
    setReceivedScripts([]);
    setAllScriptsComplete(false);
    setGenerationProgress({ completed: 0, total: 0, currentScript: null });
    startScriptGeneration();
  };

  // Placeholder video data - will be replaced with actual generated videos
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: "Style A - Classic Animation",
      description: "Clean mathematical visualization with traditional style",
      thumbnail: "/assests/heroVid.mp4",
      videoUrl: "/assests/heroVid.mp4",
      duration: "0:45",
      style: "Classic",
    },
    {
      id: 2,
      title: "Style B - Modern Animation",
      description: "Contemporary design with smooth transitions",
      thumbnail: "/assests/heroVid.mp4",
      videoUrl: "/assests/heroVid.mp4",
      duration: "0:52",
      style: "Modern",
    },
    {
      id: 3,
      title: "Style C - Dynamic Animation",
      description: "Energetic presentation with vibrant colors",
      thumbnail: "/assests/heroVid.mp4",
      videoUrl: "/assests/heroVid.mp4",
      duration: "0:48",
      style: "Dynamic",
    },
  ]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  // Redirect if no generation data
  useEffect(() => {
    if (!generationData && !isLoading) {
      router.push("/");
    }
  }, [generationData, isLoading, router]);

  const handleSelectVideo = (videoId) => {
    setSelectedVideo(videoId);
  };

  const handleSaveVideo = async () => {
    if (!selectedVideo) {
      alert("Please select a video first");
      return;
    }

    setIsSaving(true);

    try {
      const selectedVideoData = videos.find((v) => v.id === selectedVideo);

      // Prepare comprehensive data for saving
      const saveData = {
        selectedVideo: selectedVideoData,
        generationData,
        receivedScripts,
        generationTokens,
        chatID,
        userId: user?.uid,
        timestamp: new Date().toISOString(),
        scriptCount: receivedScripts.length,
        allScriptsComplete,
      };

      console.log("Saving selected video with script data:", saveData);

      // Here you would save the selected video and script data to your backend
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to library with success
      router.push("/library?success=video-saved");
    } catch (error) {
      console.error("Error saving video:", error);
      alert("Failed to save video. Please try again.");
    } finally {
      setIsSaving(false);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/scene-builder")}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6"
          >
            <FiArrowLeft className="text-lg" />
            <span>Back to Scene Builder</span>
          </button>

          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Animation
          </h1>
          <p className="text-gray-400 mb-6">
            {isGenerating
              ? "We're generating your animations in real-time. Watch the progress below."
              : allScriptsComplete
              ? "Your animations have been generated! Select the style you prefer."
              : "We've generated different styles for your animation. Select the one you like best."}
          </p>

          {/* Topic Display */}
          {generationData && (
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Topic:</h2>
              <p className="text-gray-300 text-lg">
                {generationData.originalTopic ||
                  generationData.text ||
                  "Animation Topic"}
              </p>
            </div>
          )}

          {/* Generation Status Display */}
          {isGenerating && (
            <div className="bg-blue-900/80 backdrop-blur-sm border border-blue-700 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Generating Your Animations
                </h3>
                <div className="flex items-center space-x-2">
                  <FiLoader className="animate-spin text-blue-400" />
                  <span className="text-blue-400 text-sm">
                    {connectionStatus === "connected"
                      ? "Connected"
                      : "Connecting..."}
                  </span>
                </div>
              </div>

              {generationProgress.total > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>
                      Progress: {generationProgress.completed} of{" "}
                      {generationProgress.total} scripts
                    </span>
                    <span>
                      {Math.round(
                        (generationProgress.completed /
                          generationProgress.total) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (generationProgress.completed /
                            generationProgress.total) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {generationProgress.currentScript && (
                <div className="text-sm text-gray-300">
                  <p className="font-medium mb-1">Latest script received:</p>
                  <p className="text-xs bg-gray-800 p-2 rounded">
                    {generationProgress.currentScript.scenes?.[0]?.substring(
                      0,
                      100
                    )}
                    ...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Generation Complete Status */}
          {allScriptsComplete && !isGenerating && (
            <div className="bg-green-900/80 backdrop-blur-sm border border-green-700 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <FiCheck className="text-green-400 text-xl" />
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Generation Complete!
                  </h3>
                  <p className="text-green-300">
                    All {receivedScripts.length} animation scripts have been
                    generated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Generation Controls (for testing) */}
          {!isGenerating && receivedScripts.length === 0 && (
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Script Generation
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Start generating AI-powered animation scripts for your
                    topic.
                  </p>
                  <div className="text-xs text-gray-400 mt-2">
                    Chat ID: {chatID || "Not generated"} | Connection:{" "}
                    {connectionStatus} | Backend: {BACKEND_URL}
                  </div>
                </div>
                <button
                  onClick={startScriptGeneration}
                  disabled={!chatID || !generationData}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FiLoader className="text-sm" />
                  <span>Generate Scripts</span>
                </button>
              </div>
            </div>
          )}

          {/* Connection Error Status */}
          {connectionStatus === "error" && (
            <div className="bg-red-900/80 backdrop-blur-sm border border-red-700 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-red-400 text-xl">⚠️</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Connection Error
                    </h3>
                    <p className="text-red-300">
                      Lost connection to the generation service.
                    </p>
                  </div>
                </div>
                <button
                  onClick={retryGeneration}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FiRefreshCw className="text-sm" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`bg-gray-900/60 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                selectedVideo === video.id
                  ? "border-white ring-2 ring-white/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
              onClick={() => handleSelectVideo(video.id)}
            >
              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-800">
                <video
                  src={video.videoUrl}
                  poster={video.thumbnail}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => e.target.pause()}
                />

                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <FiPlay className="text-4xl text-white" />
                </div>

                {/* Selection Indicator */}
                {selectedVideo === video.id && (
                  <div className="absolute top-4 right-4 bg-white text-black rounded-full p-2">
                    <FiCheck className="text-lg" />
                  </div>
                )}

                {/* Duration */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {video.description}
                </p>

                {/* Show script scenes if available */}
                {video.scenes && video.scenes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Generated Scenes:
                    </p>
                    <div className="text-xs text-gray-300 bg-gray-800 p-2 rounded max-h-20 overflow-y-auto">
                      {video.scenes.slice(0, 2).map((scene, index) => (
                        <div key={index} className="mb-1">
                          {index + 1}. {scene.substring(0, 60)}...
                        </div>
                      ))}
                      {video.scenes.length > 2 && (
                        <div className="text-gray-500">
                          ...and {video.scenes.length - 2} more scenes
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                      {video.style}
                    </span>
                    {video.script && (
                      <span className="px-2 py-1 bg-green-700 text-green-300 rounded-full text-xs">
                        AI Generated
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectVideo(video.id);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      selectedVideo === video.id
                        ? "bg-white text-black"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                  >
                    {selectedVideo === video.id ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSaveVideo}
            disabled={!selectedVideo || isSaving}
            className="bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiHeart className="text-xl" />
                <span>Save Selected Video</span>
              </>
            )}
          </button>

          {selectedVideo && (
            <button
              onClick={() => {
                const video = videos.find((v) => v.id === selectedVideo);
                console.log("Download video:", video);
                // Implement download functionality
              }}
              className="bg-gray-800 text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-3"
            >
              <FiDownload className="text-xl" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSelectionPage;
