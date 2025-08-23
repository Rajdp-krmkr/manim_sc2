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
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const handleGenerateVideo = () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt to generate your animation");
      return;
    }

    // Redirect to generation page with the prompt
    router.push(`/generate?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section id="home">
        <VideoHeroSection>
          <div className="flex flex-col justify-center items-center h-screen">
            <h2 className="font-bold text-white text-5xl mb-7">
              MathVision AI
            </h2>
            <p className="text-gray-300 mb-16 text-center px-4">
              Text to mathematical graphical video generator
            </p>

            {/* Conditional Content Based on Authentication */}
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  /* Authenticated User - Show Input Box */
                  <div className="bg-gray-900/80 relative backdrop-blur-sm text-white text-md h-36 w-full max-w-[500px] px-5 pt-4 rounded-xl border-gray-700 border-2 mx-4">
                    <textarea
                      name=""
                      id=""
                      className="bg-transparent outline-none resize-none w-full text-gray-200 placeholder:text-gray-500 selection:bg-gray-600 selection:text-white"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter your prompt here..."
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
          </div>
        </VideoHeroSection>
      </section>

      {/* Features Section */}
      <Features />

      {/* Examples Section */}
      <Examples setPrompt={setPrompt} isAuthenticated={isAuthenticated} />

      {/* About Section */}
      <About />

      {/* Footer */}
      <Footer />
    </div>
  );
}
