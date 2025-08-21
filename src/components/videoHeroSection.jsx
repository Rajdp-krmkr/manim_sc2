import React from "react";

const VideoHeroSection = ({ children }) => {
  return (
    <div>
      <video
        autoPlay
        loop
        muted
        className="w-full h-screen object-fill absolute top-0 left-0 -z-10"
      >
        <source src="/assests/heroVid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div>{children}</div>
    </div>
  );
};

export default VideoHeroSection;
