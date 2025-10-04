import React, { useState, useEffect } from 'react';
import LoadingText from './LoadingText';
import Navbar from './Navbar';
import VideoBackground from './VideoBackground';
import TextReveal from './TextReveal';

const AnimatedHeader = ({ onAnimationComplete }) => {
  const [showMainContent, setShowMainContent] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);

  const handleAnimationComplete = () => {
    setShowMainContent(true);
    setIsNavVisible(true);
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  useEffect(() => {
    // Reset states when component mounts
    setShowMainContent(false);
    setIsNavVisible(false);
  }, []);

  return (
    <div className="relative min-h-screen">
      {!showMainContent && (
        <LoadingText onAnimationComplete={handleAnimationComplete} />
      )}
      
      <Navbar isVisible={isNavVisible} />
      
      <VideoBackground isVisible={showMainContent} />
      
      {showMainContent && (
        <div className="relative z-30 min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <TextReveal
              text="Welcome to GlobeTrotter"
              className="text-6xl md:text-8xl font-bold text-white mb-6"
              delay={500}
            />
            <TextReveal
              text="Discover amazing destinations and create unforgettable memories"
              className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
              delay={1500}
            />
            <div className="mt-12">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg">
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedHeader;

