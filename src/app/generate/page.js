"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
} from "react-icons/fi";

const VideoGenerationPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Get the initial prompt from URL params
    const prompt = searchParams.get("prompt") || "Default math animation";
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
        content: "Generating your mathematical animation...",
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
        videoUrl: "/assests/heroVid.mp4", // Using the existing video as demo
        thumbnail: "/assests/heroVid.mp4",
      });

      setChatMessages((prev) => [
        ...prev.slice(0, -1), // Remove loading message
        {
          id: Date.now(),
          type: "assistant",
          content:
            "✅ Your mathematical animation has been successfully generated! You can preview it on the right side.",
          timestamp: new Date(),
        },
      ]);

      setIsLoading(false);
    }, 3000); // 3 second loading simulation
  }, [searchParams]);

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
    setCurrentMessage("");
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: "assistant",
        content:
          "I understand you want to modify the animation. Let me generate a new version based on your request...",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
      setIsGenerating(false);
    }, 1500);
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
  }, [videoData]);

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
            MathVision AI Assistant
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Animation Preview</h2>
            <button
              onClick={() => router.push("/")}
              className="text-gray-300 hover:text-white px-3 py-1 rounded border border-gray-700 hover:border-white transition-all text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            // Loading State
            <div className="flex-1 flex items-center justify-center bg-black">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Generating Animation
                </h3>
                <p className="text-gray-300 mb-4">
                  Creating your mathematical visualization...
                </p>
                <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-700 max-w-md">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Progress</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full w-4/5 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Video Player
            <div className="flex-1 p-4 bg-black">
              <div
                ref={videoContainerRef}
                className="bg-black rounded-lg overflow-hidden mb-4 relative group"
                onMouseEnter={() => setShowControls(true)}
              >
                <video
                  ref={videoRef}
                  className="w-full h-96 object-cover"
                  onClick={togglePlayPause}
                >
                  <source src={videoData?.videoUrl} type="video/mp4" />
                </video>

                {/* Custom Video Controls Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-300 ${
                    showControls ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {/* Top Controls */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button
                      onClick={toggleFullscreen}
                      className="bg-black/50 text-white p-2 rounded-full hover:bg-white hover:text-black transition-all"
                      title={
                        isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                      }
                    >
                      {isFullscreen ? (
                        <FiMinimize2 className="text-lg" />
                      ) : (
                        <FiMaximize2 className="text-lg" />
                      )}
                    </button>
                    <button className="bg-black/50 text-white p-2 rounded-full hover:bg-white hover:text-black transition-all">
                      <FiSettings className="text-lg" />
                    </button>
                  </div>

                  {/* Center Play Button */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={togglePlayPause}
                        className="bg-white text-black p-4 rounded-full hover:bg-gray-200 transition-all transform hover:scale-110"
                      >
                        <FiPlay className="text-3xl ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Bottom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={duration ? (currentTime / duration) * 100 : 0}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                            duration ? (currentTime / duration) * 100 : 0
                          }%, #4b5563 ${
                            duration ? (currentTime / duration) * 100 : 0
                          }%, #4b5563 100%)`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Left Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={togglePlayPause}
                          className="text-white hover:text-yellow-300 transition-colors"
                        >
                          {isPlaying ? (
                            <FiPause className="text-2xl" />
                          ) : (
                            <FiPlay className="text-2xl" />
                          )}
                        </button>

                        <button
                          onClick={() => skipTime(-10)}
                          className="text-white hover:text-yellow-300 transition-colors"
                          title="Skip back 10s"
                        >
                          <FiSkipBack className="text-xl" />
                        </button>

                        <button
                          onClick={() => skipTime(10)}
                          className="text-white hover:text-yellow-300 transition-colors"
                          title="Skip forward 10s"
                        >
                          <FiSkipForward className="text-xl" />
                        </button>

                        <button
                          onClick={toggleMute}
                          className="text-white hover:text-yellow-300 transition-colors"
                        >
                          {isMuted ? (
                            <FiVolumeX className="text-xl" />
                          ) : (
                            <FiVolume2 className="text-xl" />
                          )}
                        </button>

                        {/* Volume Slider */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                                (isMuted ? 0 : volume) * 100
                              }%, #4b5563 ${
                                (isMuted ? 0 : volume) * 100
                              }%, #4b5563 100%)`,
                            }}
                          />
                        </div>

                        <span className="text-white text-sm font-mono">
                          {formatVideoTime(currentTime)} /{" "}
                          {formatVideoTime(duration)}
                        </span>
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center space-x-2">
                        <span className="text-white text-sm">HD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Details */}
              <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {videoData?.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {videoData?.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <FiClock />
                    <span>Duration: {videoData?.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <FiFile />
                    <span>Format: {videoData?.format}</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Resolution: {videoData?.resolution}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Size: {videoData?.size}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-white text-black py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center space-x-2">
                    <FiDownload />
                    <span>Download HD</span>
                  </button>
                  <button className="flex-1 border border-white text-white py-2 px-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all">
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationPage;
