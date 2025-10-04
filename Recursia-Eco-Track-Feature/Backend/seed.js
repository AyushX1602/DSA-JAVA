const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { hashPassword } = require('./utils/helpers');
const logger = require('./utils/logger');

// Simplified test data for seeding
const testUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    password: 'Password123',
    role: 'user'
  },
  {
    name: 'Test Driver',
    email: 'driver1@ecotrack.com',
    phone: '+1234567891',
    password: 'Driver123',
    role: 'driver'
  },
  {
    name: 'Admin User',
    email: 'admin@ecotrack.com',
    phone: '+1234567892',
    password: 'Admin123',
    role: 'admin'
  }
];

/**
 * Seed the database with initial test data
 * This script should be run only in development environment
 */
async function seedDatabase() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Check if we're in production - never seed production data!
    if (process.env.NODE_ENV === 'production') {
      logger.error('❌ Cannot seed database in production environment!');
      process.exit(1);
    }

    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecotrack');
      logger.info('📦 Connected to MongoDB for seeding');
    }

    // Clear existing data (be careful!)
    logger.info('🧹 Clearing existing data...');
    await User.deleteMany({});
    logger.info('✅ Existing data cleared');

    // Seed Users
    logger.info('👥 Seeding users...');
    const userPromises = testUsers.map(async (userData) => {
      const hashedPassword = await hashPassword(userData.password);
      return User.create({
        ...userData,
        password: hashedPassword
      });
    });
    const createdUsers = await Promise.all(userPromises);
    logger.info(`✅ Created ${createdUsers.length} users`);

    // Summary
    logger.info('🎉 Database seeding completed successfully!');
    logger.info(`📊 Summary:
      - Users: ${createdUsers.length}`);

    // Log test credentials for development
    logger.info('🔑 Test Credentials:');
    logger.info('👤 Test User: john.doe@example.com / Password123');
    logger.info('🚛 Test Driver: driver1@ecotrack.com / Driver123');
    logger.info('👨‍💼 Test Admin: admin@ecotrack.com / Admin123');

  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Clear all data from the database
 * Use with caution!
 */
async function clearDatabase() {
  try {
    logger.info('🧹 Clearing database...');

    if (process.env.NODE_ENV === 'production') {
      logger.error('❌ Cannot clear database in production environment!');
      process.exit(1);
    }

    await User.deleteMany({});
    logger.info('✅ Database cleared successfully');
  } catch (error) {
    logger.error('❌ Error clearing database:', error);
    throw error;
  }
}

/**
 * Reset database - clear and reseed
 */
async function resetDatabase() {
  try {
    logger.info('🔄 Resetting database...');
    await clearDatabase();
    await seedDatabase();
    logger.info('🎉 Database reset completed!');
  } catch (error) {
    logger.error('❌ Error resetting database:', error);
    throw error;
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];

  async function runCommand() {
    try {
      // Connect to database
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecotrack');

      switch (command) {
        case 'seed':
          await seedDatabase();
          break;
        case 'clear':
          await clearDatabase();
          break;
        case 'reset':
          await resetDatabase();
          break;
        default:
          console.log(`
Usage: node seed.js <command>

Commands:
  seed   - Seed the database with test data
  clear  - Clear all data from the database
  reset  - Clear and reseed the database

Examples:
  node seed.js seed
  node seed.js clear
  node seed.js reset
          `);
      }
    } catch (error) {
      logger.error('Command failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  }

  runCommand();
}

module.exports = {
  seedDatabase,
  clearDatabase,
  resetDatabase
};