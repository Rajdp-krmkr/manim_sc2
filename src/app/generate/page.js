"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGeneration } from "@/context/GenerationContext";
import {
  FiSend,
  FiDownload,
  FiPlay,
  FiPause,
  FiMaximize2,
  FiClock,
  FiFile,
  FiVolume2,
  FiVolumeX,
  FiMinimize2,
  FiSettings,
  FiSkipBack,
  FiSkipForward,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";

const VideoGenerationPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { generationData, clearGenerationData } = useGeneration();
  const [initialPrompt, setInitialPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [streamingStatus, setStreamingStatus] = useState("idle"); // idle, initializing, ready, error
  const [serverStatus, setServerStatus] = useState("unknown"); // unknown, online, offline
  const [availableVideos, setAvailableVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoStreamUrl, setVideoStreamUrl] = useState(null);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const chatEndRef = useRef(null);

  const SERVER_URL = "http://10.50.60.177:5000"; // Updated to match your Express server port

  // Check server status
  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/health`, {
        method: "GET",
        timeout: 5000, // 5 second timeout
      });

      if (response.ok) {
        setServerStatus("online");
        return true;
      } else {
        setServerStatus("offline");
        return false;
      }
    } catch (error) {
      setServerStatus("offline");
      return false;
    }
  };

  // Video streaming functions for Express server
  const loadAvailableVideos = async () => {
    try {
      setStreamingStatus("initializing");

      const response = await fetch(`${SERVER_URL}/videos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Check if the server is running on the correct endpoint."
        );
      }

      const result = await response.json();

      if (result.success) {
        setAvailableVideos(result.videos);
        setStreamingStatus("ready");
        console.log("Available videos:", result.videos);

        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "assistant",
            content: `🎯 Found ${result.videos.length} available videos on the server! You can select one to stream.`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setStreamingStatus("error");
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "assistant",
            content: `❌ Error loading videos: ${
              result.message || "Unknown server error"
            }`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setStreamingStatus("error");
      console.error("Video Loading Error:", error);

      let errorMessage = error.message;
      if (error.message.includes("Failed to fetch")) {
        errorMessage = `Cannot connect to server at ${SERVER_URL}. Please ensure the server is running.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "assistant",
          content: `❌ Video Loading Error: ${errorMessage}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const streamVideoFromServer = (videoName) => {
    if (!videoName) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "assistant",
          content: "❌ Please specify a video name to stream.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    // Reset video state
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Set the selected video - this will trigger the video element to load the new source
    setSelectedVideo(videoName);
    const streamUrl = `${SERVER_URL}/stream/${encodeURIComponent(videoName)}`;
    setVideoStreamUrl(streamUrl);

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "assistant",
        content: `🔄 Loading "${videoName}" from server...`,
        timestamp: new Date(),
      },
    ]);

    // Log the stream URL for debugging
    console.log("Streaming video:", {
      videoName,
      streamUrl,
      serverUrl: SERVER_URL,
    });
  };

  const getVideoInfoFromServer = async (videoName) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/video-info/${encodeURIComponent(videoName)}`
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const result = await response.json();

      if (result.success) {
        console.log("Video Info:", result.video);
        return result.video;
      } else {
        throw new Error(result.message || "Failed to get video info");
      }
    } catch (error) {
      console.error("Error getting video info:", error);

      let errorMessage = error.message;
      if (error.message.includes("Failed to fetch")) {
        errorMessage = `Cannot connect to server at ${SERVER_URL}`;
      }

      return {
        error: errorMessage,
        serverUrl: SERVER_URL,
        timestamp: new Date().toISOString(),
      };
    }
  };

  useEffect(() => {
    // Check server status and load available videos
    checkServerStatus().then((isOnline) => {
      if (isOnline) {
        loadAvailableVideos();
      }
    });

    // Check if we have generation data from context
    if (generationData) {
      console.log("Generation data received:", generationData);

      // Use the original prompt/topic that was submitted
      const prompt =
        generationData.originalTopic ||
        generationData.text ||
        generationData.prompt ||
        "";
      setInitialPrompt(prompt);

      // Add initial message to chat
      setChatMessages([
        {
          id: 1,
          type: "user",
          content: prompt,
          timestamp: new Date(),
        },
        {
          id: 2,
          type: "system",
          content: "Processing your request...",
          timestamp: new Date(),
        },
      ]);

      // Simulate video generation with loader
      setTimeout(() => {
        setVideoData({
          title: "Mathematical Animation",
          description: `Animation generated from prompt: "${prompt}"`,
          duration: "0:15",
          resolution: "1920x1080",
          fps: "60 FPS",
          format: "MP4",
          size: "2.3 MB",
          videoUrl: videoStreamUrl || "/assests/heroVid.mp4", // Use stream URL if available
          thumbnail: "/assests/heroVid.mp4",
          generationResponse: generationData, // Store the actual API response
        });

        setChatMessages((prev) => [
          ...prev.slice(0, -1), // Remove loading message
          {
            id: Date.now(),
            type: "assistant",
            content:
              "✅ Your mathematical animation has been successfully generated! You can preview it on the right side. Ask me to 'list videos' to see available videos from the server.",
            timestamp: new Date(),
          },
        ]);

        setIsLoading(false);
      }, 3000); // 3 second loading simulation
    } else {
      // If no generation data, redirect back to home
      router.push("/");
    }
  }, [generationData, router, videoStreamUrl]);

  useEffect(() => {
    // Auto-scroll chat to bottom
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || isGenerating) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const messageContent = currentMessage.toLowerCase();
    setCurrentMessage("");
    setIsGenerating(true);

    // Handle video streaming commands
    if (
      messageContent.includes("list videos") ||
      messageContent.includes("show videos")
    ) {
      setTimeout(async () => {
        await loadAvailableVideos();

        if (availableVideos.length > 0) {
          const videoList = availableVideos
            .map(
              (video, index) =>
                `${index + 1}. ${video.name} (${(
                  video.size /
                  1024 /
                  1024
                ).toFixed(2)} MB)`
            )
            .join("\n");

          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "assistant",
              content: `📹 Available Videos:\n${videoList}\n\nTo stream a video, type: "stream [video-name]"`,
              timestamp: new Date(),
            },
          ]);
        } else {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "assistant",
              content: "📹 No videos found on the server.",
              timestamp: new Date(),
            },
          ]);
        }
        setIsGenerating(false);
      }, 1000);
    } else if (messageContent.includes("stream ")) {
      setTimeout(() => {
        const videoName = currentMessage.replace(/stream\s+/i, "").trim();
        if (videoName) {
          streamVideoFromServer(videoName);
        } else {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "assistant",
              content:
                "❌ Please specify a video name to stream. Example: 'stream video.mp4'",
              timestamp: new Date(),
            },
          ]);
        }
        setIsGenerating(false);
      }, 1000);
    } else if (
      messageContent.includes("video info") ||
      messageContent.includes("info")
    ) {
      setTimeout(async () => {
        let info;
        if (selectedVideo) {
          info = await getVideoInfoFromServer(selectedVideo);
        } else if (currentMessage.includes(" ")) {
          const videoName = currentMessage.split(" ").slice(-1)[0];
          info = await getVideoInfoFromServer(videoName);
        } else {
          info = { error: "No video selected or specified" };
        }

        const aiResponse = {
          id: Date.now() + 1,
          type: "assistant",
          content:
            info && !info.error
              ? `📊 Video Information:\n${JSON.stringify(info, null, 2)}`
              : `📊 Unable to retrieve video information: ${
                  info?.error || "Unknown error"
                }`,
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, aiResponse]);
        setIsGenerating(false);
      }, 1000);
    } else if (
      messageContent.includes("test video") ||
      messageContent.includes("test playback")
    ) {
      setTimeout(() => {
        if (videoRef.current && videoStreamUrl) {
          // Force reload and try to play
          videoRef.current.load();
          videoRef.current
            .play()
            .then(() => {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: Date.now() + 1,
                  type: "assistant",
                  content: "✅ Video test successful! Video is playing.",
                  timestamp: new Date(),
                },
              ]);
            })
            .catch((error) => {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: Date.now() + 1,
                  type: "assistant",
                  content: `❌ Video test failed: ${error.message}. Try clicking the video manually to start playback.`,
                  timestamp: new Date(),
                },
              ]);
            });
        } else {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "assistant",
              content:
                "❌ No video loaded. Please stream a video first using 'stream [filename]'.",
              timestamp: new Date(),
            },
          ]);
        }
        setIsGenerating(false);
      }, 1000);
    } else if (
      messageContent.includes("server status") ||
      messageContent.includes("check server")
    ) {
      setTimeout(async () => {
        const isOnline = await checkServerStatus();
        const statusMessage = isOnline
          ? "✅ Server is online and ready for video streaming!"
          : "❌ Server is offline. Please start the server and try again.";
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: "assistant",
            content: statusMessage,
            timestamp: new Date(),
          },
        ]);
        setIsGenerating(false);
      }, 1000);
    } else {
      // Default AI response for other messages
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: "assistant",
          content: `🎥 Video Streaming Commands:
