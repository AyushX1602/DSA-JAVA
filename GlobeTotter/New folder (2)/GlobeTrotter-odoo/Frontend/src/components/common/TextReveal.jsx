import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const TextReveal = ({ children, delay = 0, stagger = 0.1, className = '' }) => {
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    // Split text into characters for stagger effect
    const text = element.innerText;
    element.innerHTML = text
      .split('')
      .map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('');

    const chars = element.querySelectorAll('.char');

    // Initial state
    gsap.set(chars, {
      opacity: 0,
      y: 50,
      rotationX: 90
    });

    // Animation
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: stagger,
      delay: delay / 1000
    });
  }, [delay, stagger]);

  return (
    <div ref={textRef} className={className}>
      {children}
    </div>
  );
};

export default TextReveal;
