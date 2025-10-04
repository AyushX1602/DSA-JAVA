const mongoose = require('mongoose');
const Pickup = require('../models/Pickup');
require('dotenv').config();

const clearOldTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Delete pickups older than 1 day
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const result = await Pickup.deleteMany({
      'scheduling.requestedAt': { $lt: oneDayAgo }
    });

    console.log(`🗑️ Deleted ${result.deletedCount} old test pickups`);

    // Optionally, you can also clear all pickups with:
    // const result = await Pickup.deleteMany({});
    // console.log(`🗑️ Deleted all ${result.deletedCount} pickups`);

    await mongoose.connection.close();
    console.log('✅ Database cleanup completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error clearing test data:', error);
    process.exit(1);
  }
};

clearOldTestData();
