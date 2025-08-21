import VideoHeroSection from "@/components/videoHeroSection";
import React from "react";

export default function Home() {
  return (
    <section>
      <VideoHeroSection>
        <div className="flex justify-center items-center h-screen">
          <h2 className="font-bold text-yellow-300 text-5xl">Manim</h2>
        </div>
      </VideoHeroSection>
    </section>
  );
}
