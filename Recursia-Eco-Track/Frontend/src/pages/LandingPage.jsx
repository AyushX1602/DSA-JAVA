import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Brain, 
  MapPin, 
  Shield, 
  Recycle, 
  Leaf, 
  ChevronRight,
  CheckCircle 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI Waste Recognition',
      description: 'Advanced AI technology automatically identifies waste types from uploaded images, ensuring proper categorization and disposal.'
    },
    {
      icon: MapPin,
      title: 'Real-time Tracking',
      description: 'Track your pickup requests in real-time with live updates, driver locations, and estimated arrival times.'
    },
    {
      icon: Shield,
      title: 'Complaint Deduplication',
      description: 'Smart system prevents duplicate complaints and optimizes resource allocation for maximum efficiency.'
    },
    {
      icon: Truck,
      title: 'Fraud Detection',
      description: 'Advanced algorithms detect and prevent fraudulent activities, ensuring fair and reliable service for everyone.'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-extra-bold text-gray-900 mb-6 leading-tight">
                Smart AI for{' '}
                <span className="text-primary-500 relative">
                  Smarter
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-3 bg-primary-200 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </span>{' '}
                Waste Management
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 font-semibold max-w-3xl mx-auto mb-10">
                Revolutionary AI-powered platform connecting communities, drivers, and administrators 
                for efficient, transparent, and intelligent waste management solutions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="flex items-center space-x-2 text-lg px-8 py-4"
              >
                <Recycle className="w-6 h-6" />
                <span>Get Started</span>
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              <Button
                variant="neutral"
                size="lg"
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 text-lg px-8 py-4"
              >
                <Truck className="w-6 h-6" />
                <span>Sign In</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 text-lg px-8 py-4"
              >
                <Shield className="w-6 h-6" />
                <span>Admin Login</span>
              </Button>
            </motion.div>

            {/* Eco Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="mt-16 relative"
            >
              <div className="flex items-center justify-center space-x-8 text-primary-500">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Truck className="w-16 h-16" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Recycle className="w-20 h-20" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Leaf className="w-14 h-14" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - will add this next */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extra-bold text-gray-900 mb-6"
            >
              Intelligent Features for{' '}
              <span className="text-primary-500">Smart Cities</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 font-semibold max-w-2xl mx-auto"
            >
              Cutting-edge technology powered by AI and machine learning to revolutionize 
              waste management in your community.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center group hover:border-primary-200 border border-transparent transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-300">
                        <feature.icon className="w-8 h-8 text-primary-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-extra-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 font-semibold leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Placeholder for additional sections */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extra-bold text-gray-900 mb-4">
            More sections coming soon...
          </h2>
          <p className="text-xl text-gray-600 font-semibold">
            Benefits, statistics, and footer sections will be added.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
