import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, MapIcon } from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import Navbar from '../components/common/Navbar';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* 404 Animation */}
            <div className="mb-8">
              <motion.div
                animate={{ 
                  rotate: [0, -5, 5, 0],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-9xl font-bold text-primary-200 mb-4"
              >
                404
              </motion.div>
              
              {/* Floating Map Icon */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block"
              >
                <MapIcon className="h-16 w-16 text-primary-400 mx-auto" />
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! You've wandered off the beaten path
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              It looks like this destination doesn't exist in our travel database. 
              Don't worry, even the best explorers get lost sometimes!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="flex items-center space-x-2">
                  <HomeIcon className="h-5 w-5" />
                  <span>Back to Home</span>
                </Button>
              </Link>
              
              <Link to="/dashboard">
                <Button variant="secondary" className="flex items-center space-x-2">
                  <MapIcon className="h-5 w-5" />
                  <span>View My Trips</span>
                </Button>
              </Link>
            </div>

            {/* Fun travel quotes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <p className="text-sm text-gray-500 italic">
                "Not all those who wander are lost, but this page definitely is."
              </p>
              <p className="text-xs text-gray-400 mt-2">
                — J.R.R. Tolkien (sort of)
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-20 h-20 bg-primary-100 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-40 right-20 w-32 h-32 bg-secondary-100 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            x: [0, 60, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent-100 rounded-full opacity-20"
        />
      </div>
    </div>
  );
};

export default NotFoundPage;