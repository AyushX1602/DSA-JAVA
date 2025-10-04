import React from 'react'
import { useState } from 'react';
import LoadingText from './components/LoadingText';
import NavBar from './components/NavBar';
import VideoBackground from './components/VideoBackground';
import AnimatedSection from './components/AnimatedSection';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectCard from './components/ProjectCard';
import TextReveal from './components/TextReveal';
import MagicBento from './components/MagicBento';
import CurvedLoop from './components/CurvedLoop';
import TextPressure from './components/TextPressure';
import { gsap } from 'gsap';
gsap.registerPlugin(ScrollTrigger);


const App = () => {

  const [showMainContent, setShowMainContent] = useState(false);

  const handleAnimationComplete = () => {
    setShowMainContent(true);
    gsap.to(window, {
      scrollTo: { y: 0 },
      duration: 0
    });
  };

  // const projects = [
  //   {
  //     title: "Digital Innovation",
  //     description: "A comprehensive digital platform that transforms user experiences through innovative design and cutting-edge technology.",
  //     image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800"
  //   },
  //   {
  //     title: "Creative Solutions",
  //     description: "Brand identity and creative direction for forward-thinking companies seeking to make a lasting impact in their industry.",
  //     image: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800"
  //   },
  //   {
  //     title: "Strategic Design",
  //     description: "User-centered design approach that balances business objectives with meaningful user experiences and sustainable growth.",
  //     image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800"
  //   }
  // ];



  return (
    <div className="relative">
      {!showMainContent && <LoadingText onAnimationComplete={handleAnimationComplete} />}

      <NavBar isVisible={showMainContent} />
      <VideoBackground isVisible={showMainContent} />

      {showMainContent && (
        <section className="min-h-screen items-center justify-center px-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-20">
          <AnimatedSection className="text-center max-w-4xl mx-auto">
            <TextReveal className="text-3xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Welcome to My Portfolio
            </TextReveal>
            <TextReveal delay={800} stagger={0.05} className="text-xl md:text-2xl text-gray-700 mb-12 leading-relaxed max-w-2xl mx-auto">
              Explore my work in photography, videography, and design. Discover how I blend creativity with technology to create impactful visual stories.
            </TextReveal>
          </AnimatedSection>
        </section>
      )}

      <section className="py-32 bg-black relative z-20 rounded-tl-[64px] rounded-tr-[64px]">
        <div className=''>
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={20}
            glowColor="132, 0, 255"
          />
        </div>
        <CurvedLoop
          marqueeText="Be ✦ Creative ✦ With ✦ Camera ✦ Editing ✦ And ✦ Design✦"
          speed={3}
          curveAmount={-500}
          direction="right"
          interactive={true}
          className="custom-text-style"
        />
        <TextPressure
          text="Bhagwat Sahane!"
          flex={true}
          alpha={false}
          stroke={false}
          width={true}
          weight={true}
          italic={true}
          textColor="#ffffff"
          strokeColor="#ff0000"
          minFontSize={36}
        />

      </section>

      <section className='py-32 bg-black relative z-20'>

      </section>

    </div>
  )
}

export default App
