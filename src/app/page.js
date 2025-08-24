"use client";
import VideoHeroSection from "@/components/videoHeroSection";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import Examples from "@/components/Examples";
import About from "@/components/About";
import Footer from "@/components/Footer";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CgMailForward } from "react-icons/cg";
import {
  FiTrendingUp,
  FiSquare,
  FiCircle,
  FiGrid,
  FiActivity,
  FiZap,
  FiStar,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useGeneration } from "@/context/GenerationContext";
import Link from "next/link";
import VideoGenerationPage from "./generate/page";

export function generateChatId() {
  // Generate a unique chat ID using timestamp + random string
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `chat_${timestamp}_${randomString}`;
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const {
    setGenerationResponse,
    setIsLoadingGenerationData,
    isLoadingGenerationData,
  } = useGeneration();

  const handleGenerateVideo = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic to generate your animation");
      return;
    }
    console.log(user?.uid);

    setIsLoadingGenerationData(true);

    try {
      const api =
        process.env.NEXT_PUBLIC_BACKEND_URL || `http://139.84.154.247:5001`;
      const res = await fetch(`${api}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: topic,
          uid: user?.uid,
          chatID: generateChatId(),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseData = await res.json();
      console.log("API Response:", responseData);

      // Check if the response indicates success
      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to generate video");
      }

      // Safe access to scenes data with fallback
      const scenesData =
        responseData?.data?.scenes || responseData?.scenes || [];
      console.log("Scenes data:", scenesData);

      // Store the response in context along with the original topic
      setGenerationResponse({
        ...responseData,
        originalTopic: topic, // Ensure we preserve the user's input
        text: topic, // Also ensure text field has the topic
      });

      // Navigate to scene-builder page
      router.push("/scene-builder");
    } catch (error) {
      console.error("Error generating video:", error);
      alert(
        `Failed to submit your request: ${error.message}. Please try again.`
      );
    } finally {
      setIsLoadingGenerationData(false);
    }
  };
  // return <VideoGenerationPage />;
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}

      <section id="home">
        <VideoHeroSection>
          <div
            className={`flex flex-col justify-center items-center ${
              isAuthenticated ? "h-screen pt-16" : "h-screen"
            }`}
          >
            <h2 className="font-bold text-white text-5xl mb-7">manimate</h2>
            <p className="text-gray-300 mb-16 text-center px-4">
              Text to mathematical graphical video generator
            </p>

            {/* Conditional Content Based on Authentication */}
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  /* Authenticated User - Show Input Box and Example Topics */
                  <div className="w-full max-w-[500px] mx-4">
                    {/* Input Box */}
                    <div className="bg-gray-900/80 relative backdrop-blur-sm text-white text-md h-36 w-full px-5 pt-4 rounded-xl border-gray-700 border-2 mb-6">
                      <textarea
                        name=""
                        id=""
                        className="bg-transparent outline-none resize-none w-full text-gray-200 placeholder:text-gray-500 selection:bg-gray-600 selection:text-white"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter your topic here..."
                      ></textarea>
                      <div className="absolute bottom-2 right-2 flex gap-3">
                        <button
                          className="bg-white text-black rounded-lg p-2 hover:bg-gray-200 transition-all"
                          title="Generate Animation"
                          onClick={handleGenerateVideo}
                        >
                          <CgMailForward className="text-2xl rotate-180" />
                        </button>
                      </div>
                    </div>

                    {/* Example Topics */}
                    <div className="w-full">
                      <h3 className="text-white text-sm font-semibold mb-4 text-center flex items-center justify-center space-x-2">
                        <FiStar className="text-lg" />
                        <span>Try these examples:</span>
                      </h3>
                      <div className="flex flex-row flex-wrap gap-2 justify-center">
                        <button
                          onClick={() =>
                            setTopic(
                              "Visualize the derivative of x² using limits"
                            )
                          }
                          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/80 px-3 py-2 rounded-lg transition-all text-sm flex items-center space-x-2"
                        >
                          <FiTrendingUp className="text-base" />
                          <span>Derivative of x²</span>
                        </button>
                        <button
                          onClick={() =>
                            setTopic(
                              "Animate the Pythagorean theorem with moving squares"
                            )
                          }
                          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/80 px-3 py-2 rounded-lg transition-all text-sm flex items-center space-x-2"
                        >
                          <FiSquare className="text-base" />
                          <span>Pythagorean Theorem</span>
                        </button>
                        <button
                          onClick={() =>
                            setTopic(
                              "Show sine and cosine waves forming from unit circle"
                            )
                          }
                          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/80 px-3 py-2 rounded-lg transition-all text-sm flex items-center space-x-2"
                        >
                          <FiCircle className="text-base" />
                          <span>Unit Circle</span>
                        </button>
                        <button
                          onClick={() =>
                            setTopic(
                              "Demonstrate matrix multiplication with 2x2 matrices"
                            )
                          }
                          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/80 px-3 py-2 rounded-lg transition-all text-sm flex items-center space-x-2"
                        >
                          <FiGrid className="text-base" />
                          <span>Matrix Multiplication</span>
                        </button>
                        <button
                          onClick={() =>
                            setTopic(
                              "Visualize Fourier transform decomposing a square wave"
                            )
                          }
                          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/80 px-3 py-2 rounded-lg transition-all text-sm flex items-center space-x-2"
                        >
                          <FiActivity className="text-base" />
                          <span>Fourier Transform</span>
                        </button>
                        <button
                          onClick={() =>
                            setTopic(
                              "Animate complex number multiplication in complex plane"
                            )
                          }
                          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/80 px-3 py-2 rounded-lg transition-all text-sm flex items-center space-x-2"
                        >
                          <FiZap className="text-base" />
                          <span>Complex Numbers</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Non-Authenticated User - Show Sign-in Prompt */
                  <div className="text-center max-w-lg mx-4">
                    <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
                      <p className="text-gray-300 mb-6 text-lg">
                        Sign in to generate Math animations
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                          href="/auth"
                          className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Sign In / Sign Up
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-400">Loading...</p>
              </div>
            )}

            {/* Generation Loading Overlay */}
            {isLoadingGenerationData && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-6"></div>
                  <h3 className="text-white text-xl font-semibold mb-2">
                    Generating your animation...
                  </h3>
                  <p className="text-gray-400">This might take a few moments</p>
                </div>
              </div>
            )}
          </div>
        </VideoHeroSection>
      </section>

      {/* Show these sections only for non-authenticated users */}
      {!isAuthenticated && (
        <>
          {/* Features Section */}
          <Features />

          {/* Examples Section */}
          <Examples setTopic={setTopic} isAuthenticated={isAuthenticated} />

          {/* About Section */}
          <About />

          {/* Footer */}
          <Footer />
        </>
      )}
    </div>
  );
}
