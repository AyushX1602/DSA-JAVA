// Mock API service with sample data
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sample data - Standardized format matching AppContext
const sampleTrips = [
  {
    id: 1,
    name: 'European Adventure',
    description: 'A magical journey through historic Europe',
    destination: 'Paris, Rome, Barcelona',
    coverImage: 'https://images.pexels.com/photos/1020016/pexels-photo-1020016.jpeg?auto=compress&cs=tinysrgb&w=800',
    image: 'https://images.pexels.com/photos/1020016/pexels-photo-1020016.jpeg?auto=compress&cs=tinysrgb&w=800',
    startDate: '2025-09-15',
    endDate: '2025-09-25',
    status: 'upcoming',
    budget: 3000,
    totalBudget: 3000,
    isPublic: true,
    userId: 'user1',
    destinations: ['Paris', 'Rome', 'Barcelona'],
    createdAt: '2024-01-15T10:30:00Z',
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
    ],
    stops: [
      {
        id: 1001,
        cityName: 'Paris',
        country: 'France',
        startDate: '2025-09-15',
        endDate: '2025-09-18',
        estimatedCost: 1200,
        activities: [
          { id: 1001001, name: 'Eiffel Tower Visit', category: 'Sightseeing', cost: 30, date: '2025-09-16', duration: 2 },
          { id: 1001002, name: 'Louvre Museum', category: 'Culture', cost: 25, date: '2025-09-17', duration: 4 }
        ]
      },
      {
        id: 1002,
        cityName: 'Rome',
        country: 'Italy',
        startDate: '2025-09-19',
        endDate: '2025-09-22',
        estimatedCost: 1100,
        activities: [
          { id: 1002001, name: 'Colosseum Tour', category: 'Sightseeing', cost: 45, date: '2025-09-20', duration: 3 },
          { id: 1002002, name: 'Vatican Museums', category: 'Culture', cost: 35, date: '2025-09-21', duration: 5 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Tokyo Discovery',
    description: 'Exploring the wonders of Asia',
    destination: 'Tokyo, Japan',
    coverImage: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800',
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800',
    startDate: '2025-08-20',
    endDate: '2025-08-30',
    status: 'ongoing',
    budget: 2500,
    totalBudget: 2500,
    isPublic: true,
    userId: 'user1',
    destinations: ['Tokyo', 'Seoul', 'Bangkok'],
    createdAt: '2024-01-10T08:15:00Z',
    itinerary: [],
    stops: []
  },
  {
    id: 3,
    name: 'Bali Retreat',
    description: 'Peaceful retreat in paradise',
    destination: 'Bali, Indonesia',
    coverImage: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=500',
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=500',
    startDate: '2025-07-01',
    endDate: '2025-07-10',
    status: 'completed',
    budget: 1800,
    totalBudget: 1800,
    isPublic: true,
    userId: 'user1',
    destinations: ['Bali'],
    createdAt: '2024-01-05T14:20:00Z',
    itinerary: [],
    stops: []
  }
];

const sampleUser = {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
};

const sampleExpenses = [
  { id: '1', tripId: '1', type: 'Accommodation', amount: 800, date: '2024-06-01' },
  { id: '2', tripId: '1', type: 'Food', amount: 450, date: '2024-06-02' },
  { id: '3', tripId: '1', type: 'Transportation', amount: 320, date: '2024-06-01' },
  { id: '4', tripId: '1', type: 'Activities', amount: 180, date: '2024-06-03' }
];

// API functions
export const api = {
  // Auth
  async login(email, password) {
    await delay(1000);
    if (email === 'john@example.com' && password === 'password') {
      return { success: true, user: sampleUser, token: 'mock-jwt-token' };
    }
    throw new Error('Invalid credentials');
  },

  async signup(userData) {
    await delay(1000);
    return { 
      success: true, 
      user: { ...sampleUser, ...userData, id: 'new-user-id' }, 
      token: 'mock-jwt-token' 
    };
  },

  async logout() {
    await delay(500);
    return { success: true };
  },

  // Trips
  async getTrips() {
    await delay(800);
    console.log('API getTrips called, returning:', sampleTrips.map(t => ({ id: t.id, name: t.name })));
    return sampleTrips;
  },

  async getPublicTrips() {
    await delay(800);
    return sampleTrips.filter(trip => trip.isPublic);
  },

  async getTripById(id) {
    await delay(600);
    // Convert string ID to number if needed
    const tripId = typeof id === 'string' ? parseInt(id, 10) : id;
    const trip = sampleTrips.find(trip => trip.id === tripId);
    if (!trip) {
      console.warn(`Trip with ID ${id} (converted to ${tripId}) not found in:`, sampleTrips.map(t => t.id));
      throw new Error('Trip not found');
    }
    return trip;
  },

  async createTrip(tripData) {
    await delay(1000);
    const newTrip = {
      id: Date.now(), // Use numeric timestamp ID
      ...tripData,
      userId: sampleUser.id,
      destinations: tripData.destinations || [],
      stops: [],
      totalBudget: tripData.budget || 0,
      budget: tripData.budget || 0,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      itinerary: [],
      // Ensure both image and coverImage fields are set
      image: tripData.coverImage || tripData.image,
      coverImage: tripData.coverImage || tripData.image
    };
    sampleTrips.push(newTrip);
    console.log('Created new trip:', newTrip);
    console.log('All trips now:', sampleTrips.map(t => ({ id: t.id, name: t.name })));
    return newTrip;
  },

  async updateTrip(id, updates) {
    await delay(800);
    const tripIndex = sampleTrips.findIndex(trip => trip.id === id);
    if (tripIndex === -1) throw new Error('Trip not found');
    sampleTrips[tripIndex] = { ...sampleTrips[tripIndex], ...updates };
    return sampleTrips[tripIndex];
  },

  async deleteTrip(id) {
    await delay(600);
    const tripIndex = sampleTrips.findIndex(trip => trip.id === id);
    if (tripIndex === -1) throw new Error('Trip not found');
    sampleTrips.splice(tripIndex, 1);
    return { success: true };
  },

  // Stops
  async addStop(tripId, stopData) {
    await delay(600);
    // Convert string ID to number if needed
    const numericTripId = typeof tripId === 'string' ? parseInt(tripId, 10) : tripId;
    const trip = sampleTrips.find(t => t.id === numericTripId);
    if (!trip) {
      console.warn(`Trip with ID ${tripId} (converted to ${numericTripId}) not found in:`, sampleTrips.map(t => t.id));
      throw new Error('Trip not found');
    }
    const newStop = {
      id: Date.now(), // Use numeric ID
      ...stopData,
      activities: []
    };
    trip.stops.push(newStop);
    console.log('Added stop to trip:', { tripId: numericTripId, stop: newStop });
    return newStop;
  },

  async updateStop(tripId, stopId, updates) {
    await delay(500);
    const numericTripId = typeof tripId === 'string' ? parseInt(tripId, 10) : tripId;
    const numericStopId = typeof stopId === 'string' ? parseInt(stopId, 10) : stopId;
    const trip = sampleTrips.find(t => t.id === numericTripId);
    if (!trip) throw new Error('Trip not found');
    const stopIndex = trip.stops.findIndex(s => s.id === numericStopId);
    if (stopIndex === -1) throw new Error('Stop not found');
    trip.stops[stopIndex] = { ...trip.stops[stopIndex], ...updates };
    return trip.stops[stopIndex];
  },

  async deleteStop(tripId, stopId) {
    await delay(500);
    const numericTripId = typeof tripId === 'string' ? parseInt(tripId, 10) : tripId;
    const numericStopId = typeof stopId === 'string' ? parseInt(stopId, 10) : stopId;
    const trip = sampleTrips.find(t => t.id === numericTripId);
    if (!trip) throw new Error('Trip not found');
    trip.stops = trip.stops.filter(s => s.id !== numericStopId);
    return { success: true };
  },

  // Activities
  async addActivity(tripId, stopId, activityData) {
    await delay(500);
    const numericTripId = typeof tripId === 'string' ? parseInt(tripId, 10) : tripId;
    const numericStopId = typeof stopId === 'string' ? parseInt(stopId, 10) : stopId;
    const trip = sampleTrips.find(t => t.id === numericTripId);
    if (!trip) throw new Error('Trip not found');
    const stop = trip.stops.find(s => s.id === numericStopId);
    if (!stop) throw new Error('Stop not found');
    const newActivity = {
      id: Date.now(), // Use numeric ID
      ...activityData
    };
    stop.activities.push(newActivity);
    console.log('Added activity to stop:', { tripId: numericTripId, stopId: numericStopId, activity: newActivity });
    return newActivity;
  },

  async updateActivity(tripId, stopId, activityId, updates) {
    await delay(400);
    const numericTripId = typeof tripId === 'string' ? parseInt(tripId, 10) : tripId;
    const numericStopId = typeof stopId === 'string' ? parseInt(stopId, 10) : stopId;
    const numericActivityId = typeof activityId === 'string' ? parseInt(activityId, 10) : activityId;
    const trip = sampleTrips.find(t => t.id === numericTripId);
    if (!trip) throw new Error('Trip not found');
    const stop = trip.stops.find(s => s.id === numericStopId);
    if (!stop) throw new Error('Stop not found');
    const activityIndex = stop.activities.findIndex(a => a.id === numericActivityId);
    if (activityIndex === -1) throw new Error('Activity not found');
    stop.activities[activityIndex] = { ...stop.activities[activityIndex], ...updates };
    return stop.activities[activityIndex];
  },

  async deleteActivity(tripId, stopId, activityId) {
    await delay(400);
    const numericTripId = typeof tripId === 'string' ? parseInt(tripId, 10) : tripId;
    const numericStopId = typeof stopId === 'string' ? parseInt(stopId, 10) : stopId;
    const numericActivityId = typeof activityId === 'string' ? parseInt(activityId, 10) : activityId;
    const trip = sampleTrips.find(t => t.id === numericTripId);
    if (!trip) throw new Error('Trip not found');
    const stop = trip.stops.find(s => s.id === numericStopId);
    if (!stop) throw new Error('Stop not found');
    stop.activities = stop.activities.filter(a => a.id !== numericActivityId);
    return { success: true };
  },

  // Expenses
  async getExpenses(tripId) {
    await delay(600);
    return sampleExpenses.filter(expense => expense.tripId === tripId);
  },

  async addExpense(tripId, expenseData) {
    await delay(500);
    const newExpense = {
      id: Date.now().toString(),
      tripId,
      ...expenseData
    };
    sampleExpenses.push(newExpense);
    return newExpense;
  },

  // Profile
  async updateProfile(userData) {
    await delay(800);
    Object.assign(sampleUser, userData);
    return sampleUser;
  },

  async getCurrentUser() {
    await delay(300);
    return sampleUser;
  },

  // Recommendations
  async getWeatherRecommendations(destination, startDate, endDate) {
    await delay(600);
    return {
      temperature: Math.floor(Math.random() * 15) + 15,
      condition: ['Sunny', 'Partly Cloudy', 'Rainy', 'Clear', 'Cloudy'][Math.floor(Math.random() * 5)],
      humidity: Math.floor(Math.random() * 30) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      recommendation: this.getWeatherRecommendationText(destination),
      forecast: this.generateWeatherForecast(startDate, endDate)
    };
  },

  getWeatherRecommendationText(destination) {
    const tips = [
      'Perfect weather for outdoor activities!',
      'Great time to explore the city on foot',
      'Ideal conditions for sightseeing',
      'Perfect for both indoor and outdoor activities',
      'Great weather for photography and tours'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  },

  generateWeatherForecast(startDate, endDate) {
    const forecast = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      forecast.push({
        date: d.toISOString().split('T')[0],
        temperature: Math.floor(Math.random() * 15) + 15,
        condition: ['Sunny', 'Partly Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 4)]
      });
    }
    return forecast.slice(0, 7); // Limit to 7 days
  },

  async getHotelRecommendations(destination) {
    await delay(800);
    const hotelTypes = ['Grand Hotel', 'Resort', 'Boutique Hotel', 'Business Hotel', 'Budget Inn'];
    const amenities = [
      ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
      ['WiFi', 'Breakfast', 'Parking', 'Room Service'],
      ['WiFi', 'Restaurant', 'Bar', 'Concierge'],
      ['WiFi', 'Breakfast', 'Gym', 'Business Center'],
      ['WiFi', 'Breakfast']
    ];

    return hotelTypes.map((type, index) => ({
      id: index + 1,
      name: `${destination} ${type}`,
      rating: 3.5 + Math.random() * 1.5,
      price: Math.floor(Math.random() * 200) + 50,
      amenities: amenities[index] || amenities[0],
      distance: `${(Math.random() * 3).toFixed(1)}km from city center`,
      image: `https://images.pexels.com/photos/566073${index + 1}/pexels-photo-566073${index + 1}.jpeg?auto=compress&cs=tinysrgb&w=400`
    }));
  },

  async getTransportRecommendations(destination) {
    await delay(600);
    return [
      {
        id: 1,
        route: `Airport ↔ ${destination} Center`,
        type: 'Airport Express',
        frequency: 'Every 15 minutes',
        price: '$5-8',
        duration: '25-35 minutes',
        description: 'Direct connection from airport to city center'
      },
      {
        id: 2,
        route: `${destination} City Bus`,
        type: 'Public Bus',
        frequency: 'Every 10-20 minutes',
        price: '$2-3',
        duration: '15-30 minutes',
        description: 'Comprehensive city coverage with multiple routes'
      },
      {
        id: 3,
        route: `${destination} Metro/Subway`,
        type: 'Metro',
        frequency: 'Every 5-10 minutes',
        price: '$3-5',
        duration: '10-25 minutes',
        description: 'Fast underground transport system'
      },
      {
        id: 4,
        route: `${destination} Tourist Bus`,
        type: 'Hop-on Hop-off',
        frequency: 'Every 30 minutes',
        price: '$15-25',
        duration: '2-3 hours full route',
        description: 'Sightseeing bus with tourist attractions'
      }
    ];
  },

  async getActivityRecommendations(destination) {
    await delay(700);
    const categories = ['Sightseeing', 'Culture', 'Food & Drink', 'Adventure', 'Entertainment', 'Shopping'];
    const activities = [
      'Walking Tour', 'Museum Visit', 'Food Experience', 'Adventure Park', 'Live Show', 'Market Tour',
      'Historical Tour', 'Art Gallery', 'Cooking Class', 'Hiking Trail', 'Concert', 'Shopping District',
      'Architecture Tour', 'Cultural Site', 'Wine Tasting', 'Water Sports', 'Theater', 'Local Crafts',
      'Landmark Visit', 'Traditional Performance', 'Street Food Tour', 'Outdoor Activity', 'Music Venue', 'Souvenir Shopping'
    ];

    return activities.slice(0, 8).map((activity, index) => ({
      id: index + 1,
      name: `${destination} ${activity}`,
      category: categories[index % categories.length],
      duration: `${Math.floor(Math.random() * 4) + 1}-${Math.floor(Math.random() * 3) + 2} hours`,
      price: `$${Math.floor(Math.random() * 80) + 10}`,
      rating: 3.5 + Math.random() * 1.5,
      description: this.getActivityDescription(activity),
      image: `https://images.pexels.com/photos/171740${index + 1}/pexels-photo-171740${index + 1}.jpeg?auto=compress&cs=tinysrgb&w=400`,
      highlights: this.getActivityHighlights(activity)
    }));
  },

  getActivityDescription(activity) {
    const descriptions = {
      'Walking Tour': 'Explore the historic landmarks and hidden gems with expert local guides',
      'Museum Visit': 'Discover the rich history and culture through carefully curated exhibitions',
      'Food Experience': 'Taste authentic local cuisine with expert guides and local recommendations',
      'Adventure Park': 'Thrilling outdoor activities and adventures for all skill levels',
      'Live Show': 'Experience the local entertainment scene with traditional and modern performances',
      'Market Tour': 'Immerse yourself in local life and discover unique products and foods'
    };
    return descriptions[activity] || 'Discover the unique charm and character of this amazing experience';
  },

  getActivityHighlights(activity) {
    const highlights = {
      'Walking Tour': ['Expert local guide', 'Historic landmarks', 'Hidden gems', 'Photo opportunities'],
      'Museum Visit': ['World-class exhibits', 'Audio guide included', 'Historical artifacts', 'Educational experience'],
      'Food Experience': ['Local cuisine', 'Multiple tastings', 'Cultural insights', 'Recipe sharing'],
      'Adventure Park': ['Multiple activities', 'Safety equipment', 'All skill levels', 'Group activities'],
      'Live Show': ['Cultural performance', 'Traditional music', 'Interactive experience', 'Local artists'],
      'Market Tour': ['Local products', 'Food sampling', 'Cultural exchange', 'Shopping opportunities']
    };
    return highlights[activity] || ['Unique experience', 'Expert guidance', 'Cultural insights', 'Memorable moments'];
  }
};