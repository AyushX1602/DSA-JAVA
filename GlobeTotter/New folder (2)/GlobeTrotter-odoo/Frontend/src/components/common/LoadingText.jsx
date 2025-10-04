import React, { useEffect } from 'react';
import { gsap } from 'gsap';

const LoadingText = ({ onAnimationComplete }) => {
  useEffect(() => {
    const tl = gsap.timeline();

    // Initial state
    gsap.set('.loading-text', {
      opacity: 0,
      scale: 0.8,
      y: 20
    });

    gsap.set('.loading-icon', {
      opacity: 0,
      scale: 0,
      rotation: -180
    });

    // Animation sequence
    tl.to('.loading-icon', {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 1,
      ease: 'back.out(1.7)',
      delay: 0.3
    })
      .to('.loading-text', {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1
      }, '-=0.5')
      .to(['.loading-icon', '.loading-text'], {
        scale: 0.9,
        y: -50,
        opacity: 0,
        duration: 1,
        ease: 'power3.inOut',
        delay: 2
      })
      .call(() => {
        onAnimationComplete();
      });

    return () => {
      tl.kill();
    };
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800">
      <div className="text-center text-white">
        <div className="loading-icon text-8xl mb-6">
          ✈️
        </div>
        <h1 className="loading-text text-5xl md:text-7xl font-bold mb-4 bg-white bg-clip-text text-transparent">
          GlobeTrotter
        </h1>
        <p className="loading-text text-xl md:text-2xl font-light opacity-90">
          Your Adventure Begins Here
        </p>
      </div>
    </div>
  );
};

export default LoadingText;
