import React, { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapIcon, 
  PlusIcon, 
  CalendarIcon, 
  UsersIcon, 
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';

const menuItems = [
  {
    id: 'trips',
    title: 'My Trips',
    icon: MapIcon,
    url: '/trips',
    description: 'View and manage your trips'
  },
  {
    id: 'create-trip',
    title: 'Create Trip',
    icon: PlusIcon,
    url: '/trips/new',
    description: 'Plan a new adventure'
  },
  {
    id: 'activities',
    title: 'Activities',
    icon: MagnifyingGlassIcon,
    url: '/activities',
    description: 'Discover things to do'
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: CalendarIcon,
    url: '/calendar',
    description: 'View your travel schedule'
  },
  {
    id: 'community',
    title: 'Community',
    icon: UsersIcon,
    url: '/community',
    description: 'Connect with travelers'
  },
  {
    id: 'budget',
    title: 'Budget Tracker',
    icon: CurrencyDollarIcon,
    url: '/budget',
    description: 'Track your expenses'
  },
  {
    id: 'analytics',
    title: 'Travel Analytics',
    icon: ChartBarIcon,
    url: '/analytics',
    description: 'Your travel insights'
  }
];

const Sidebar = () => {
  const { user } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = useCallback((path) => currentPath === path, [currentPath]);

  // Don't show sidebar on landing page or auth pages
  const hideOnPaths = ['/', '/login', '/signup'];
  if (hideOnPaths.includes(currentPath)) {
    return null;
  }

  const sidebarVariants = {
    collapsed: { width: 64 },
    expanded: { width: 256 }
  };

  const itemVariants = {
    collapsed: { opacity: 0, x: -10 },
    expanded: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      className="fixed left-0 top-0 h-screen z-30 bg-white/95 backdrop-blur-md border-r border-gray-200 shadow-lg flex flex-col"
      variants={sidebarVariants}
      animate={isHovered ? "expanded" : "collapsed"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col h-full"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 mt-16">
            <motion.div
              variants={itemVariants}
              initial="collapsed"
              animate="expanded"
              transition={{ delay: 0.15 }}
              className="flex items-center space-x-3"
            >
              <img 
                src="/vite.svg" 
                alt="GlobeTrotter Logo" 
                className="w-8 h-8"
              />
              <div>
                <h3 className="font-semibold text-gray-800">Navigation</h3>
                <p className="text-xs text-gray-600">Travel dashboard</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-4 overflow-y-auto">
            <nav className="space-y-1">
              {menuItems.map((item, index) => {
                const isItemActive = isActive(item.url);
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={item.title}
                    variants={itemVariants}
                    initial="collapsed"
                    animate="expanded"
                    transition={{ delay: 0.1 + index * 0.02 }}
                  >
                    <NavLink
                      to={item.url}
                      className={({ isActive: navIsActive }) =>
                        `flex items-center space-x-3 h-11 px-3 rounded-lg transition-all duration-200 group ${
                          navIsActive
                            ? "bg-purple-50 text-purple-700 shadow-sm border-r-2 border-purple-500"
                            : "hover:bg-gray-50 text-gray-600 hover:text-gray-800"
                        }`
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <div className="text-left">
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500 opacity-75">
                          {item.description}
                        </div>
                      </div>
                    </NavLink>
                  </motion.div>
                );
              })}

              {/* Admin Section */}
              {user?.email === 'admin@globetrotter.com' && (
                <motion.div
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                  transition={{ delay: 0.1 + menuItems.length * 0.02 }}
                  className="pt-4 border-t border-gray-200 mt-4"
                >
                  <NavLink
                    to="/admin"
                    className={({ isActive: navIsActive }) =>
                      `flex items-center space-x-3 h-11 px-3 rounded-lg transition-all duration-200 group ${
                        navIsActive
                          ? "bg-red-50 text-red-700 shadow-sm border-r-2 border-red-500"
                          : "hover:bg-gray-50 text-gray-600 hover:text-gray-800"
                      }`
                    }
                  >
                    <Cog6ToothIcon className="h-5 w-5 shrink-0" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Admin Panel</div>
                      <div className="text-xs text-gray-500 opacity-75">
                        System management
                      </div>
                    </div>
                  </NavLink>
                </motion.div>
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <motion.div
              variants={itemVariants}
              initial="collapsed"
              animate="expanded"
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3"
            >
              <div className="flex items-center space-x-2 mb-2">
                <BellIcon className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-800">Pro Tips</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Create detailed itineraries for better trip planning
              </p>
              <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs py-2 rounded-md hover:shadow-lg transition-all duration-200 font-medium">
                Learn More
              </button>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="pt-20 px-3 flex flex-col h-full">
          <nav className="flex flex-col space-y-2 flex-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-center"
                  title={`${item.title} - ${item.description}`}
                >
                  <NavLink
                    to={item.url}
                    className={({ isActive: navIsActive }) =>
                      `flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                        navIsActive
                          ? "bg-purple-100 text-purple-700 shadow-sm"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                  </NavLink>
                </motion.div>
              );
            })}

            {/* Admin icon in collapsed mode */}
            {user?.email === 'admin@globetrotter.com' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: menuItems.length * 0.05 }}
                className="flex justify-center pt-2 border-t border-gray-200"
                title="Admin Panel - System management"
              >
                <NavLink
                  to="/admin"
                  className={({ isActive: navIsActive }) =>
                    `flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                      navIsActive
                        ? "bg-red-100 text-red-700 shadow-sm"
                        : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                    }`
                  }
                >
                  <Cog6ToothIcon className="h-5 w-5 shrink-0" />
                </NavLink>
              </motion.div>
            )}
          </nav>

          {/* Collapsed Footer */}
          <div className="pb-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <button
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                title="Travel Tips & Insights"
              >
                <BellIcon className="h-4 w-4 text-white" />
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;