import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Truck, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Filter,
  Search,
  MoreVertical,
  Eye,
  UserCheck,
  Settings,
  Bell,
  Activity,
  Navigation
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import DashboardTopbar from '../components/DashboardTopbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import Sidebar from '../components/Sidebar';
import { userAtom, isAuthenticatedAtom } from '../store/authAtoms';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState('overview');
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [wasteTypeData, setWasteTypeData] = useState([]);
  const [allPickups, setAllPickups] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Jotai atoms
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await adminAPI.getAnalytics('7d');
      if (response.data && response.data.analytics) {
        // Transform data for charts
        const analytics = response.data.analytics;
        if (analytics.dailyStats) {
          setAnalyticsData(analytics.dailyStats.map(day => ({
            name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
            pickups: day.pickups,
            completed: Math.floor(day.pickups * 0.9) // Assuming 90% completion rate
          })));
        }
        
        if (analytics.wasteTypeBreakdown) {
          const colors = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6'];
          setWasteTypeData(Object.entries(analytics.wasteTypeBreakdown).map(([type, data], index) => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: data.percentage || 0,
            color: colors[index % colors.length]
          })));
        }
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    }
  }, [isAuthenticated]);

  // Load all pickups
  const loadAllPickups = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await adminAPI.getAllPickups(1, 50);
      if (response.data && response.data.pickups) {
        setAllPickups(response.data.pickups);
      }
    } catch (error) {
      console.error('Error loading pickups:', error);
      toast.error('Failed to load pickups data');
    }
  }, [isAuthenticated]);

  // Load all drivers
  const loadAllDrivers = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await adminAPI.getAllDrivers();
      if (response.data && response.data.drivers) {
        setAllDrivers(response.data.drivers);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast.error('Failed to load drivers data');
    }
  }, [isAuthenticated]);

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadAnalytics(),
        loadAllPickups(),
        loadAllDrivers()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, [loadAnalytics, loadAllPickups, loadAllDrivers]);

  // Mock pickup requests data
  const pickupRequests = [
    {
      id: 1,
      user: 'Sarah Johnson',
      address: '123 Oak Street, Manhattan',
      wasteType: 'Organic Waste',
      status: 'requested',
      priority: 'normal',
      requestTime: '2025-09-20 10:30',
      driverId: null,
      driverName: null,
      aiConfidence: 92
    },
    {
      id: 2,
      user: 'Mike Wilson',
      address: '456 Pine Avenue, Brooklyn',
      wasteType: 'Recyclable Plastic',
      status: 'assigned',
      priority: 'high',
      requestTime: '2025-09-20 09:15',
      driverId: 'D001',
      driverName: 'John Smith',
      aiConfidence: 88,
      eta: { minutes: 12, text: '12 min', method: 'mapbox_directions' }
    },
    {
      id: 3,
      user: 'Emily Chen',
      address: '789 Elm Road, Queens',
      wasteType: 'Electronic Waste',
      status: 'in-progress',
      priority: 'urgent',
      requestTime: '2025-09-20 11:45',
      driverId: 'D002',
      driverName: 'Sarah Davis',
      aiConfidence: 95,
      eta: { minutes: 15, text: '15 min', method: 'mapbox_directions' }
    },
    {
      id: 4,
      user: 'David Brown',
      address: '321 Maple Street, Bronx',
      wasteType: 'General Waste',
      status: 'completed',
      priority: 'normal',
      requestTime: '2025-09-20 08:00',
      driverId: 'D003',
      driverName: 'Mike Johnson',
      aiConfidence: 76,
      eta: null
    }
  ];

  // Mock driver data
  const drivers = [
    {
      id: 'D001',
      name: 'John Smith',
      status: 'active',
      currentLocation: 'Manhattan',
      assignedPickups: 3,
      completedToday: 8,
      rating: 4.8,
      phone: '+1 (555) 123-4567'
    },
    {
      id: 'D002',
      name: 'Sarah Davis',
      status: 'active',
      currentLocation: 'Queens',
      assignedPickups: 2,
      completedToday: 6,
      rating: 4.9,
      phone: '+1 (555) 987-6543'
    },
    {
      id: 'D003',
      name: 'Mike Johnson',
      status: 'break',
      currentLocation: 'Brooklyn',
      assignedPickups: 1,
      completedToday: 5,
      rating: 4.7,
      phone: '+1 (555) 456-7890'
    }
  ];

  // Mock alerts
  const alerts = [
    {
      id: 1,
      type: 'fraud',
      title: 'Potential Fraud Detected',
      description: 'Multiple requests from same IP in short timeframe',
      severity: 'high',
      time: '5 mins ago'
    },
    {
      id: 2,
      type: 'surge',
      title: 'High Demand Area',
      description: 'Surge in requests detected in Manhattan',
      severity: 'medium',
      time: '15 mins ago'
    },
    {
      id: 3,
      type: 'duplicate',
      title: 'Duplicate Complaints',
      description: '3 similar complaints merged automatically',
      severity: 'low',
      time: '1 hour ago'
    }
  ];

  // Sidebar navigation
  const sidebarItems = [
    { path: '/admin', icon: BarChart3, label: 'Overview' },
    { path: '/admin/pickups', icon: Clock, label: 'Pickup Requests' },
    { path: '/admin/drivers', icon: Truck, label: 'Driver Management' },
    { path: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/admin/alerts', icon: AlertTriangle, label: 'Alerts', badge: alerts.length },
    { path: '/admin/map', icon: MapPin, label: 'Live Map' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const filteredPickups = filterStatus === 'all' ? pickupRequests : 
    pickupRequests.filter(pickup => pickup.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'requested': return 'neutral';
      case 'assigned': return 'default';
      case 'in-progress': return 'default';
      case 'completed': return 'default';
      default: return 'neutral';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'default';
      case 'high': return 'default';
      case 'normal': return 'neutral';
      default: return 'neutral';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'default';
      case 'medium': return 'default';
      case 'low': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Dashboard Topbar */}
      <DashboardTopbar />
      
      {/* Sidebar */}
      <Sidebar items={sidebarItems} className="w-64 h-screen fixed left-0 top-16 z-50" />
      
      {/* Main Content - Full Width with sidebar offset */}
      <div className="pt-16 pl-16">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extra-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 font-semibold">
                System overview and management panel
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="neutral"
                className="flex items-center space-x-2"
              >
                <Bell className="w-5 h-5" />
                <span>Alerts</span>
                <Badge variant="default">{alerts.length}</Badge>
              </Button>
              
              <Button className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Live Monitor</span>
              </Button>
            </div>
          </div>

          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="text-center pt-6">
                <div className="text-3xl font-extra-bold text-primary-500 mb-2">
                  {pickupRequests.length}
                </div>
                <div className="text-sm font-bold text-gray-600">Total Pickups Today</div>
                <div className="text-xs text-green-600 font-semibold mt-1">
                  +12% from yesterday
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center pt-6">
                <div className="text-3xl font-extra-bold text-green-500 mb-2">
                  {drivers.filter(d => d.status === 'active').length}
                </div>
                <div className="text-sm font-bold text-gray-600">Active Drivers</div>
                <div className="text-xs text-green-600 font-semibold mt-1">
                  {drivers.length} total drivers
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center pt-6">
                <div className="text-3xl font-extra-bold text-blue-500 mb-2">
                  {alerts.filter(a => a.type === 'duplicate').length}
                </div>
                <div className="text-sm font-bold text-gray-600">Complaints Reduced</div>
                <div className="text-xs text-green-600 font-semibold mt-1">
                  AI deduplication active
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center pt-6">
                <div className="text-3xl font-extra-bold text-red-500 mb-2">
                  {alerts.filter(a => a.type === 'fraud').length}
                </div>
                <div className="text-sm font-bold text-gray-600">Fraud Cases Flagged</div>
                <div className="text-xs text-yellow-600 font-semibold mt-1">
                  Requires attention
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Pickup Trends Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-extra-bold text-gray-900">
                  Weekly Pickup Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="pickups" 
                      stroke="#2ecc71" 
                      strokeWidth={3}
                      name="Requests"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#27ae60" 
                      strokeWidth={3}
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Waste Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-extra-bold text-gray-900">
                  Waste Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={wasteTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {wasteTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {wasteTypeData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Pickup Requests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-extra-bold text-gray-900">
                    Pickup Requests
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="text-sm border border-gray-200 rounded-md px-2 py-1 font-semibold"
                    >
                      <option value="all">All Status</option>
                      <option value="requested">Requested</option>
                      <option value="assigned">Assigned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {filteredPickups.map((pickup) => (
                  <motion.div
                    key={pickup.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-extra-bold text-gray-900">{pickup.user}</h4>
                          <Badge variant={getPriorityColor(pickup.priority)}>
                            {pickup.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 font-semibold">{pickup.wasteType}</p>
                        <p className="text-xs text-gray-500 font-medium flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {pickup.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(pickup.status)}>
                          {pickup.status.replace('-', ' ')}
                        </Badge>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                          AI: {pickup.aiConfidence}%
                        </p>
                      </div>
                    </div>

                    {/* ETA Display for Admin */}
                    {pickup.eta && (pickup.status === 'assigned' || pickup.status === 'in-progress') && (
                      <div className="bg-blue-50 rounded-lg p-2 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Navigation className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-extra-bold text-blue-800">
                              ETA: {pickup.eta.text}
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 font-semibold">
                            Driver: {pickup.driverName}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">
                        {pickup.requestTime}
                      </span>
                      <div className="flex items-center space-x-2">
                        {!pickup.driverId && pickup.status === 'requested' && (
                          <Button size="sm" className="text-xs">
                            Assign Driver
                          </Button>
                        )}
                        <Button 
                          variant="neutral" 
                          size="sm"
                          onClick={() => {
                            setSelectedPickup(pickup);
                            setShowPickupModal(true);
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Alerts & Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-extra-bold text-gray-900 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.severity === 'high' ? 'bg-red-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-extra-bold text-gray-900 text-sm">
                            {alert.title}
                          </h4>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 font-semibold mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">
                            {alert.time}
                          </span>
                          <Button variant="neutral" size="sm" className="text-xs">
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Driver Status Table */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-xl font-extra-bold text-gray-900 flex items-center">
                <Truck className="w-6 h-6 mr-2 text-primary-500" />
                Driver Management
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-extra-bold text-gray-500 uppercase tracking-wider">
                      Driver
                    </TableHead>
                    <TableHead className="text-xs font-extra-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-extra-bold text-gray-500 uppercase tracking-wider">
                      Location
                    </TableHead>
                    <TableHead className="text-xs font-extra-bold text-gray-500 uppercase tracking-wider">
                      Assigned
                    </TableHead>
                    <TableHead className="text-xs font-extra-bold text-gray-500 uppercase tracking-wider">
                      Completed
                    </TableHead>
                    <TableHead className="text-xs font-extra-bold text-gray-500 uppercase tracking-wider">
                      Rating
                    </TableHead>
                    <TableHead className="text-xs font-extra-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold text-sm">
                              {driver.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-bold text-gray-900">{driver.name}</div>
                            <div className="text-sm font-medium text-gray-500">{driver.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={driver.status === 'active' ? 'default' : 'neutral'}>
                          {driver.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-gray-900">
                        {driver.currentLocation}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-gray-900">
                        {driver.assignedPickups}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-gray-900">
                        {driver.completedToday}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm font-bold text-gray-900 mr-1">{driver.rating}</span>
                          <div className="flex text-yellow-400">
                            {'★'.repeat(Math.floor(driver.rating))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button variant="neutral" size="sm">
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <Button variant="neutral" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pickup Details Modal */}
      <Dialog open={showPickupModal} onOpenChange={setShowPickupModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pickup Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedPickup && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-extra-bold text-gray-900 mb-3">Request Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">User:</span>
                      <span className="font-bold">{selectedPickup.user}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Address:</span>
                      <span className="font-bold">{selectedPickup.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Waste Type:</span>
                      <span className="font-bold">{selectedPickup.wasteType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Priority:</span>
                      <Badge variant={getPriorityColor(selectedPickup.priority)}>
                        {selectedPickup.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Status:</span>
                      <Badge variant={getStatusColor(selectedPickup.status)}>
                        {selectedPickup.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-extra-bold text-gray-900 mb-3">Assignment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Driver:</span>
                      <span className="font-bold">
                        {selectedPickup.driverName || 'Not assigned'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Request Time:</span>
                      <span className="font-bold">{selectedPickup.requestTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">AI Confidence:</span>
                      <span className="font-bold">{selectedPickup.aiConfidence}%</span>
                    </div>
                    {selectedPickup.eta && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-semibold">Current ETA:</span>
                        <span className="font-extra-bold text-green-600">{selectedPickup.eta.text}</span>
                      </div>
                    )}
                  </div>

                  {!selectedPickup.driverId && (
                    <div className="mt-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Assign Driver
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg font-semibold">
                        <option value="">Select a driver</option>
                        {drivers.filter(d => d.status === 'active').map(driver => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} - {driver.currentLocation}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                {!selectedPickup.driverId && (
                  <Button className="flex-1">
                    Assign Driver
                  </Button>
                )}
                <Button variant="neutral" className="flex-1">
                  View on Map
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
