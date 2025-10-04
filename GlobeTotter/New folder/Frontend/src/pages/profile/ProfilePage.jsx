import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  PencilIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  CameraIcon,
  StarIcon,
  TrophyIcon,
  HeartIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Navbar from '../../components/common/Navbar';

const ProfilePage = () => {
  const { user, trips, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user || {});
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = () => {
    updateUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user || {});
    setIsEditing(false);
  };

  const getUserStats = () => {
    const userTrips = trips.filter(trip => trip.userId === user?.id);
    const completedTrips = userTrips.filter(trip => trip.status === 'completed');
    const upcomingTrips = userTrips.filter(trip => trip.status === 'upcoming');
    const ongoingTrips = userTrips.filter(trip => trip.status === 'ongoing');
    
    const countries = [...new Set(userTrips.map(trip => trip.destination?.split(',')[1]?.trim()).filter(Boolean))];
    
    return {
      totalTrips: userTrips.length,
      completedTrips: completedTrips.length,
      upcomingTrips: upcomingTrips.length,
      ongoingTrips: ongoingTrips.length,
      countriesVisited: countries.length,
      userTrips
    };
  };

  const stats = getUserStats();

  const tabs = [
    { id: 'profile', name: 'Profile Info', icon: UserIcon },
    { id: 'trips', name: 'My Trips', icon: MapPinIcon },
    { id: 'achievements', name: 'Achievements', icon: TrophyIcon },
    { id: 'preferences', name: 'Preferences', icon: StarIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32" />
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white overflow-hidden shadow-lg">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-12 w-12 text-gray-600" />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors">
                  <CameraIcon className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1 mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User Name'}</h1>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Member since {new Date(user?.joinDate || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.totalTrips}</p>
            <p className="text-gray-600 text-sm">Total Trips</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.completedTrips}</p>
            <p className="text-gray-600 text-sm">Completed</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.upcomingTrips}</p>
            <p className="text-gray-600 text-sm">Upcoming</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.countriesVisited}</p>
            <p className="text-gray-600 text-sm">Countries</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.ongoingTrips}</p>
            <p className="text-gray-600 text-sm">Ongoing</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <ProfileInfoTab
                user={user}
                editedUser={editedUser}
                setEditedUser={setEditedUser}
                isEditing={isEditing}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}
            
            {activeTab === 'trips' && (
              <TripsTab trips={stats.userTrips} />
            )}
            
            {activeTab === 'achievements' && (
              <AchievementsTab stats={stats} />
            )}
            
            {activeTab === 'preferences' && (
              <PreferencesTab user={user} />
            )}
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editedUser.firstName || ''}
                      onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editedUser.lastName || ''}
                      onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedUser.email || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editedUser.phone || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={editedUser.country || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={editedUser.bio || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="secondary" onClick={handleCancel}>
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Profile Info Tab Component
const ProfileInfoTab = ({ user, editedUser, setEditedUser, isEditing, onSave, onCancel }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <p className="text-gray-900">{user?.firstName || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <p className="text-gray-900">{user?.lastName || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <p className="text-gray-900">{user?.email || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <p className="text-gray-900">{user?.country || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
          <p className="text-gray-900">{new Date(user?.joinDate || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
    
    {user?.bio && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <p className="text-gray-900">{user.bio}</p>
      </div>
    )}
  </div>
);

// Trips Tab Component
const TripsTab = ({ trips }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">My Trips</h3>
      <Link to="/trips/create">
        <Button size="sm">Plan New Trip</Button>
      </Link>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <motion.div
          key={trip.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-gray-900 truncate">{trip.name}</h4>
            <span className={`px-2 py-1 text-xs rounded-full ${
              trip.status === 'completed' ? 'bg-green-100 text-green-800' :
              trip.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
              trip.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {trip.status}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-2 flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {trip.destination}
          </p>
          
          <p className="text-gray-600 text-sm mb-4 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </p>
          
          <Link to={`/trips/${trip.id}`}>
            <Button size="sm" variant="secondary" className="w-full">
              <EyeIcon className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </motion.div>
      ))}
      
      {trips.length === 0 && (
        <div className="col-span-full text-center py-12">
          <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
          <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
          <Link to="/trips/create">
            <Button>Plan Your First Trip</Button>
          </Link>
        </div>
      )}
    </div>
  </div>
);

// Achievements Tab Component
const AchievementsTab = ({ stats }) => {
  const achievements = [
    {
      id: 'first-trip',
      name: 'First Steps',
      description: 'Complete your first trip',
      icon: '🚀',
      unlocked: stats.completedTrips > 0,
      progress: Math.min(stats.completedTrips, 1),
      max: 1
    },
    {
      id: 'explorer',
      name: 'Explorer',
      description: 'Visit 5 different countries',
      icon: '🌍',
      unlocked: stats.countriesVisited >= 5,
      progress: stats.countriesVisited,
      max: 5
    },
    {
      id: 'frequent-traveler',
      name: 'Frequent Traveler',
      description: 'Complete 10 trips',
      icon: '✈️',
      unlocked: stats.completedTrips >= 10,
      progress: stats.completedTrips,
      max: 10
    },
    {
      id: 'globe-trotter',
      name: 'Globe Trotter',
      description: 'Visit 20 different countries',
      icon: '🏆',
      unlocked: stats.countriesVisited >= 20,
      progress: stats.countriesVisited,
      max: 20
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-lg p-6 transition-all ${
              achievement.unlocked 
                ? 'border-yellow-300 bg-yellow-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                  {achievement.unlocked && (
                    <TrophyIcon className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">{achievement.description}</p>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {achievement.progress} / {achievement.max}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        achievement.unlocked ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(achievement.progress / achievement.max) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Preferences Tab Component
const PreferencesTab = ({ user }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Travel Preferences</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Trip Types</label>
        <div className="space-y-2">
          {['Adventure', 'Beach', 'Cultural', 'Business', 'Family', 'Solo'].map((type) => (
            <label key={type} className="flex items-center">
              <input type="checkbox" className="rounded text-blue-600" defaultChecked={Math.random() > 0.5} />
              <span className="ml-2 text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Budget Range</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>$500 - $1,000</option>
          <option>$1,000 - $2,500</option>
          <option>$2,500 - $5,000</option>
          <option>$5,000+</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Season</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Spring</option>
          <option>Summer</option>
          <option>Fall</option>
          <option>Winter</option>
          <option>No Preference</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Accommodation Type</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Hotels</option>
          <option>Hostels</option>
          <option>Vacation Rentals</option>
          <option>Resorts</option>
          <option>Mixed</option>
        </select>
      </div>
    </div>
    
    <div className="pt-6 border-t border-gray-200">
      <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>
      <div className="space-y-3">
        <label className="flex items-center">
          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
          <span className="ml-2 text-gray-700">Email notifications for trip updates</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" className="rounded text-blue-600" defaultChecked />
          <span className="ml-2 text-gray-700">Weather alerts for upcoming trips</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" className="rounded text-blue-600" />
          <span className="ml-2 text-gray-700">Marketing emails and promotions</span>
        </label>
      </div>
    </div>
    
    <div className="pt-6">
      <Button>Save Preferences</Button>
    </div>
  </div>
);

export default ProfilePage;