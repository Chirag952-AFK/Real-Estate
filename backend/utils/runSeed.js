require('dotenv').config();
const connectDB = require('../config/db');
const { seedSampleProperties } = require('./seedProperties');
const mongoose = require('mongoose');

const runSeed = async () => {
  try {
    await connectDB();
    await seedSampleProperties();
  } finally {
    await mongoose.disconnect();
  }
};

runSeed().catch((error) => {
  console.error('Sample property seeding failed:', error.message);
  process.exitCode = 1;
});
