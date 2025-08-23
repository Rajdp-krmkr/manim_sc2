import React from "react";

const VideoHeroSection = ({ children }) => {
  return (
    <div className="relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-screen object-cover absolute top-0 left-0 z-0 grayscale contrast-125"
        style={{
          filter: "grayscale(100%) contrast(1.2)",
          opacity: 0.6,
        }}
      >
        <source src="/assests/heroVid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default VideoHeroSection;
