import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit,
  Save,
  X,
  Camera,
  Award,
  TrendingUp,
  Leaf,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Bell,
  Shield,
  Globe
} from 'lucide-react';
import DashboardTopbar from '../components/DashboardTopbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { userAtom, isAuthenticatedAtom } from '../store/authAtoms';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [profileData, setProfileData] = useState(null);
  const [recentPickups, setRecentPickups] = useState([]);
  const [activitySummary, setActivitySummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    currentLocation: {
      address: ''
    },
    profile: {
      dateOfBirth: '',
      gender: '',
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        language: 'en',
        timezone: 'UTC'
      }
    }
  });

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await profileAPI.getUserProfile();
        
        if (response.data && response.data.data) {
          const { user: userData, recentPickups: pickups, activitySummary: summary } = response.data.data;
          setProfileData(userData);
          setRecentPickups(pickups || []);
          setActivitySummary(summary || {});
          
          // Initialize edit form with current data
          setEditForm({
            name: userData.name || '',
            phone: userData.phone || '',
            currentLocation: {
              address: userData.currentLocation?.address || ''
            },
            profile: {
              dateOfBirth: userData.profile?.dateOfBirth ? userData.profile.dateOfBirth.split('T')[0] : '',
              gender: userData.profile?.gender || '',
              preferences: {
                notifications: {
                  email: userData.profile?.preferences?.notifications?.email ?? true,
                  sms: userData.profile?.preferences?.notifications?.sms ?? true,
                  push: userData.profile?.preferences?.notifications?.push ?? true
                },
                language: userData.profile?.preferences?.language || 'en',
                timezone: userData.profile?.preferences?.timezone || 'UTC'
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      const response = await profileAPI.updateProfile(editForm);
      
      if (response.data && response.data.data) {
        setProfileData(response.data.data.user);
        setEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Handle form changes
  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setEditForm(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle nested preference changes
  const handlePreferenceChange = (category, field, value) => {
    setEditForm(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        preferences: {
          ...prev.profile.preferences,
          [category]: {
            ...prev.profile.preferences[category],
            [field]: value
          }
        }
      }
    }));
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'en-route': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardTopbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen">
        <DashboardTopbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Profile not found</h2>
            <p className="text-gray-500">Unable to load profile data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardTopbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="relative">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-t-lg"></div>
            
            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              <div className="flex items-end -mt-16 mb-4">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profileData.profile?.avatar} />
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl font-bold">
                    {getUserInitials(profileData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                      <p className="text-gray-600 flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-2" />
                        {profileData.email}
                      </p>
                      <p className="text-gray-600 flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2" />
                        {profileData.phone}
                      </p>
                      {profileData.currentLocation?.address && (
                        <p className="text-gray-600 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-2" />
                          {profileData.currentLocation.address}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => setEditing(!editing)}
                      variant={editing ? "outline" : "default"}
                      className="flex items-center space-x-2"
                    >
                      {editing ? (
                        <>
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          <span>Edit Profile</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">
                        {profileData.statistics?.completedPickups || 0} Completed
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600">
                        {profileData.statistics?.totalPickups || 0} Total Requests
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Leaf className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">
                        {profileData.statistics?.totalWasteCollected || 0}kg Recycled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editing ? (
                    <>
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Your phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={editForm.currentLocation.address}
                          onChange={(e) => handleInputChange('address', e.target.value, 'currentLocation')}
                          placeholder="Your current address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={editForm.profile.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value, 'profile')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          value={editForm.profile.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value, 'profile')}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                      <Button onClick={handleSaveProfile} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{profileData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{profileData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <Badge variant="secondary">{profileData.role}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-medium">{formatDate(profileData.profile?.dateOfBirth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium capitalize">
                          {profileData.profile?.gender || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span className="font-medium">{formatDate(profileData.createdAt)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Account Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Status:</span>
                    <Badge variant={profileData.status === 'active' ? 'default' : 'destructive'}>
                      {profileData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email Verified:</span>
                    <Badge variant={profileData.emailVerified ? 'default' : 'secondary'}>
                      {profileData.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Phone Verified:</span>
                    <Badge variant={profileData.phoneVerified ? 'default' : 'secondary'}>
                      {profileData.phoneVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium">{formatDate(profileData.lastLogin)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentPickups.length > 0 ? (
                  <div className="space-y-4">
                    {recentPickups.map((pickup) => (
                      <motion.div
                        key={pickup._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium">Pickup Request #{pickup.pickupId}</p>
                            <p className="text-sm text-gray-600 capitalize">
                              {pickup.wasteDetails?.type} waste
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(pickup.scheduling?.requestedAt)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(pickup.status)}>
                          {pickup.status.replace('-', ' ')}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Recent Activity</h3>
                    <p className="text-gray-500">Your recent pickup requests will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Preferences */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </h3>
                  <div className="space-y-3">
                    {editing ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span>Email Notifications</span>
                          <input
                            type="checkbox"
                            checked={editForm.profile.preferences.notifications.email}
                            onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                            className="rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>SMS Notifications</span>
                          <input
                            type="checkbox"
                            checked={editForm.profile.preferences.notifications.sms}
                            onChange={(e) => handlePreferenceChange('notifications', 'sms', e.target.checked)}
                            className="rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Push Notifications</span>
                          <input
                            type="checkbox"
                            checked={editForm.profile.preferences.notifications.push}
                            onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                            className="rounded"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span>Email Notifications</span>
                          <Badge variant={profileData.profile?.preferences?.notifications?.email ? 'default' : 'secondary'}>
                            {profileData.profile?.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>SMS Notifications</span>
                          <Badge variant={profileData.profile?.preferences?.notifications?.sms ? 'default' : 'secondary'}>
                            {profileData.profile?.preferences?.notifications?.sms ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Push Notifications</span>
                          <Badge variant={profileData.profile?.preferences?.notifications?.push ? 'default' : 'secondary'}>
                            {profileData.profile?.preferences?.notifications?.push ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Language & Region */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Language & Region</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Language:</span>
                      <span className="font-medium">
                        {profileData.profile?.preferences?.language || 'English'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Timezone:</span>
                      <span className="font-medium">
                        {profileData.profile?.preferences?.timezone || 'UTC'}
                      </span>
                    </div>
                  </div>
                </div>

                {editing && (
                  <Button onClick={handleSaveProfile} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Requests</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {profileData.statistics?.totalPickups || 0}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-green-600">
                        {profileData.statistics?.completedPickups || 0}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Waste Collected</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {profileData.statistics?.totalWasteCollected || 0}
                        <span className="text-sm text-gray-500 ml-1">kg</span>
                      </p>
                    </div>
                    <Leaf className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">CO₂ Saved</p>
                      <p className="text-3xl font-bold text-green-600">
                        {profileData.statistics?.carbonFootprintSaved || 0}
                        <span className="text-sm text-gray-500 ml-1">kg</span>
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Impact Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Leaf className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Great job on helping the environment! 🌱
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your {profileData.statistics?.completedPickups || 0} completed pickup requests have contributed to a cleaner planet. 
                    Keep up the excellent work!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