• 'list videos' - Show available videos
• 'stream [filename]' - Stream a specific video
• 'test video' - Test current video playback
• 'video info [filename]' - Get video details  
• 'check server' - Check server status

📊 Current Status:
• Server: ${serverStatus}
• Selected Video: ${selectedVideo || "None"}
• Available Videos: ${availableVideos.length}
• Stream URL: ${videoStreamUrl ? "Set" : "None"}

Try streaming videos from your Express server!`,
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, aiResponse]);
        setIsGenerating(false);
      }, 1500);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      } else if (videoContainerRef.current.webkitRequestFullscreen) {
        videoContainerRef.current.webkitRequestFullscreen();
      } else if (videoContainerRef.current.msRequestFullscreen) {
        videoContainerRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatVideoTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Enhanced video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeUpdate = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeUpdate);
    };
  }, [videoData, videoStreamUrl]);

  // Fullscreen event handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeoutId;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const container = videoContainerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", () => {
        if (isPlaying) setShowControls(false);
      });
    }

    return () => {
      clearTimeout(timeoutId);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [isPlaying]);

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp);
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Chat Interface */}
      <div className="w-1/2 border-r border-gray-700 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-900 p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white mb-2">
            manimate Assistant
          </h2>
          <p className="text-gray-300 text-sm">
            Continue refining your animation with natural language
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === "user"
                    ? "bg-white text-black"
                    : message.type === "system"
                    ? "bg-gray-800 text-white border border-gray-600"
                    : "bg-gray-900/80 text-white border border-gray-700"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.type === "user"
                      ? "text-black opacity-70"
                      : "text-gray-400"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-gray-900/80 text-white border border-gray-700 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Generating...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-700 bg-black">
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Describe changes or ask questions..."
              className="flex-1 bg-gray-900/80 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-white"
              disabled={isGenerating}
            />
            <button
              onClick={handleSendMessage}
              disabled={isGenerating || !currentMessage.trim()}
              className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Video Interface */}
      <div className="w-1/2 flex flex-col">
        {/* Video Header */}
        <div className="bg-gray-900 p-4 border-b border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-white">Animation Preview</h2>
            <button
              onClick={() => router.push("/")}
              className="text-gray-300 hover:text-white px-3 py-1 rounded border border-gray-700 hover:border-white transition-all text-sm"
            >
              ← Back to Home
            </button>
          </div>

          {/* Video Streaming Controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={loadAvailableVideos}
                disabled={serverStatus === "offline"}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center space-x-1"
                title={
                  serverStatus === "offline"
                    ? "Server is offline"
                    : "Load available videos"
                }
              >
                <FiFile className="text-sm" />
                <span>Load Videos</span>
              </button>

              <button
                onClick={checkServerStatus}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-all"
                title="Check server status"
              >
                Check Server
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    console.log("Video element state:", {
                      src: videoRef.current.src,
                      currentSrc: videoRef.current.currentSrc,
                      readyState: videoRef.current.readyState,
                      networkState: videoRef.current.networkState,
                      error: videoRef.current.error,
                      duration: videoRef.current.duration,
                      paused: videoRef.current.paused,
                    });
                    setChatMessages((prev) => [
                      ...prev,
                      {
                        id: Date.now(),
                        type: "assistant",
                        content: `🔍 Video Debug Info:\n• Source: ${
                          videoRef.current.src
                        }\n• Ready State: ${
                          videoRef.current.readyState
                        }\n• Duration: ${videoRef.current.duration}\n• Error: ${
                          videoRef.current.error
                            ? videoRef.current.error.message
                            : "None"
                        }`,
                        timestamp: new Date(),
                      },
                    ]);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-all"
                title="Debug video state"
              >
                Debug Video
              </button>

              {selectedVideo && (
                <button
                  onClick={() => {
                    const downloadUrl = `${SERVER_URL}/download/${encodeURIComponent(
                      selectedVideo
                    )}`;
                    window.open(downloadUrl, "_blank");
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-all"
                  title="Download current video"
                >
                  Download
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4 text-xs">
              {/* Server Status */}
              <div className="flex items-center space-x-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    serverStatus === "online"
                      ? "bg-green-400"
                      : serverStatus === "offline"
                      ? "bg-red-400"
                      : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-gray-300">Server: {serverStatus}</span>
              </div>

              {/* Video Count */}
              <div className="flex items-center space-x-1">
                <FiFile className="text-gray-400" />
                <span className="text-gray-300">
                  Videos: {availableVideos.length}
                </span>
              </div>

              {/* Selected Video */}
              {selectedVideo && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span
                    className="text-gray-300 truncate max-w-20"
                    title={selectedVideo}
                  >
                    {selectedVideo}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Video Selection Section */}
          {availableVideos.length > 0 && (
            <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <FiFile className="text-blue-400" />
                  <span>Select Video to Stream</span>
                </h4>
                <span className="text-xs text-gray-400">
                  {availableVideos.length} video
                  {availableVideos.length !== 1 ? "s" : ""} found
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {availableVideos.map((video, index) => (
                  <button
                    key={index}
                    onClick={() => streamVideoFromServer(video.name)}
                    className={`w-full text-left p-2 rounded-md transition-all flex items-center justify-between ${
                      selectedVideo === video.name
                        ? "bg-blue-600/30 border border-blue-400 text-blue-200"
                        : "bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-gray-300 hover:text-white"
                    }`}
                    title={`Click to stream ${video.name}`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          selectedVideo === video.name
                            ? "bg-blue-400"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium truncate">
                        {video.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {(video.size / 1024 / 1024).toFixed(1)}MB
                      </span>
                      {selectedVideo === video.name && (
                        <FiWifi className="text-blue-400 text-xs" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Videos Message */}
          {availableVideos.length === 0 && serverStatus === "online" && (
            <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-600 text-center">
              <FiFile className="text-gray-400 text-2xl mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-2">
                No videos found on server
              </p>
              <p className="text-xs text-gray-500">
                Add video files to <code>backend/status-code-2/video/</code>{" "}
                directory
              </p>
            </div>
          )}
        </div>

        {/* Video Player Area */}
        <div
          ref={videoContainerRef}
          className="flex-1 bg-black relative flex flex-col items-center justify-center"
        >
          {selectedVideo && (
            <video
              ref={videoRef}
              src={`${SERVER_URL}/stream/${encodeURIComponent(selectedVideo)}`}
              controls
              className="w-full h-full"
              crossOrigin="anonymous"
              preload="metadata"
              onLoadedMetadata={() => {
                console.log("Video metadata loaded:", {
                  duration: videoRef.current?.duration,
                  videoWidth: videoRef.current?.videoWidth,
                  videoHeight: videoRef.current?.videoHeight,
                });
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => {
                console.error("Video error:", e);
                setChatMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    type: "assistant",
                    content: `❌ Error loading video: ${selectedVideo}. Check server connection.`,
                    timestamp: new Date(),
                  },
                ]);
              }}
              onCanPlay={() => {
                console.log("Video can play");
                setChatMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    type: "assistant",
                    content: `✅ Video "${selectedVideo}" is ready to play!`,
                    timestamp: new Date(),
                  },
                ]);
              }}
            />
          )}
          {!selectedVideo && (
            <div className="text-center text-gray-400">
              <FiFile className="text-6xl mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No video selected</p>
              <p className="text-sm">
                Select a video from the list above to start streaming
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationPage;
