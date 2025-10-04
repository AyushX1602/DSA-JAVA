import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Users, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="relative pt-20 lg:pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Connecting Surplus Food<br />with Those in Need
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Join our mission to reduce food waste and fight hunger through our innovative
              food redistribution platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to='/sign-in'>
                <Button size="lg" className="group">
                  Donate Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link to='/logistic'>
                <Button size="lg" className="group">
                  Become Our Logistic Partner
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Utensils className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">For Food Donors</h3>
              <p className="text-neutral-600">
                Easily list your surplus food and get matched with nearby NGOs and volunteers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">For NGOs</h3>
              <p className="text-neutral-600">
                Find and claim available food donations in your area through our smart matching system.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">For Volunteers</h3>
              <p className="text-neutral-600">
                Help transport food from donors to NGOs and earn rewards for your contributions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Together, we're making a difference in our communities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">10,000+</div>
              <div className="text-neutral-600">Meals Shared</div>
            </div>
            <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-neutral-600">Active NGOs</div>
            </div>
            <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">1,000+</div>
              <div className="text-neutral-600">Volunteers</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}