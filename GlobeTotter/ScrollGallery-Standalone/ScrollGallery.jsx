import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollGallery = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const gridRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let lenis;

    // Initialize Lenis smooth scrolling (exact same as HTML)
    const initSmoothScrolling = () => {
      lenis = new Lenis({
        lerp: 0.15, // Lower values create a smoother scroll effect
        smoothWheel: true // Enables smooth scrolling for mouse wheel events
      });

      // Update ScrollTrigger each time the user scrolls
      lenis.on('scroll', () => ScrollTrigger.update());

      // Define a function to run at each animation frame
      const scrollFn = (time) => {
        lenis.raf(time); // Run Lenis' requestAnimationFrame method
        requestAnimationFrame(scrollFn); // Recursively call scrollFn on each frame
      };
      // Start the animation frame loop
      requestAnimationFrame(scrollFn);
    };

    // Function to create scroll-triggered animations (exact same as HTML)
    const scroll = () => {
      const grid = gridRef.current;
      if (!grid) return;

      const columns = [...grid.querySelectorAll('.column')];
      const items = columns.map((column, pos) => {
        return [...column.querySelectorAll('.column__item')].map(item => ({
          element: item,
          column: pos,
          wrapper: item.querySelector('.column__item-imgwrap'),
          image: item.querySelector('.column__item-img')
        }));
      });
      const mergedItems = items.flat();

      mergedItems.forEach(item => {
        gsap.to(item.wrapper, {
          ease: 'none',
          startAt: {transformOrigin: `${1.5*(window.innerWidth-item.element.getBoundingClientRect()['left'])}px 0%`},
          scrollTrigger: {
            trigger: item.element,
            start: 'clamp(top bottom)',
            end: 'clamp(bottom top)',
            scrub: true
          },
          rotation: (item.column+1)*2,
          xPercent: (item.column+1)*14,
          yPercent: (item.column)*-5
        });
      });
    };

    // Initialize everything (exact same as HTML)
    const init = () => {
      console.log('Initializing scroll animations...');
      
      setTimeout(() => {
        initSmoothScrolling();
        scroll();
        console.log('Scroll animations initialized!');
      }, 100);
    };

    init();

    // Cleanup
    return () => {
      if (lenis) {
        lenis.destroy();
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const styles = {
    container: {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      background: '#000',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
      overflowX: 'hidden',
      minHeight: '100vh'
    },
    columns: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '1rem' : '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '50px 10px 100px' : '80px 20px 150px'
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    },
    columnItem: {
      display: 'block',
      margin: 0
    },
    columnItemImgwrap: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '10px'
    },
    columnItemImg: {
      aspectRatio: '3/4',
      width: '100%',
      height: 'auto',
      display: 'block',
      cursor: 'pointer',
      transition: 'transform 0.3s ease'
    }
  };

  // Create mixed array using available img files and avtr files for missing ones
  const createImageArray = () => {
    const images = [];
    const avatarFiles = ['/images/avtr.jpeg', '/images/avtr2.jpeg', '/images/avtr3.jpeg', '/images/avtr4.jpeg'];
    let avatarIndex = 0;
    
    for (let i = 1; i <= 28; i++) {
      // Check which img files are missing and replace with avatar images
      if (i === 2 || i === 3 || i === 8 || i === 25) {
        // Use avatar image for missing img files
        images.push(avatarFiles[avatarIndex]);
        avatarIndex++;
      } else {
        // Use original img file
        images.push(`/images/img${i}.avif`);
      }
    }
    return images;
  };
  
  const allImages = createImageArray();
  
  // Distribute 28 images across 4 columns (7 images per column)
  const imageColumns = [
    allImages.slice(0, 7),   // Column 1: images 1-7
    allImages.slice(7, 14),  // Column 2: images 8-14
    allImages.slice(14, 21), // Column 3: images 15-21
    allImages.slice(21, 28)  // Column 4: images 22-28
  ];

  return (
    <div style={styles.container}>
      {/* Columns - exact same structure as HTML */}
      <div className="columns" ref={gridRef} style={styles.columns}>
        {imageColumns.map((columnImages, columnIndex) => (
          <div key={columnIndex} className="column" style={styles.column}>
            {columnImages.map((imagePath, itemIndex) => (
              <figure 
                key={`${columnIndex}-${itemIndex}`} 
                className="column__item" 
                style={styles.columnItem}
              >
                <div className="column__item-imgwrap" style={styles.columnItemImgwrap}>
                  <img 
                    className="column__item-img" 
                    style={styles.columnItemImg}
                    src={imagePath}
                    alt={`Gallery image ${columnIndex * 7 + itemIndex + 1}`}
                    loading="lazy"
                  />
                </div>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollGallery;
