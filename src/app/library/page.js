"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FiArrowLeft,
  FiPlay,
  FiDownload,
  FiShare2,
  FiTrash2,
  FiEdit3,
  FiClock,
  FiCalendar,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const LibraryPage = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  // Placeholder video data
  const placeholderVideos = [
    {
      id: 1,
      title: "Derivative of x²",
      description:
        "Animated visualization of the derivative concept using limits",
      thumbnail:
        "https://via.placeholder.com/300x200/1f2937/ffffff?text=d/dx(x²)",
      duration: "2:34",
      createdAt: "2025-08-20",
      size: "12.5 MB",
      format: "MP4",
      prompt:
        "Show the derivative of x² as the limit of the difference quotient",
    },
    {
      id: 2,
      title: "Matrix Multiplication",
      description: "2x2 matrix multiplication with geometric transformations",
      thumbnail:
        "https://via.placeholder.com/300x200/1f2937/ffffff?text=Matrix×Matrix",
      duration: "3:18",
      createdAt: "2025-08-19",
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
      duration: "4:12",
      createdAt: "2025-08-18",
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
      duration: "5:45",
      createdAt: "2025-08-17",
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
      duration: "3:56",
      createdAt: "2025-08-16",
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
      duration: "4:33",
      createdAt: "2025-08-15",
      size: "26.4 MB",
      format: "MP4",
      prompt: "Visualize complex number multiplication in the complex plane",
    },
  ];

  // Filter videos based on search and filter
  const filteredVideos = placeholderVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterBy === "recent") {
      return (
        matchesSearch && new Date(video.createdAt) > new Date("2025-08-18")
      );
    }

    return matchesSearch;
  });

  const handleVideoAction = (action, video) => {
    console.log(`${action} action for video:`, video.title);
    // In a real app, you would handle these actions properly
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            {/* Spinning loader */}
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
            {/* Inner spinning element */}
            <div
              className="absolute inset-2 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">
            Loading Your Library...
          </h3>
          <p className="text-gray-300 text-sm">
            Please wait while we verify your access
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
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-400 mb-6">
            Please sign in to access your video library.
          </p>
          <button
            onClick={() => router.push("/auth")}
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Page Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              My Manimations
            </h1>
            <p className="text-gray-400">
              Your collection of mathematical animations
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => router.push("/")}
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <FiEdit3 className="text-lg" />
              <span>Create New</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your animations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-white"
            >
              <option value="all">All Videos</option>
              <option value="recent">Recent</option>
            </select>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="text-2xl font-bold text-white">
              {placeholderVideos.length}
            </div>
            <div className="text-sm text-gray-400">Total Videos</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="text-2xl font-bold text-white">24m 18s</div>
            <div className="text-sm text-gray-400">Total Duration</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="text-2xl font-bold text-white">135.7 MB</div>
            <div className="text-sm text-gray-400">Total Size</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="text-2xl font-bold text-white">This Week</div>
            <div className="text-sm text-gray-400">Last Created</div>
          </div>
        </div>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-gray-600 transition-colors group"
              >
                {/* Video Thumbnail */}
                <div className="relative">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleVideoAction("play", video)}
                      className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <FiPlay className="text-xl" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">
                    {video.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>

                  {/* Video Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="text-xs" />
                      <span>{video.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{video.size}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVideoAction("download", video)}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded"
                        title="Download"
                      >
                        <FiDownload className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleVideoAction("share", video)}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded"
                        title="Share"
                      >
                        <FiShare2 className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleVideoAction("edit", video)}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded"
                        title="Edit"
                      >
                        <FiEdit3 className="text-sm" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleVideoAction("delete", video)}
                      className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-gray-800 rounded"
                      title="Delete"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiSearch className="text-4xl mx-auto mb-4" />
              <p>No videos found matching your search.</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {placeholderVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-6">
              <FiPlay className="text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No animations yet</h3>
              <p>Start creating your first mathematical animation!</p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Create Animation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
