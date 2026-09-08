const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri) {
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    }

    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(uri, {
      dbName: 'real-estate-db',
    });

    console.log(`MongoDB connected: ${conn.connection.host} (in-memory fallback)`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
