import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
//   TrendingUpIcon,
//   TrendingDownIcon,
  EyeIcon,
  CogIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import TopBar from '../components/common/TopBar';

const AdminPanelPage = () => {
  const { trips, communityPosts, hotels, user } = useApp();
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
  const [analytics, setAnalytics] = useState({});

  // Mock admin check - in real app this would come from user permissions
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@globetrotter.com';

  useEffect(() => {
    generateAnalytics();
  }, [trips, communityPosts, timeRange]);

  const generateAnalytics = () => {
    const now = new Date();
    const getDaysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const rangeMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const daysBack = rangeMap[timeRange];
    const startDate = getDaysAgo(daysBack);

    // Filter data by time range
    const recentTrips = trips.filter(trip => new Date(trip.createdAt) >= startDate);
    const recentPosts = communityPosts.filter(post => new Date(post.createdAt) >= startDate);

    // Calculate metrics
    const totalUsers = 1234; // Mock data
    const activeUsers = 856;
    const totalTrips = trips.length;
    const totalPosts = communityPosts.length;
    const totalHotels = hotels.length;

    // Trip analytics
    const tripsByStatus = {
      planning: trips.filter(t => t.status === 'planning').length,
      upcoming: trips.filter(t => t.status === 'upcoming').length,
      ongoing: trips.filter(t => t.status === 'ongoing').length,
      completed: trips.filter(t => t.status === 'completed').length
    };

    // Popular destinations
    const destinationCounts = {};
    trips.forEach(trip => {
      if (trip.destination) {
        destinationCounts[trip.destination] = (destinationCounts[trip.destination] || 0) + 1;
      }
    });
    const popularDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Post categories
    const postCategories = {};
    communityPosts.forEach(post => {
      postCategories[post.category] = (postCategories[post.category] || 0) + 1;
    });

    // Growth metrics (mock data for demonstration)
    const previousPeriodTrips = Math.floor(totalTrips * 0.85);
    const previousPeriodUsers = Math.floor(totalUsers * 0.92);
    const previousPeriodPosts = Math.floor(totalPosts * 0.78);

    const tripGrowth = ((totalTrips - previousPeriodTrips) / previousPeriodTrips * 100).toFixed(1);
    const userGrowth = ((totalUsers - previousPeriodUsers) / previousPeriodUsers * 100).toFixed(1);
    const postGrowth = ((totalPosts - previousPeriodPosts) / previousPeriodPosts * 100).toFixed(1);

    setAnalytics({
      totalUsers,
      activeUsers,
      totalTrips,
      totalPosts,
      totalHotels,
      recentTrips: recentTrips.length,
      recentPosts: recentPosts.length,
      tripsByStatus,
      popularDestinations,
      postCategories,
      growth: {
        trips: tripGrowth,
        users: userGrowth,
        posts: postGrowth
      }
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {parseFloat(change) >= 0 ? (
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-gray-500 text-sm ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Analytics and system overview</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <Button className="flex items-center space-x-2">
                <DocumentChartBarIcon className="h-5 w-5" />
                <span>Export Report</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={analytics.totalUsers?.toLocaleString()}
            change={analytics.growth?.users}
            icon={UserGroupIcon}
            color="blue"
          />
          <StatCard
            title="Total Trips"
            value={analytics.totalTrips?.toLocaleString()}
            change={analytics.growth?.trips}
            icon={MapPinIcon}
            color="green"
          />
          <StatCard
            title="Community Posts"
            value={analytics.totalPosts?.toLocaleString()}
            change={analytics.growth?.posts}
            icon={ChatBubbleLeftIcon}
            color="purple"
          />
          <StatCard
            title="Active Users"
            value={analytics.activeUsers?.toLocaleString()}
            icon={TrendingUpIcon}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trip Status Distribution */}
          <ChartCard title="Trip Status Distribution">
            <div className="space-y-4">
              {Object.entries(analytics.tripsByStatus || {}).map(([status, count]) => {
                const total = analytics.totalTrips || 1;
                const percentage = ((count / total) * 100).toFixed(1);
                const colors = {
                  planning: 'bg-blue-500',
                  upcoming: 'bg-yellow-500',
                  ongoing: 'bg-green-500',
                  completed: 'bg-gray-500'
                };
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${colors[status]}`} />
                      <span className="capitalize text-gray-700">{status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 font-medium">{count}</span>
                      <span className="text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Popular Destinations */}
          <ChartCard title="Popular Destinations">
            <div className="space-y-4">
              {analytics.popularDestinations?.map(([destination, count], index) => {
                const maxCount = analytics.popularDestinations[0]?.[1] || 1;
                const percentage = (count / maxCount) * 100;
                
                return (
                  <div key={destination} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">{destination}</span>
                      <span className="text-gray-900 font-medium">{count} trips</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-blue-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <ChartCard title="Recent Activity" className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700">New trip created</span>
                </div>
                <span className="text-gray-500 text-sm">2 minutes ago</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-700">User registration</span>
                </div>
                <span className="text-gray-500 text-sm">5 minutes ago</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-700">Community post published</span>
                </div>
                <span className="text-gray-500 text-sm">12 minutes ago</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-gray-700">Itinerary updated</span>
                </div>
                <span className="text-gray-500 text-sm">18 minutes ago</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-gray-700">Hotel booking initiated</span>
                </div>
                <span className="text-gray-500 text-sm">25 minutes ago</span>
              </div>
            </div>
          </ChartCard>

          {/* System Status */}
          <ChartCard title="System Status">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Server Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-600 text-sm">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-600 text-sm">Healthy</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">API Response</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-yellow-600 text-sm">Slow</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Storage</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-600 text-sm">67% Used</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button size="sm" variant="secondary" className="w-full">
                    <CogIcon className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full">
                    <BellIcon className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Post Categories */}
        <div className="mt-8">
          <ChartCard title="Community Post Categories">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analytics.postCategories || {}).map(([category, count]) => (
                <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{category}</p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
