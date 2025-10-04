import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  trips: [],
  currentTrip: null,
  activities: [],
  hotels: [],
  weatherData: {},
  busRoutes: [],
  communityPosts: [],
  error: null,
  notifications: [],
};

// Action types
const actionTypes = {
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_TRIPS: 'SET_TRIPS',
  ADD_TRIP: 'ADD_TRIP',
  UPDATE_TRIP: 'UPDATE_TRIP',
  DELETE_TRIP: 'DELETE_TRIP',
  SET_CURRENT_TRIP: 'SET_CURRENT_TRIP',
  SET_ACTIVITIES: 'SET_ACTIVITIES',
  SET_HOTELS: 'SET_HOTELS',
  SET_WEATHER: 'SET_WEATHER',
  SET_BUS_ROUTES: 'SET_BUS_ROUTES',
  SET_COMMUNITY_POSTS: 'SET_COMMUNITY_POSTS',
  ADD_COMMUNITY_POST: 'ADD_COMMUNITY_POST',
  UPDATE_COMMUNITY_POST: 'UPDATE_COMMUNITY_POST',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
};

// Mock data
const mockTrips = [
  {
    id: 1,
    name: 'European Adventure',
    destination: 'Paris, Rome, Barcelona',
    startDate: '2025-09-15',
    endDate: '2025-09-25',
    status: 'upcoming',
    budget: 3000,
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500',
    itinerary: [
      {
        day: 1,
        location: 'Paris',
        activities: ['Visit Eiffel Tower', 'Seine River Cruise'],
        budget: 150,
        weather: { temp: 22, condition: 'Sunny' }
      },
      {
        day: 2,
        location: 'Paris',
        activities: ['Louvre Museum', 'Montmartre District'],
        budget: 120,
        weather: { temp: 20, condition: 'Cloudy' }
      }
    ]
  },
  {
    id: 2,
    name: 'Tokyo Discovery',
    destination: 'Tokyo, Japan',
    startDate: '2025-08-20',
    endDate: '2025-08-30',
    status: 'ongoing',
    budget: 2500,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500',
    itinerary: []
  },
  {
    id: 3,
    name: 'Bali Retreat',
    destination: 'Bali, Indonesia',
    startDate: '2025-07-01',
    endDate: '2025-07-10',
    status: 'completed',
    budget: 1800,
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=500',
    itinerary: []
  }
];

const mockActivities = [
  {
    id: 1,
    name: 'Eiffel Tower Visit',
    city: 'Paris',
    category: 'Sightseeing',
    price: 25,
    rating: 4.8,
    duration: '2 hours',
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300'
  },
  {
    id: 2,
    name: 'Seine River Cruise',
    city: 'Paris',
    category: 'Tours',
    price: 35,
    rating: 4.6,
    duration: '1.5 hours',
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300'
  },
  {
    id: 3,
    name: 'Senso-ji Temple',
    city: 'Tokyo',
    category: 'Cultural',
    price: 0,
    rating: 4.7,
    duration: '1 hour',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300'
  }
];

const mockHotels = [
  {
    id: 1,
    name: 'Hotel Elegance Paris',
    city: 'Paris',
    pricePerNight: 150,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
    amenities: ['WiFi', 'Breakfast', 'Pool']
  },
  {
    id: 2,
    name: 'Tokyo Grand Hotel',
    city: 'Tokyo',
    pricePerNight: 200,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
    amenities: ['WiFi', 'Spa', 'Restaurant']
  }
];

