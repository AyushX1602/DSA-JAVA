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
          // Load trips from MongoDB instead of mock data
          loadTrips();
          loadActivities();
          loadHotels();
          loadCommunityPosts();
        }
      } catch (error) {
        console.log('No existing session found');
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    };
    tryRefresh();
  }, []);

  // Function to load trips from MongoDB
  const loadTrips = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/trips', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const trips = await res.json();
        // Transform MongoDB trips to include id field for compatibility
        const transformedTrips = trips.map(trip => ({
          ...trip,
          id: trip._id, // Add id field for compatibility with existing components
          destination: trip.primaryDestination // Map primaryDestination to destination
        }));
        dispatch({ type: actionTypes.SET_TRIPS, payload: transformedTrips });
      } else {
        console.error('Failed to fetch trips');
        // Fallback to mock data if fetch fails
        dispatch({ type: actionTypes.SET_TRIPS, payload: mockTrips });
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      // Fallback to mock data if fetch fails
      dispatch({ type: actionTypes.SET_TRIPS, payload: mockTrips });
    }
  };

  // Function to load activities from MongoDB
  const loadActivities = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/activities', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const activities = await res.json();
        dispatch({ type: actionTypes.SET_ACTIVITIES, payload: activities });
      } else {
        console.error('Failed to fetch activities');
        dispatch({ type: actionTypes.SET_ACTIVITIES, payload: mockActivities });
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      dispatch({ type: actionTypes.SET_ACTIVITIES, payload: mockActivities });
    }
  };

  // Function to load hotels from MongoDB (using mock for now)
  const loadHotels = async () => {
    try {
      // For now, using mock data as we don't have a hotels backend yet
      dispatch({ type: actionTypes.SET_HOTELS, payload: mockHotels });
    } catch (error) {
      console.error('Error fetching hotels:', error);
      dispatch({ type: actionTypes.SET_HOTELS, payload: mockHotels });
    }
  };

  // Function to load community posts from MongoDB
  const loadCommunityPosts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/community', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        // Transform MongoDB posts to include id field for compatibility
        const transformedPosts = data.posts.map(post => ({
          ...post,
          id: post._id, // Add id field for compatibility with existing components
        }));
        dispatch({ type: actionTypes.SET_COMMUNITY_POSTS, payload: transformedPosts });
        console.log('Community posts loaded from MongoDB:', transformedPosts.length);
      } else {
        console.error('Failed to fetch community posts');
        // Fallback to mock data if fetch fails
        dispatch({ type: actionTypes.SET_COMMUNITY_POSTS, payload: mockCommunityPosts });
      }
    } catch (error) {
      console.error('Error fetching community posts:', error);
      // Fallback to mock data if error occurs
      dispatch({ type: actionTypes.SET_COMMUNITY_POSTS, payload: mockCommunityPosts });
    }
  };

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
        loadTrips(); // Load trips from MongoDB
        loadActivities();
        loadHotels();
        loadCommunityPosts();
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
        loadTrips(); // Load trips from MongoDB
        loadActivities();
        loadHotels();
        loadCommunityPosts();
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
  // const createTrip = async (tripData) => {
  //   try {
  //     dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
  //     // Call API to create trip
  //     const { api } = await import('../services/api.js');
  //     const newTrip = await api.createTrip(tripData);
      
  //     // Add to local state
  //     dispatch({ type: actionTypes.ADD_TRIP, payload: newTrip });
      
  //     return newTrip;
  //   } catch (error) {
  //     dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
  //     throw error;
  //   } finally {
  //     dispatch({ type: actionTypes.SET_LOADING, payload: false });
  //   }
  // };

  const createTrip = async (tripData) => {
  try {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });

    // Call backend API that stores in MongoDB
    const res = await fetch("http://localhost:3000/api/trips", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tripData),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to create trip");
    }

    // This response should come from MongoDB (via backend controller)
    const newTrip = await res.json();

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


  const updateTrip = async (tripId, updates) => {
    try {
      const res = await fetch(`http://localhost:3000/api/trips/${tripId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update trip');
      }

      const updatedTrip = await res.json();
      dispatch({ type: actionTypes.UPDATE_TRIP, payload: updatedTrip });
      return updatedTrip;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const deleteTrip = async (tripId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/trips/${tripId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete trip');
      }

      dispatch({ type: actionTypes.DELETE_TRIP, payload: tripId });
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
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
  const createCommunityPost = async (postData) => {
    try {
      const res = await fetch('http://localhost:3000/api/community', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        const newPost = await res.json();
        // Transform to include id field for compatibility
        const transformedPost = {
          ...newPost,
          id: newPost._id,
        };
        dispatch({ type: actionTypes.ADD_COMMUNITY_POST, payload: transformedPost });
        console.log('Community post created successfully:', transformedPost);
        return transformedPost;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create community post');
      }
    } catch (error) {
      console.error('Error creating community post:', error);
      // Fallback to mock-like behavior for development
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
    }
  };

  const addCommunityComment = async (postId, content) => {
    try {
      const res = await fetch(`http://localhost:3000/api/community/posts/${postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        // Find the post and update it with the new comment
        const post = state.communityPosts.find(p => p.id === postId);
        if (post) {
          const updatedPost = {
            ...post,
            comments: [...(post.comments || []), data.comment],
            commentCount: data.commentCount
          };
          dispatch({ type: actionTypes.UPDATE_COMMUNITY_POST, payload: updatedPost });
        }
        console.log('Comment added successfully');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      // Fallback to mock-like behavior
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
    }
  };

  const togglePostLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/community/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        // Find the post and update it with the new likes
        const post = state.communityPosts.find(p => p.id === postId);
        if (post) {
          const updatedPost = {
            ...post,
            likes: data.likes,
            likeCount: data.likeCount
          };
          dispatch({ type: actionTypes.UPDATE_COMMUNITY_POST, payload: updatedPost });
        }
        console.log('Like toggled successfully');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Fallback to mock-like behavior
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
    loadTrips,
    loadActivities,
    loadHotels,
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