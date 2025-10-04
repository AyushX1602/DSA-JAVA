import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@globetrotter.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@globetrotter.com',
      passwordHash: hashedPassword,
      city: 'Ahmedabad',
      country: 'India',
      phoneNumber: '+91-9876543210',
      role: 'USER',
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create an admin user
  const adminHashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@globetrotter.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@globetrotter.com',
      passwordHash: adminHashedPassword,
      city: 'Mumbai',
      country: 'India',
      phoneNumber: '+91-9876543211',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create extensive test users for rich admin analytics
  const testUsers = [
    // USA Users (15 users)
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      city: 'New York',
      country: 'USA',
      monthsAgo: 1,
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      city: 'Los Angeles',
      country: 'USA',
      monthsAgo: 2,
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      city: 'Chicago',
      country: 'USA',
      monthsAgo: 3,
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      city: 'Houston',
      country: 'USA',
      monthsAgo: 1,
    },
    {
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      city: 'Phoenix',
      country: 'USA',
      monthsAgo: 4,
    },
    {
      name: 'Jessica Taylor',
      email: 'jessica.taylor@example.com',
      city: 'Philadelphia',
      country: 'USA',
      monthsAgo: 2,
    },
    {
      name: 'Christopher Anderson',
      email: 'chris.anderson@example.com',
      city: 'San Antonio',
      country: 'USA',
      monthsAgo: 5,
    },
    {
      name: 'Ashley Thomas',
      email: 'ashley.thomas@example.com',
      city: 'San Diego',
      country: 'USA',
      monthsAgo: 3,
    },
    {
      name: 'Matthew Jackson',
      email: 'matthew.jackson@example.com',
      city: 'Dallas',
      country: 'USA',
      monthsAgo: 1,
    },
    {
      name: 'Amanda White',
      email: 'amanda.white@example.com',
      city: 'San Jose',
      country: 'USA',
      monthsAgo: 6,
    },
    {
      name: 'Joshua Harris',
      email: 'joshua.harris@example.com',
      city: 'Austin',
      country: 'USA',
      monthsAgo: 2,
    },
    {
      name: 'Stephanie Martin',
      email: 'stephanie.martin@example.com',
      city: 'Jacksonville',
      country: 'USA',
      monthsAgo: 4,
    },
    {
      name: 'Andrew Thompson',
      email: 'andrew.thompson@example.com',
      city: 'Fort Worth',
      country: 'USA',
      monthsAgo: 3,
    },
    {
      name: 'Samantha Garcia',
      email: 'samantha.garcia@example.com',
      city: 'Columbus',
      country: 'USA',
      monthsAgo: 7,
    },
    {
      name: 'Brandon Martinez',
      email: 'brandon.martinez@example.com',
      city: 'Charlotte',
      country: 'USA',
      monthsAgo: 1,
    },

    // UK Users (12 users)
    {
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      city: 'London',
      country: 'UK',
      monthsAgo: 2,
    },
    {
      name: 'James Miller',
      email: 'james.miller@example.com',
      city: 'Birmingham',
      country: 'UK',
      monthsAgo: 3,
    },
    {
      name: 'Sophie Clark',
      email: 'sophie.clark@example.com',
      city: 'Manchester',
      country: 'UK',
      monthsAgo: 1,
    },
    {
      name: 'Oliver Lewis',
      email: 'oliver.lewis@example.com',
      city: 'Leeds',
      country: 'UK',
      monthsAgo: 4,
    },
    {
      name: 'Charlotte Walker',
      email: 'charlotte.walker@example.com',
      city: 'Liverpool',
      country: 'UK',
      monthsAgo: 2,
    },
    {
      name: 'Harry Hall',
      email: 'harry.hall@example.com',
      city: 'Sheffield',
      country: 'UK',
      monthsAgo: 5,
    },
    {
      name: 'Amelia Allen',
      email: 'amelia.allen@example.com',
      city: 'Bristol',
      country: 'UK',
      monthsAgo: 3,
    },
    {
      name: 'George Young',
      email: 'george.young@example.com',
      city: 'Glasgow',
      country: 'UK',
      monthsAgo: 1,
    },
    {
      name: 'Isabella King',
      email: 'isabella.king@example.com',
      city: 'Edinburgh',
      country: 'UK',
      monthsAgo: 6,
    },
    {
      name: 'Jack Wright',
      email: 'jack.wright@example.com',
      city: 'Cardiff',
      country: 'UK',
      monthsAgo: 2,
    },
    {
      name: 'Grace Green',
      email: 'grace.green@example.com',
      city: 'Belfast',
      country: 'UK',
      monthsAgo: 4,
    },
    {
      name: 'Noah Adams',
      email: 'noah.adams@example.com',
      city: 'Newcastle',
      country: 'UK',
      monthsAgo: 3,
    },

    // India Users (10 users)
    {
      name: 'Raj Patel',
      email: 'raj.patel@example.com',
      city: 'Mumbai',
      country: 'India',
      monthsAgo: 1,
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      city: 'Delhi',
      country: 'India',
      monthsAgo: 2,
    },
    {
      name: 'Arjun Kumar',
      email: 'arjun.kumar@example.com',
      city: 'Bangalore',
      country: 'India',
      monthsAgo: 3,
    },
    {
      name: 'Sneha Singh',
      email: 'sneha.singh@example.com',
      city: 'Chennai',
      country: 'India',
      monthsAgo: 1,
    },
    {
      name: 'Vikram Gupta',
      email: 'vikram.gupta@example.com',
      city: 'Kolkata',
      country: 'India',
      monthsAgo: 4,
    },
    {
      name: 'Kavya Reddy',
      email: 'kavya.reddy@example.com',
      city: 'Hyderabad',
      country: 'India',
      monthsAgo: 2,
    },
    {
      name: 'Rohit Mehta',
      email: 'rohit.mehta@example.com',
      city: 'Pune',
      country: 'India',
      monthsAgo: 5,
    },
    {
      name: 'Ananya Jain',
      email: 'ananya.jain@example.com',
      city: 'Jaipur',
      country: 'India',
      monthsAgo: 3,
    },
    {
      name: 'Karan Agarwal',
      email: 'karan.agarwal@example.com',
      city: 'Lucknow',
      country: 'India',
      monthsAgo: 1,
    },
    {
      name: 'Riya Kapoor',
      email: 'riya.kapoor@example.com',
      city: 'Chandigarh',
      country: 'India',
      monthsAgo: 6,
    },

    // Germany Users (8 users)
    {
      name: 'Hans Mueller',
      email: 'hans.mueller@example.com',
      city: 'Berlin',
      country: 'Germany',
      monthsAgo: 2,
    },
    {
      name: 'Anna Schmidt',
      email: 'anna.schmidt@example.com',
      city: 'Munich',
      country: 'Germany',
      monthsAgo: 3,
    },
    {
      name: 'Klaus Weber',
      email: 'klaus.weber@example.com',
      city: 'Hamburg',
      country: 'Germany',
      monthsAgo: 1,
    },
    {
      name: 'Eva Wagner',
      email: 'eva.wagner@example.com',
      city: 'Cologne',
      country: 'Germany',
      monthsAgo: 4,
    },
    {
      name: 'Fritz Becker',
      email: 'fritz.becker@example.com',
      city: 'Frankfurt',
      country: 'Germany',
      monthsAgo: 2,
    },
    {
      name: 'Greta Schulz',
      email: 'greta.schulz@example.com',
      city: 'Stuttgart',
      country: 'Germany',
      monthsAgo: 5,
    },
    {
      name: 'Wolfgang Fischer',
      email: 'wolfgang.fischer@example.com',
      city: 'Düsseldorf',
      country: 'Germany',
      monthsAgo: 3,
    },
    {
      name: 'Ingrid Koch',
      email: 'ingrid.koch@example.com',
      city: 'Leipzig',
      country: 'Germany',
      monthsAgo: 1,
    },

    // Other Countries (15 users)
    {
      name: 'Marie Dupont',
      email: 'marie.dupont@example.com',
      city: 'Paris',
      country: 'France',
      monthsAgo: 2,
    },
    {
      name: 'Pierre Martin',
      email: 'pierre.martin@example.com',
      city: 'Lyon',
      country: 'France',
      monthsAgo: 3,
    },
    {
      name: 'Yuki Tanaka',
      email: 'yuki.tanaka@example.com',
      city: 'Tokyo',
      country: 'Japan',
      monthsAgo: 1,
    },
    {
      name: 'Hiroshi Sato',
      email: 'hiroshi.sato@example.com',
      city: 'Osaka',
      country: 'Japan',
      monthsAgo: 4,
    },
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      city: 'Madrid',
      country: 'Spain',
      monthsAgo: 2,
    },
    {
      name: 'Carlos Rodriguez',
      email: 'carlos.rodriguez@example.com',
      city: 'Barcelona',
      country: 'Spain',
      monthsAgo: 5,
    },
    {
      name: 'Marco Rossi',
      email: 'marco.rossi@example.com',
      city: 'Rome',
      country: 'Italy',
      monthsAgo: 3,
    },
    {
      name: 'Giulia Ferrari',
      email: 'giulia.ferrari@example.com',
      city: 'Milan',
      country: 'Italy',
      monthsAgo: 1,
    },
    {
      name: 'Lucas Silva',
      email: 'lucas.silva@example.com',
      city: 'São Paulo',
      country: 'Brazil',
      monthsAgo: 6,
    },
    {
      name: 'Ana Santos',
      email: 'ana.santos@example.com',
      city: 'Rio de Janeiro',
      country: 'Brazil',
      monthsAgo: 2,
    },
    {
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      city: 'Cairo',
      country: 'Egypt',
      monthsAgo: 4,
    },
    {
      name: 'Fatima Al-Rashid',
      email: 'fatima.alrashid@example.com',
      city: 'Dubai',
      country: 'UAE',
      monthsAgo: 3,
    },
    {
      name: 'Chen Wei',
      email: 'chen.wei@example.com',
      city: 'Shanghai',
      country: 'China',
      monthsAgo: 1,
    },
    {
      name: 'Li Mei',
      email: 'li.mei@example.com',
      city: 'Beijing',
      country: 'China',
      monthsAgo: 7,
    },
    {
      name: 'Ivan Petrov',
      email: 'ivan.petrov@example.com',
      city: 'Moscow',
      country: 'Russia',
      monthsAgo: 5,
    },
  ];

  // Create users with different signup dates for analytics
  const createdUsers = [];
  for (const userData of testUsers) {
    const userPassword = await bcrypt.hash('password123', 10);
    const signupDate = new Date();
    signupDate.setMonth(signupDate.getMonth() - userData.monthsAgo);
    signupDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day in month

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        city: userData.city,
        country: userData.country,
        phoneNumber: `+${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 9999999)}`,
        passwordHash: userPassword,
        role: 'USER',
        createdAt: signupDate,
      },
    });
    createdUsers.push(user);
  }

  console.log(
    `✅ ${testUsers.length} diverse test users created for admin functionality`,
  );

  // Create Gujarat Heritage Trip
  const gujaratHeritageTrip = await prisma.trip.upsert({
    where: { id: 'gujarat-heritage-2024' },
    update: {},
    create: {
      id: 'gujarat-heritage-2024',
      ownerId: demoUser.id,
      name: 'Gujarat Heritage & Culture Tour',
      description:
        'Explore the rich heritage, culture, and spirituality of Gujarat through its ancient cities and monuments.',
      startDate: new Date('2025-08-11'),
      endDate: new Date('2025-08-25'),
      budget: 0,
      isPublic: true,
    },
  });

  console.log('✅ Gujarat Heritage Trip created');

  // Create stops for the trip
  const stops = [
    {
      id: 'stop-ahmedabad',
      tripId: gujaratHeritageTrip.id,
      city: 'Ahmedabad',
      startDate: new Date('2025-08-11'),
      endDate: new Date('2025-08-12'),
      notes:
        'Explore the historic city of Ahmedabad, UNESCO World Heritage site',
    },
    {
      id: 'stop-vadodara',
      tripId: gujaratHeritageTrip.id,
      city: 'Vadodara',
      startDate: new Date('2025-08-12'),
      endDate: new Date('2025-08-13'),
      notes:
        'Visit the cultural capital of Gujarat with its palaces and museums',
    },
    {
      id: 'stop-dwarka',
      tripId: gujaratHeritageTrip.id,
      city: 'Dwarka',
      startDate: new Date('2025-08-13'),
      endDate: new Date('2025-08-14'),
      notes: 'Spiritual journey to the sacred city of Dwarka',
    },
    {
      id: 'stop-somnath',
      tripId: gujaratHeritageTrip.id,
      city: 'Somnath',
      startDate: new Date('2025-08-14'),
      endDate: new Date('2025-08-15'),
      notes: 'Visit the first Jyotirlinga and beautiful beaches',
    },
  ];

  for (const stop of stops) {
    await prisma.tripStop.upsert({
      where: { id: stop.id },
      update: {},
      create: stop,
    });
  }

  console.log('✅ Trip stops created');

  // Create places for each stop
  const places = [
    // Ahmedabad places
    {
      id: 'place-sabarmati-ashram',
      tripStopId: 'stop-ahmedabad',
      name: 'Sabarmati Ashram',
      latitude: 23.0605,
      longitude: 72.5706,
    },
    {
      id: 'place-jama-masjid',
      tripStopId: 'stop-ahmedabad',
      name: 'Jama Masjid',
      latitude: 23.0258,
      longitude: 72.5873,
    },
    {
      id: 'place-sidi-sayed-mosque',
      tripStopId: 'stop-ahmedabad',
      name: 'Sidi Saeed Mosque',
      latitude: 23.0258,
      longitude: 72.5873,
    },
    {
      id: 'place-kankaria-lake',
      tripStopId: 'stop-ahmedabad',
      name: 'Kankaria Lake',
      latitude: 22.9997,
      longitude: 72.5989,
    },

    // Vadodara places
    {
      id: 'place-lakshmi-vilas-palace',
      tripStopId: 'stop-vadodara',
      name: 'Lakshmi Vilas Palace',
      latitude: 22.3039,
      longitude: 73.2012,
    },
    {
      id: 'place-baroque-museum',
      tripStopId: 'stop-vadodara',
      name: 'Baroda Museum & Picture Gallery',
      latitude: 22.3039,
      longitude: 73.2012,
    },
    {
      id: 'place-sayaji-garden',
      tripStopId: 'stop-vadodara',
      name: 'Sayaji Garden',
      latitude: 22.3039,
      longitude: 73.2012,
    },

    // Dwarka places
    {
      id: 'place-dwarkadhish-temple',
      tripStopId: 'stop-dwarka',
      name: 'Dwarkadhish Temple',
      latitude: 22.2403,
      longitude: 68.9706,
    },
    {
      id: 'place-beyt-dwarka',
      tripStopId: 'stop-dwarka',
      name: 'Beyt Dwarka Island',
      latitude: 22.2403,
      longitude: 68.9706,
    },
    {
      id: 'place-gomti-ghat',
      tripStopId: 'stop-dwarka',
      name: 'Gomti Ghat',
      latitude: 22.2403,
      longitude: 68.9706,
    },

    // Somnath places
    {
      id: 'place-somnath-temple',
      tripStopId: 'stop-somnath',
      name: 'Somnath Temple',
      latitude: 20.8888,
      longitude: 70.3789,
    },
    {
      id: 'place-somnath-beach',
      tripStopId: 'stop-somnath',
      name: 'Somnath Beach',
      latitude: 20.8888,
      longitude: 70.3789,
    },
    {
      id: 'place-trivani-tirth',
      tripStopId: 'stop-somnath',
      name: 'Triveni Tirth',
      latitude: 20.8888,
      longitude: 70.3789,
    },
  ];

  for (const place of places) {
    await prisma.place.upsert({
      where: { id: place.id },
      update: {},
      create: place,
    });
  }

  console.log('✅ Places created');

  // Create activities for each place
  const activities = [
    // Sabarmati Ashram activities
    {
      id: 'activity-ashram-tour',
      placeId: 'place-sabarmati-ashram',
      title: 'Guided Ashram Tour',
      description: "Learn about Mahatma Gandhi's life and philosophy",
      expense: 200.0,
      startTime: new Date('2025-08-11T09:00:00Z'),
      endTime: new Date('2025-08-11T11:00:00Z'),
    },
    {
      id: 'activity-spinning-wheel',
      placeId: 'place-sabarmati-ashram',
      title: 'Spinning Wheel Workshop',
      description: 'Experience the charkha and learn about khadi',
      expense: 150.0,
      startTime: new Date('2025-08-11T14:00:00Z'),
      endTime: new Date('2025-08-11T16:00:00Z'),
    },

    // Jama Masjid activities
    {
      id: 'activity-mosque-visit',
      placeId: 'place-jama-masjid',
      title: 'Mosque Visit & Photography',
      description: 'Explore the architectural beauty of the mosque',
      expense: 0.0,
      startTime: new Date('2025-08-11T08:00:00Z'),
      endTime: new Date('2025-08-11T10:00:00Z'),
    },

    // Kankaria Lake activities
    {
      id: 'activity-lake-walk',
      placeId: 'place-kankaria-lake',
      title: 'Evening Lake Walk',
      description: 'Peaceful walk around the lake with street food',
      expense: 100.0,
      startTime: new Date('2025-08-11T17:00:00Z'),
      endTime: new Date('2025-08-11T19:00:00Z'),
    },

    // Lakshmi Vilas Palace activities
    {
      id: 'activity-palace-tour',
      placeId: 'place-lakshmi-vilas-palace',
      title: 'Palace Tour with Guide',
      description: 'Explore the magnificent palace and its history',
      expense: 500.0,
      startTime: new Date('2025-08-12T10:00:00Z'),
      endTime: new Date('2025-08-12T12:00:00Z'),
    },
    {
      id: 'activity-cultural-show',
      placeId: 'place-lakshmi-vilas-palace',
      title: 'Cultural Performance',
      description: 'Traditional dance and music show',
      expense: 300.0,
      startTime: new Date('2025-08-12T19:00:00Z'),
      endTime: new Date('2025-08-12T21:00:00Z'),
    },

    // Baroda Museum activities
    {
      id: 'activity-museum-visit',
      placeId: 'place-baroque-museum',
      title: 'Museum Exploration',
      description: 'Discover art, history, and cultural artifacts',
      expense: 100.0,
      startTime: new Date('2025-08-12T09:00:00Z'),
      endTime: new Date('2025-08-12T12:00:00Z'),
    },

    // Dwarkadhish Temple activities
    {
      id: 'activity-temple-darshan',
      placeId: 'place-dwarkadhish-temple',
      title: 'Temple Darshan',
      description: 'Morning prayers and temple visit',
      expense: 0.0,
      startTime: new Date('2025-08-13T06:00:00Z'),
      endTime: new Date('2025-08-13T08:00:00Z'),
    },
    {
      id: 'activity-evening-aarti',
      placeId: 'place-dwarkadhish-temple',
      title: 'Evening Aarti',
      description: 'Participate in the evening prayer ceremony',
      expense: 0.0,
      startTime: new Date('2025-08-13T18:00:00Z'),
      endTime: new Date('2025-08-13T19:00:00Z'),
    },

    // Beyt Dwarka activities
    {
      id: 'activity-boat-ride',
      placeId: 'place-beyt-dwarka',
      title: 'Boat Ride to Beyt Dwarka',
      description: 'Scenic boat journey to the island',
      expense: 400.0,
      startTime: new Date('2025-08-13T09:00:00Z'),
      endTime: new Date('2025-08-13T12:00:00Z'),
    },

    // Somnath Temple activities
    {
      id: 'activity-somnath-darshan',
      placeId: 'place-somnath-temple',
      title: 'Temple Darshan',
      description: 'Visit the first Jyotirlinga',
      expense: 0.0,
      startTime: new Date('2025-08-14T06:00:00Z'),
      endTime: new Date('2025-08-14T08:00:00Z'),
    },

    // Somnath Beach activities
    {
      id: 'activity-beach-sunset',
      placeId: 'place-somnath-beach',
      title: 'Beach Sunset Walk',
      description: 'Beautiful sunset view from the beach',
      expense: 0.0,
      startTime: new Date('2025-08-14T17:00:00Z'),
      endTime: new Date('2025-08-14T19:00:00Z'),
    },
    {
      id: 'activity-beach-food',
      placeId: 'place-somnath-beach',
      title: 'Beachside Food Experience',
      description: 'Try local seafood and Gujarati snacks',
      expense: 250.0,
      startTime: new Date('2025-08-14T19:00:00Z'),
      endTime: new Date('2025-08-14T21:00:00Z'),
    },
  ];

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: {},
      create: activity,
    });
  }

  console.log('✅ Activities created');

  // Create a second trip - Gujarat Wildlife Adventure
  const gujaratWildlifeTrip = await prisma.trip.upsert({
    where: { id: 'gujarat-wildlife-2024' },
    update: {},
    create: {
      id: 'gujarat-wildlife-2024',
      ownerId: demoUser.id,
      name: 'Gujarat Wildlife & Nature Adventure',
      description:
        'Discover the diverse wildlife and natural beauty of Gujarat through national parks and sanctuaries.',
      startDate: new Date('2025-08-11'),
      endDate: new Date('2025-08-25'),
      budget: 0,
      isPublic: true,
    },
  });

  console.log('✅ Gujarat Wildlife Trip created');

  // Create stops for wildlife trip
  const wildlifeStops = [
    {
      id: 'stop-gir-forest',
      tripId: gujaratWildlifeTrip.id,
      city: 'Gir',
      startDate: new Date('2025-08-11'),
      endDate: new Date('2025-08-13'),
      notes: 'Explore Gir National Park, home to Asiatic lions',
    },
    {
      id: 'stop-velavadar',
      tripId: gujaratWildlifeTrip.id,
      city: 'Velavadar',
      startDate: new Date('2025-08-13'),
      endDate: new Date('2025-08-16'),
      notes: 'Visit Velavadar Blackbuck National Park',
    },
    {
      id: 'stop-marine-national-park',
      tripId: gujaratWildlifeTrip.id,
      city: 'Kutch',
      startDate: new Date('2025-08-16'),
      endDate: new Date('2025-08-18'),
      notes: 'Explore marine life and coral reefs',
    },
  ];

  for (const stop of wildlifeStops) {
    await prisma.tripStop.upsert({
      where: { id: stop.id },
      update: {},
      create: stop,
    });
  }

  console.log('✅ Wildlife trip stops created');

  // Create places for wildlife trip
  const wildlifePlaces = [
    // Gir Forest places
    {
      id: 'place-gir-national-park',
      tripStopId: 'stop-gir-forest',
      name: 'Gir National Park',
      latitude: 21.1356,
      longitude: 70.7897,
    },
    {
      id: 'place-sasan-gir',
      tripStopId: 'stop-gir-forest',
      name: 'Sasan Gir',
      latitude: 21.1356,
      longitude: 70.7897,
    },

    // Velavadar places
    {
      id: 'place-velavadar-park',
      tripStopId: 'stop-velavadar',
      name: 'Velavadar Blackbuck National Park',
      latitude: 22.0367,
      longitude: 72.0458,
    },

    // Marine National Park places
    {
      id: 'place-marine-park',
      tripStopId: 'stop-marine-national-park',
      name: 'Gulf of Kutch Marine National Park',
      latitude: 22.3039,
      longitude: 69.15,
    },
  ];

  for (const place of wildlifePlaces) {
    await prisma.place.upsert({
      where: { id: place.id },
      update: {},
      create: place,
    });
  }

  console.log('✅ Wildlife places created');

  // Create activities for wildlife trip
  const wildlifeActivities = [
    // Gir National Park activities
    {
      id: 'activity-lion-safari',
      placeId: 'place-gir-national-park',
      title: 'Lion Safari',
      description: 'Jeep safari to spot Asiatic lions and other wildlife',
      expense: 2500.0,
      startTime: new Date('2025-08-11T06:00:00Z'),
      endTime: new Date('2025-08-11T09:00:00Z'),
    },
    {
      id: 'activity-bird-watching',
      placeId: 'place-gir-national-park',
      title: 'Bird Watching Tour',
      description: 'Guided bird watching in the forest',
      expense: 800.0,
      startTime: new Date('2025-08-11T16:00:00Z'),
      endTime: new Date('2025-08-11T18:00:00Z'),
    },

    // Velavadar activities
    {
      id: 'activity-blackbuck-safari',
      placeId: 'place-velavadar-park',
      title: 'Blackbuck Safari',
      description: 'Spot blackbucks and other grassland wildlife',
      expense: 1200.0,
      startTime: new Date('2025-08-14T06:00:00Z'),
      endTime: new Date('2025-08-14T09:00:00Z'),
    },

    // Marine National Park activities
    {
      id: 'activity-snorkeling',
      placeId: 'place-marine-park',
      title: 'Snorkeling Adventure',
      description: 'Explore coral reefs and marine life',
      expense: 1500.0,
      startTime: new Date('2025-08-17T09:00:00Z'),
      endTime: new Date('2025-08-17T12:00:00Z'),
    },
  ];

  for (const activity of wildlifeActivities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: {},
      create: activity,
    });
  }

  console.log('✅ Wildlife activities created');

  // Create a curated New York City trip
  const nycTrip = await prisma.trip.upsert({
    where: { id: 'new-york-city-essentials-2025' },
    update: {},
    create: {
      id: 'new-york-city-essentials-2025',
      ownerId: demoUser.id,
      name: 'New York City Essentials',
      description:
        'Classic NYC highlights across Manhattan and Brooklyn: landmarks, museums, and skyline views.',
      startDate: new Date('2025-09-05'),
      endDate: new Date('2025-09-10'),
      budget: 0,
      isPublic: true,
    },
  });

  console.log('✅ New York City trip created');

  const nycStops = [
    {
      id: 'stop-nyc-manhattan',
      tripId: nycTrip.id,
      city: 'New York',
      startDate: new Date('2025-09-05'),
      endDate: new Date('2025-09-10'),
      notes: 'Stay in Midtown Manhattan; explore key sights and neighborhoods',
    },
  ];

  for (const stop of nycStops) {
    await prisma.tripStop.upsert({
      where: { id: stop.id },
      update: {},
      create: stop,
    });
  }

  console.log('✅ NYC stop created');

  const nycPlaces = [
    {
      id: 'place-statue-of-liberty',
      tripStopId: 'stop-nyc-manhattan',
      name: 'Statue of Liberty',
      latitude: 40.689249,
      longitude: -74.0445,
    },
    {
      id: 'place-central-park',
      tripStopId: 'stop-nyc-manhattan',
      name: 'Central Park',
      latitude: 40.785091,
      longitude: -73.968285,
    },
    {
      id: 'place-times-square',
      tripStopId: 'stop-nyc-manhattan',
      name: 'Times Square',
      latitude: 40.758,
      longitude: -73.9855,
    },
    {
      id: 'place-met-museum',
      tripStopId: 'stop-nyc-manhattan',
      name: 'The Metropolitan Museum of Art',
      latitude: 40.779437,
      longitude: -73.963244,
    },
    {
      id: 'place-brooklyn-bridge',
      tripStopId: 'stop-nyc-manhattan',
      name: 'Brooklyn Bridge',
      latitude: 40.706086,
      longitude: -73.996864,
    },
  ];

  for (const place of nycPlaces) {
    await prisma.place.upsert({
      where: { id: place.id },
      update: {},
      create: place,
    });
  }

  console.log('✅ NYC places created');

  const nycActivities = [
    {
      id: 'activity-liberty-ferry',
      placeId: 'place-statue-of-liberty',
      title: 'Liberty Island Ferry & Pedestal Access',
      description: 'Ferry ride to Liberty Island with pedestal access',
      expense: 3500.0,
      startTime: new Date('2025-09-06T14:00:00Z'),
      endTime: new Date('2025-09-06T17:00:00Z'),
    },
    {
      id: 'activity-central-park-bike',
      placeId: 'place-central-park',
      title: 'Central Park Bike Loop',
      description: 'Leisurely cycle around the park loop',
      expense: 1200.0,
      startTime: new Date('2025-09-06T10:00:00Z'),
      endTime: new Date('2025-09-06T12:00:00Z'),
    },
    {
      id: 'activity-times-square-night',
      placeId: 'place-times-square',
      title: 'Times Square Night Walk',
      description: 'Neon lights, street performers, and photo stops',
      expense: 0.0,
      startTime: new Date('2025-09-05T23:00:00Z'),
      endTime: new Date('2025-09-06T00:00:00Z'),
    },
    {
      id: 'activity-met-guided',
      placeId: 'place-met-museum',
      title: 'Met Museum Guided Tour',
      description: 'Highlights tour of the Met',
      expense: 2500.0,
      startTime: new Date('2025-09-07T15:00:00Z'),
      endTime: new Date('2025-09-07T17:00:00Z'),
    },
    {
      id: 'activity-brooklyn-bridge-sunrise',
      placeId: 'place-brooklyn-bridge',
      title: 'Brooklyn Bridge Sunrise Walk',
      description: 'Sunrise photos and skyline views from the bridge',
      expense: 0.0,
      startTime: new Date('2025-09-08T10:30:00Z'),
      endTime: new Date('2025-09-08T11:30:00Z'),
    },
  ];

  for (const activity of nycActivities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: {},
      create: activity,
    });
  }

  console.log('✅ NYC activities created');

  // Create a curated Chicago trip
  const chicagoTrip = await prisma.trip.upsert({
    where: { id: 'chicago-architecture-culture-2025' },
    update: {},
    create: {
      id: 'chicago-architecture-culture-2025',
      ownerId: demoUser.id,
      name: 'Chicago Architecture & Culture',
      description:
        'Discover Chicago architecture, museums, lakefront, and iconic neighborhoods.',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-05'),
      budget: 0,
      isPublic: true,
    },
  });

  console.log('✅ Chicago trip created');

  const chicagoStops = [
    {
      id: 'stop-chicago-downtown',
      tripId: chicagoTrip.id,
      city: 'Chicago',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-05'),
      notes: 'Base yourself downtown; explore the Loop, Riverwalk, and the lakefront',
    },
  ];

  for (const stop of chicagoStops) {
    await prisma.tripStop.upsert({
      where: { id: stop.id },
      update: {},
      create: stop,
    });
  }

  console.log('✅ Chicago stop created');

  const chicagoPlaces = [
    {
      id: 'place-millennium-park',
      tripStopId: 'stop-chicago-downtown',
      name: 'Millennium Park (Cloud Gate)',
      latitude: 41.8826,
      longitude: -87.6226,
    },
    {
      id: 'place-willis-tower',
      tripStopId: 'stop-chicago-downtown',
      name: 'Willis Tower (Skydeck)',
      latitude: 41.878876,
      longitude: -87.635915,
    },
    {
      id: 'place-navy-pier',
      tripStopId: 'stop-chicago-downtown',
      name: 'Navy Pier',
      latitude: 41.8917,
      longitude: -87.6079,
    },
    {
      id: 'place-art-institute',
      tripStopId: 'stop-chicago-downtown',
      name: 'Art Institute of Chicago',
      latitude: 41.8796,
      longitude: -87.6237,
    },
    {
      id: 'place-chicago-riverwalk',
      tripStopId: 'stop-chicago-downtown',
      name: 'Chicago Riverwalk',
      latitude: 41.888,
      longitude: -87.627,
    },
  ];

  for (const place of chicagoPlaces) {
    await prisma.place.upsert({
      where: { id: place.id },
      update: {},
      create: place,
    });
  }

  console.log('✅ Chicago places created');

  const chicagoActivities = [
    {
      id: 'activity-architecture-cruise',
      placeId: 'place-chicago-riverwalk',
      title: 'Architecture River Cruise',
      description: 'Guided boat tour of Chicago architecture',
      expense: 4500.0,
      startTime: new Date('2025-10-02T16:00:00Z'),
      endTime: new Date('2025-10-02T18:00:00Z'),
    },
    {
      id: 'activity-skydeck-ledge',
      placeId: 'place-willis-tower',
      title: 'Skydeck Ledge Experience',
      description: 'Step onto the glass ledge on the 103rd floor',
      expense: 3000.0,
      startTime: new Date('2025-10-03T15:00:00Z'),
      endTime: new Date('2025-10-03T16:00:00Z'),
    },
    {
      id: 'activity-navy-pier-wheel',
      placeId: 'place-navy-pier',
      title: 'Centennial Wheel Ride',
      description: 'Panoramic views of the skyline and lake',
      expense: 1500.0,
      startTime: new Date('2025-10-03T19:00:00Z'),
      endTime: new Date('2025-10-03T20:00:00Z'),
    },
    {
      id: 'activity-art-institute-highlights',
      placeId: 'place-art-institute',
      title: 'Art Institute Highlights Tour',
      description: 'See the masterworks and special exhibits',
      expense: 2200.0,
      startTime: new Date('2025-10-02T10:00:00Z'),
      endTime: new Date('2025-10-02T12:00:00Z'),
    },
    {
      id: 'activity-cloud-gate-photos',
      placeId: 'place-millennium-park',
      title: 'Cloud Gate Photo Walk',
      description: 'Morning photos at The Bean and gardens',
      expense: 0.0,
      startTime: new Date('2025-10-01T14:00:00Z'),
      endTime: new Date('2025-10-01T15:00:00Z'),
    },
  ];

  for (const activity of chicagoActivities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: {},
      create: activity,
    });
  }

  console.log('✅ Chicago activities created');

  // Create many additional trips for rich analytics data
  const additionalTrips = [];
  const tripTypes = [
    {
      name: 'European Adventure',
      description: 'Exploring historic European cities',
    },
    {
      name: 'Asian Discovery',
      description: 'Cultural journey through Asia',
    },
    {
      name: 'American Road Trip',
      description: 'Cross-country adventure in the USA',
    },
    {
      name: 'African Safari',
      description: 'Wildlife safari experience',
    },
    {
      name: 'South American Explorer',
      description: 'Discovering South America',
    },
    {
      name: 'Middle Eastern Journey',
      description: 'Cultural exploration of the Middle East',
    },
    {
      name: 'Caribbean Getaway',
      description: 'Tropical island hopping',
    },
    {
      name: 'Nordic Adventure',
      description: 'Exploring Scandinavian countries',
    },
    {
      name: 'Mediterranean Cruise',
      description: 'Coastal cities tour',
    },
    {
      name: 'Pacific Island Hopping',
      description: 'Tropical paradise tour',
    },
  ];

  // Create 50+ additional trips with various owners and dates
  for (let i = 0; i < 55; i++) {
    const randomUser =
      createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const randomTripType =
      tripTypes[Math.floor(Math.random() * tripTypes.length)];
    const monthsAgo = Math.floor(Math.random() * 11) + 1; // 1-11 months ago
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsAgo);
    startDate.setDate(Math.floor(Math.random() * 28) + 1);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 3); // 3-17 days trip

    const trip = await prisma.trip.create({
      data: {
        name: `${randomTripType.name} ${i + 1}`,
        description: randomTripType.description,
        startDate,
        endDate,
        ownerId: randomUser.id,
        createdAt: startDate,
        // Make some trips public (about 30%)
        isPublic: Math.random() < 0.3,
      },
    });

    additionalTrips.push(trip);

    // Create 1-3 stops per trip
    const numStops = Math.floor(Math.random() * 3) + 1;
    const cities = [
      'New York',
      'London',
      'Paris',
      'Tokyo',
      'Beijing',
      'Moscow',
      'Delhi',
      'Mumbai',
      'São Paulo',
      'Mexico City',
      'Dubai',
      'Sydney',
      'Toronto',
    ];

    for (let j = 0; j < numStops; j++) {
      const stopStartDate = new Date(startDate);
      stopStartDate.setDate(
        stopStartDate.getDate() +
          j *
            Math.floor(
              (endDate.getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24) /
                numStops,
            ),
      );
      const stopEndDate = new Date(stopStartDate);
      stopEndDate.setDate(
        stopEndDate.getDate() + Math.floor(Math.random() * 4) + 1,
      );

      const tripStop = await prisma.tripStop.create({
        data: {
          tripId: trip.id,
          city: cities[Math.floor(Math.random() * cities.length)],
          startDate: stopStartDate,
          endDate: stopEndDate,
        },
      });

      // Create 1-2 places per stop
      const numPlaces = Math.floor(Math.random() * 2) + 1;
      const placeNames = [
        'Central Plaza',
        'Historic District',
        'Museum Quarter',
        'Beach Front',
        'Mountain View',
        'City Center',
        'Cultural Hub',
        'Shopping District',
      ];

      for (let k = 0; k < numPlaces; k++) {
        const place = await prisma.place.create({
          data: {
            tripStopId: tripStop.id,
            name: `${placeNames[Math.floor(Math.random() * placeNames.length)]} - ${j}-${k}`,
            latitude: parseFloat((Math.random() * 180 - 90).toFixed(6)),
            longitude: parseFloat((Math.random() * 360 - 180).toFixed(6)),
          },
        });

        // Create 1-4 activities per place
        const numActivities = Math.floor(Math.random() * 4) + 1;
        const activityTypes = [
          { title: 'Sightseeing Tour', baseExpense: 50 },
          { title: 'Museum Visit', baseExpense: 25 },
          { title: 'Local Food Experience', baseExpense: 75 },
          { title: 'Adventure Activity', baseExpense: 150 },
          { title: 'Cultural Show', baseExpense: 80 },
          { title: 'Shopping Experience', baseExpense: 200 },
          { title: 'Beach Activity', baseExpense: 40 },
          { title: 'Nature Walk', baseExpense: 30 },
          { title: 'Historical Tour', baseExpense: 60 },
          { title: 'Nightlife Experience', baseExpense: 120 },
        ];

        for (let l = 0; l < numActivities; l++) {
          const activityType =
            activityTypes[Math.floor(Math.random() * activityTypes.length)];
          const activityDate = new Date(stopStartDate);
          activityDate.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM start
          const activityEndDate = new Date(activityDate);
          activityEndDate.setHours(
            activityEndDate.getHours() + Math.floor(Math.random() * 4) + 1,
          );

          const expense = activityType.baseExpense + (Math.random() * 100 - 50); // ±50 variation

          await prisma.activity.create({
            data: {
              placeId: place.id,
              title: `${activityType.title} ${l + 1}`,
              description: `Exciting ${activityType.title.toLowerCase()} experience`,
              expense: Math.max(10, expense), // Minimum 10
              startTime: activityDate,
              endTime: activityEndDate,
            },
          });
        }
      }
    }
  }

  console.log(
    `✅ Created ${additionalTrips.length} additional trips with places and activities for rich analytics`,
  );

  // Create a few more admin users for variety
  const additionalAdmins = [
    {
      name: 'Jane Admin',
      email: 'jane.admin@globetrotter.com',
      city: 'San Francisco',
      country: 'USA',
    },
    {
      name: 'Mike Administrator',
      email: 'mike.admin@globetrotter.com',
      city: 'Toronto',
      country: 'Canada',
    },
  ];

  for (const adminData of additionalAdmins) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        passwordHash: adminPassword,
        city: adminData.city,
        country: adminData.country,
        role: 'ADMIN',
      },
    });
  }

  console.log('✅ Created additional admin users');

  console.log('🎉 Database seeding completed successfully!');
  console.log('📱 Demo user credentials: demo@globetrotter.com / demo123');
  console.log('🗺️  Created 2 sample trips with stops, places, and activities');

  // Show budget summary
  console.log('\n💰 Budget Summary:');
  console.log('Gujarat Heritage Trip:');
  console.log('  - Sabarmati Ashram: $350.00 (Tour: $200 + Workshop: $150)');
  console.log('  - Jama Masjid: $0.00 (Free visit)');
  console.log('  - Kankaria Lake: $100.00 (Evening walk)');
  console.log('  - Lakshmi Vilas Palace: $800.00 (Tour: $500 + Show: $300)');
  console.log('  - Baroda Museum: $100.00 (Museum visit)');
  console.log('  - Dwarkadhish Temple: $0.00 (Free darshan + aarti)');
  console.log('  - Beyt Dwarka: $400.00 (Boat ride)');
  console.log('  - Somnath Temple: $0.00 (Free darshan)');
  console.log('  - Somnath Beach: $250.00 (Food experience)');
  console.log('  Total Expected: $2,000.00');

  console.log('\nGujarat Wildlife Trip:');
  console.log(
    '  - Gir National Park: $3,300.00 (Safari: $2,500 + Bird watching: $800)',
  );
  console.log('  - Velavadar: $1,200.00 (Blackbuck safari)');
  console.log('  - Marine National Park: $1,500.00 (Snorkeling)');
  console.log('  Total Expected: $6,000.00');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
