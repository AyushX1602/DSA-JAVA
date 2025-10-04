import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TextReveal = ({
  children,
  className = '',
  delay = 0,
  stagger = 0.1
}) => {
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    // Split text into words and wrap each in a span
    const text = element.textContent || '';
    const words = text.split(' ');

    element.innerHTML = words
      .map(word => `<span class="word-wrapper"><span class="word">${word}</span></span>`)
      .join(' ');

    const wordElements = element.querySelectorAll('.word');

    // Initial state
    gsap.set(wordElements, {
      y: 100,
      opacity: 0
    });

    // Animation
    gsap.to(wordElements, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: stagger,
      delay: delay / 1000,
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [delay, stagger]);

  return (
    <div ref={textRef} className={`text-reveal ${className}`}>
      {children}
    </div>
  );
};

export default TextReveal;