const mockCommunityPosts = [
  {
    id: 1,
    author: { name: 'Sarah Johnson' },
    title: 'Amazing Paris Experience!',
    content: 'Just came back from an incredible trip to Paris. The food was amazing and the weather was perfect!',
    createdAt: '2025-08-10T10:30:00Z',
    category: 'general',
    destination: 'Paris, France',
    tags: ['paris', 'photography', 'foodie'],
    likes: [
      { userId: 2, userName: 'Mike Chen' },
      { userId: 3, userName: 'Anna Smith' },
      { userId: 4, userName: 'David Wilson' }
    ],
    comments: [
      { 
        id: 1, 
        author: { name: 'Mike Chen' }, 
        content: 'Looks amazing! Any restaurant recommendations?', 
        createdAt: '2025-08-10T11:00:00Z' 
      }
    ],
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400'
  },
  {
    id: 2,
    author: { name: 'David Wilson' },
    title: 'Budget Travel Tips for Southeast Asia',
    content: 'Here are my top 10 tips for traveling through Southeast Asia on a budget...',
    createdAt: '2025-08-09T15:45:00Z',
    category: 'budget',
    destination: 'Southeast Asia',
    tags: ['budget', 'backpacking', 'tips'],
    likes: [
      { userId: 1, userName: 'John Doe' },
      { userId: 3, userName: 'Anna Smith' }
    ],
    comments: [],
    image: null
  }
];

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        currentTrip: null,
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case actionTypes.SET_TRIPS:
      return {
        ...state,
        trips: action.payload,
      };
    case actionTypes.ADD_TRIP:
      return {
        ...state,
        trips: [...state.trips, action.payload],
      };
    case actionTypes.UPDATE_TRIP:
      return {
        ...state,
        trips: state.trips.map(trip =>
          trip.id === action.payload.id ? action.payload : trip
        ),
        currentTrip: state.currentTrip?.id === action.payload.id ? action.payload : state.currentTrip,
      };
    case actionTypes.DELETE_TRIP:
      return {
        ...state,
        trips: state.trips.filter(trip => trip.id !== action.payload),
        currentTrip: state.currentTrip?.id === action.payload ? null : state.currentTrip,
      };
    case actionTypes.SET_CURRENT_TRIP:
      return {
        ...state,
        currentTrip: action.payload,
      };
    case actionTypes.SET_ACTIVITIES:
      return {
        ...state,
        activities: action.payload,
      };
    case actionTypes.SET_HOTELS:
      return {
        ...state,
        hotels: action.payload,
      };
    case actionTypes.SET_WEATHER:
      return {
        ...state,
        weatherData: { ...state.weatherData, ...action.payload },
      };
    case actionTypes.SET_BUS_ROUTES:
      return {
        ...state,
        busRoutes: action.payload,
      };
    case actionTypes.SET_COMMUNITY_POSTS:
      return {
        ...state,
        communityPosts: action.payload,
      };
    case actionTypes.ADD_COMMUNITY_POST:
      return {
        ...state,
        communityPosts: [action.payload, ...state.communityPosts],
      };
    case actionTypes.UPDATE_COMMUNITY_POST:
      return {
        ...state,
        communityPosts: state.communityPosts.map(post =>
          post.id === action.payload.id ? action.payload : post
        ),
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case actionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload),
      };
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [user, setUser] = useState(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          dispatch({ type: actionTypes.SET_USER, payload: data.user });
          // Load initial data after successful auth
          dispatch({ type: actionTypes.SET_TRIPS, payload: mockTrips });
          dispatch({ type: actionTypes.SET_ACTIVITIES, payload: mockActivities });
          dispatch({ type: actionTypes.SET_HOTELS, payload: mockHotels });
          dispatch({ type: actionTypes.SET_COMMUNITY_POSTS, payload: mockCommunityPosts });
        }
      } catch (error) {
        console.log('No existing session found');
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    };
    tryRefresh();
  }, []);

  // Auth functions
  const login = async (email, password) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        dispatch({ type: actionTypes.SET_USER, payload: data.user });
        dispatch({ type: actionTypes.SET_TRIPS, payload: mockTrips });
        dispatch({ type: actionTypes.SET_ACTIVITIES, payload: mockActivities });
        dispatch({ type: actionTypes.SET_HOTELS, payload: mockHotels });
        dispatch({ type: actionTypes.SET_COMMUNITY_POSTS, payload: mockCommunityPosts });
        dispatch({ type: actionTypes.CLEAR_ERROR });
        return { success: true };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        dispatch({ type: actionTypes.SET_USER, payload: data.user });
        dispatch({ type: actionTypes.SET_TRIPS, payload: mockTrips });
        dispatch({ type: actionTypes.SET_ACTIVITIES, payload: mockActivities });
        dispatch({ type: actionTypes.SET_HOTELS, payload: mockHotels });
        dispatch({ type: actionTypes.SET_COMMUNITY_POSTS, payload: mockCommunityPosts });
        dispatch({ type: actionTypes.CLEAR_ERROR });
        return { success: true };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      dispatch({ type: actionTypes.LOGOUT });
    }
  };


  // Trip functions
  const createTrip = async (tripData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      // Call API to create trip
      const { api } = await import('../services/api.js');
      const newTrip = await api.createTrip(tripData);
      
      // Add to local state
      dispatch({ type: actionTypes.ADD_TRIP, payload: newTrip });
      
      return newTrip;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const updateTrip = (tripId, updates) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (trip) {
      const updatedTrip = { ...trip, ...updates };
      dispatch({ type: actionTypes.UPDATE_TRIP, payload: updatedTrip });
      return updatedTrip;
    }
  };

  const deleteTrip = (tripId) => {
    dispatch({ type: actionTypes.DELETE_TRIP, payload: tripId });
  };

  const setCurrentTrip = (trip) => {
    dispatch({ type: actionTypes.SET_CURRENT_TRIP, payload: trip });
  };

  // Weather functions
  const fetchWeather = async (location) => {
    // Mock weather data
    const mockWeather = {
      [location]: {
        current: { temp: 22, condition: 'Sunny', icon: '☀️' },
        forecast: [
          { day: 'Today', temp: 22, condition: 'Sunny', icon: '☀️' },
          { day: 'Tomorrow', temp: 20, condition: 'Cloudy', icon: '☁️' },
          { day: 'Day 3', temp: 18, condition: 'Rainy', icon: '🌧️' },
          { day: 'Day 4', temp: 24, condition: 'Sunny', icon: '☀️' },
          { day: 'Day 5', temp: 21, condition: 'Partly Cloudy', icon: '⛅' },
        ]
      }
    };
    
    dispatch({ type: actionTypes.SET_WEATHER, payload: mockWeather });
    return mockWeather[location];
  };

  // Bus routes functions
  const fetchBusRoutes = async (from, to) => {
    // Mock bus data
    const mockBusRoutes = [
      {
        id: 1,
        route: `${from} to ${to}`,
        departure: '08:00',
        arrival: '12:00',
        price: 45,
        operator: 'Express Bus Lines'
      },
      {
        id: 2,
        route: `${from} to ${to}`,
        departure: '14:30',
        arrival: '18:30',
        price: 40,
        operator: 'City Transport'
      }
    ];
    
    dispatch({ type: actionTypes.SET_BUS_ROUTES, payload: mockBusRoutes });
    return mockBusRoutes;
  };

  // Community functions
  const createCommunityPost = (postData) => {
    const newPost = {
      id: Date.now(),
      author: { name: state.user?.name || 'Anonymous' },
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      category: postData.category || 'general',
      tags: postData.tags || [],
      ...postData,
    };
    dispatch({ type: actionTypes.ADD_COMMUNITY_POST, payload: newPost });
    return newPost;
  };

  const addCommunityComment = (postId, content) => {
    const post = state.communityPosts.find(p => p.id === postId);
    if (post) {
      const newComment = {
        id: Date.now(),
        author: { name: state.user?.name || 'Anonymous' },
        content,
        createdAt: new Date().toISOString(),
      };
      const updatedPost = {
        ...post,
        comments: [...(post.comments || []), newComment]
      };
      dispatch({ type: actionTypes.UPDATE_COMMUNITY_POST, payload: updatedPost });
    }
  };

  const togglePostLike = (postId) => {
    const post = state.communityPosts.find(p => p.id === postId);
    if (post && state.user) {
      const hasLiked = post.likes?.some(like => like.userId === state.user.id);
      let updatedLikes;
      
      if (hasLiked) {
        updatedLikes = post.likes.filter(like => like.userId !== state.user.id);
      } else {
        updatedLikes = [...(post.likes || []), { userId: state.user.id, userName: state.user.name }];
      }
      
      const updatedPost = { ...post, likes: updatedLikes };
      dispatch({ type: actionTypes.UPDATE_COMMUNITY_POST, payload: updatedPost });
    }
  };

  // User functions
  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    dispatch({ type: actionTypes.SET_USER, payload: updatedUser });
  };

  // Notification functions
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: actionTypes.ADD_NOTIFICATION, payload: notification });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      dispatch({ type: actionTypes.REMOVE_NOTIFICATION, payload: notification.id });
    }, 5000);
  };

  const removeNotification = (id) => {
    dispatch({ type: actionTypes.REMOVE_NOTIFICATION, payload: id });
  };

  // Utility functions
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  const contextValue = {
    ...state,
    user,
    login,
    signup,
    logout,
    createTrip,
    updateTrip,
    deleteTrip,
    setCurrentTrip,
    fetchWeather,
    fetchBusRoutes,
    createCommunityPost,
    addCommunityComment,
    togglePostLike,
    updateUser,
    addNotification,
    removeNotification,
    clearError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
}