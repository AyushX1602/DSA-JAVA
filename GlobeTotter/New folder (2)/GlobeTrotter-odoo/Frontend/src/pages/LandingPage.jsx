import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapIcon, CalendarIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';
import TripCard from '../components/trip/TripCard';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import LoadingText from '../components/common/LoadingText';
import VideoBackground from '../components/common/VideoBackground';
import TextReveal from '../components/common/TextReveal';
import AnimatedSection from '../components/common/AnimatedSection';
import ScrollGallery from '../components/common/ScrollGallery';
import FlowingMenu from '../components/common/FlowingMenu';

const LandingPage = () => {
  const [publicTrips, setPublicTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);

  useEffect(() => {
    loadPublicTrips();
  }, []);

  const handleAnimationComplete = () => {
    setShowMainContent(true);
    setIsNavVisible(true);
  };

  const loadPublicTrips = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/trips/public");
      if (response.ok) {
        const trips = await response.json();
        setPublicTrips(Array.isArray(trips) ? trips : []);
      } else {
        console.error('Failed to load public trips:', response.status, response.statusText);
        setPublicTrips([]);
      }
    } catch (error) {
      console.error('Failed to load public trips:', error);
      setPublicTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: MapIcon,
      title: 'AI Route Planning',
      description: 'Intelligent algorithms optimize your multi-city journeys for maximum efficiency and experience.'
    },
    {
      icon: CalendarIcon,
      title: 'Smart Scheduling',
      description: 'Automated itinerary generation that adapts to your preferences and travel constraints.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Budget Intelligence',
      description: 'AI-powered cost prediction and real-time budget optimization across all destinations.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Insights',
      description: 'Learn from fellow travelers and share your experiences with our global community.'
    }
  ];

  const demoItems = [
    { link: '#', text: 'Discover', image: 'https://picsum.photos/600/400?random=1' },
    { link: '#', text: 'Adventure', image: 'https://picsum.photos/600/400?random=2' },
    { link: '#', text: 'Journey', image: 'https://picsum.photos/600/400?random=3' },
    { link: '#', text: 'Experience', image: 'https://picsum.photos/600/400?random=4' }
  ];

  return (
    <div className="overflow-x-hidden">
      {!showMainContent && <LoadingText onAnimationComplete={handleAnimationComplete} />}

      <Navbar isVisible={isNavVisible} />
      <VideoBackground isVisible={showMainContent} />

      {showMainContent && (
        <section className="min-h-screen flex items-end justify-start px-6 pb-32 relative z-30 max-w-full">
          <div className="w-full">
            <div className="max-w-4xl ml-8">
              <h1 className="text-sm md:text-lg lg:text-xl font-bold text-purple-600 mb-4 leading-tight tracking-tight">
                PLAN YOUR ESCAPE
              </h1>
              <h1 className="text-lg md:text-5xl text-gray-900 mb-12 leading-relaxed font-bold max-w-2xl">
                Weaving your
                <br />
                dreams into
                <br /> unforgettable adventure.
              </h1>
              <div className="mt-6">
                <Link to="/signup">
                  <button size="lg" className="bg-[#e3f536] text-black hover:bg-gray-100 px-6 py-2 text-lg rounded-full shadow-lg transition-all duration-300">
                    Start Planning
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {showMainContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="relative z-10"
        >
          {/* Black Section */}
          <section className="bg-black text-white py-20 rounded-tl-[64px] rounded-tr-[64px] shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Intelligent Travel
                  <br />
                  <span className="text-transparent bg-clip-text bg-purple-400">
                    Planning Platform
                  </span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Discover how AI-powered planning transforms complex multi-city adventures into seamless experiences
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center p-6 bg-gray-900/50 rounded-2xl backdrop-blur-sm border border-gray-800"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* ScrollGallery Section */}
              <div className="mt-16">
                <ScrollGallery />
              </div>
            </div>

            <div style={{ height: '500px', position: 'relative' }}>
              <FlowingMenu items={demoItems} />
            </div>
          </section>

          {/* White Section */}
          <section id="trips-section" className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Discover Amazing Trips
                </h2>
                <p className="text-lg text-gray-600">
                  Get inspired by itineraries shared by our community of travelers
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {publicTrips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <TripCard trip={trip} showOwner />
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && publicTrips.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <p>No public trips available at the moment.</p>
                </div>
              )}

          
            </div>
          </section>

          <Footer />
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;