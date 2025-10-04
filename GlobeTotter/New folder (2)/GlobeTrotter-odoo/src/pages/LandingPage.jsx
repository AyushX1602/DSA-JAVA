import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapIcon, CalendarIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';
import TripCard from '../components/trip/TripCard';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const LandingPage = () => {
  const [publicTrips, setPublicTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicTrips();
  }, []);

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
      title: 'Multi-City Planning',
      description: 'Plan complex trips with multiple destinations and stops all in one place.'
    },
    {
      icon: CalendarIcon,
      title: 'Smart Scheduling',
      description: 'Organize activities and manage your time with our intelligent scheduling tools.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Budget Tracking',
      description: 'Keep track of expenses and stay within budget with detailed cost breakdowns.'
    },
    {
      icon: UserGroupIcon,
      title: 'Share & Discover',
      description: 'Share your trips with others and discover amazing itineraries from fellow travelers.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Plan Your Perfect
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Multi-City Adventure
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
            >
              Create detailed itineraries, manage budgets, and discover amazing destinations. 
              Your dream trip is just a few clicks away.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/signup">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  Start Planning Now
                </Button>
              </Link>
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                onClick={() => document.getElementById('trips-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Trips
              </Button>
            </motion.div>
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
            />
            <motion.div
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-32 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"
            />
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-20 left-20 w-24 h-24 bg-orange-400/20 rounded-full blur-xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Plan the Perfect Trip
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive travel planning tools help you organize every detail of your journey, 
              from budget tracking to activity scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Public Trips Section */}
      <section id="trips-section" className="py-20 bg-gray-50">
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
              {Array.isArray(publicTrips) && publicTrips.length > 0 ? (
                publicTrips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <TripCard trip={trip} showOwner />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-12">
                  <p>No public trips available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of travelers who trust GlobeTrotter to plan their perfect trips.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;