require('dotenv').config();
const connectDB = require('../config/db');
const Property = require('../models/Property');
const mongoose = require('mongoose');

const removeSampleProperties = async () => {
  try {
    await connectDB();
    const result = await Property.deleteMany({ isSample: true });
    console.log(`Removed ${result.deletedCount} sample properties`);
  } finally {
    await mongoose.disconnect();
  }
};

removeSampleProperties().catch((error) => {
  console.error('Sample property removal failed:', error.message);
  process.exitCode = 1;
});
