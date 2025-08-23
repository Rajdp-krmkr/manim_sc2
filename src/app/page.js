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

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleGenerateVideo = () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt to generate your animation");
      return;
    }

    // Redirect to generation page with the prompt
    router.push(`/generate?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section id="home">
        <VideoHeroSection>
          <div className="flex flex-col justify-center items-center h-screen">
            <h2 className="font-bold text-yellow-300 text-5xl mb-7">
              MathVision AI
            </h2>
            <p className="text-yellow-500 mb-16 text-center px-4">
              Text to mathematical graphical video generator
            </p>
            <div className="bg-[#170f02ce] relative backdrop-blur-sm text-yellow-400 text-md h-36 w-full max-w-[500px] px-5 pt-4 rounded-xl border-[#402a06] border-2 mx-4">
              <textarea
                name=""
                id=""
                className="bg-transparent outline-none resize-none w-full text-[#c18e3d] placeholder:text-yellow-800 selection:bg-yellow-500 selection:text-yellow-950"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
              ></textarea>
              <div className="absolute bottom-2 right-2 flex gap-3">
                <button
                  className="bg-[#2d1d04] rounded-lg p-2 hover:bg-[#523d05] transition-all"
                  title="Generate Animation"
                  onClick={handleGenerateVideo}
                >
                  <CgMailForward className="text-2xl rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </VideoHeroSection>
      </section>

      {/* Features Section */}
      <Features />

      {/* Examples Section */}
      <Examples setPrompt={setPrompt} />

      {/* About Section */}
      <About />

      {/* Footer */}
      <Footer />
    </div>
  );
}
