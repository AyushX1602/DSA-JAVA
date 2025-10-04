import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

const AnimatedHeader = ({ onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initial state
    gsap.set('.animated-title', {
      opacity: 0,
      scale: 0.8,
      y: 20
    });

    // Animation sequence
    tl.to('.animated-title', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.5
    })
      .to('.animated-title', {
        scale: 0.4,
        y: -400,
        duration: 1.5,
        ease: 'power3.inOut',
        delay: 1.5
      })
      .call(() => {
        onAnimationComplete();
      });

    setIsVisible(true);

    return () => {
      tl.kill();
    };
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000">
      <h1 className="animated-title text-8xl md:text-12xl font-bold text-gray-100 font-anton">
        BHAGWAT SAHANE
      </h1>
    </div>
  );
};

export default AnimatedHeader;
