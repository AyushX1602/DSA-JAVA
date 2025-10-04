import React from 'react';

function VideoBackground({ isVisible }) {
  return (
    <div
      className={`fixed inset-0 transition-opacity duration-2000 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-white/30 z-20"></div> */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="https://neoleaf.bytetown.agency/video/intro.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

export default VideoBackground;
