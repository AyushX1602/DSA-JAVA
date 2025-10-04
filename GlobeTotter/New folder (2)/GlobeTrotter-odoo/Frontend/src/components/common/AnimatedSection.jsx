import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function AnimatedSection(props) {
  const { children, className = '', delay = 0 } = props;
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const element = sectionRef.current;

    if (element) {
      gsap.set(element, {
        opacity: 0,
        y: 50
      });

      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        delay: delay / 1000,
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play none none none'
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [delay]);

  return (
    <div
      ref={sectionRef}
      className={className}
    >
      {children}
    </div>
  );
}

export default AnimatedSection;