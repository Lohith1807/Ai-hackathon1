const mongoose = require('mongoose');
require('dotenv').config();

// Global cache for serverless environments (like Vercel)
// This prevents multiple connection instances during cold starts
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
let initError = null;

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  try {
    const dbUri = process.env.DB_URL;
    if (!dbUri) {
      throw new Error('DB_URL is not defined in environment variables');
    }

    mongoose.set('strictQuery', false);

    if (!cached.promise) {
      cached.promise = mongoose.connect(dbUri, {
        serverSelectionTimeoutMS: 10000, 
        socketTimeoutMS: 45000,
        bufferCommands: false, // Don't buffer commands if connection fails
      }).then((mongooseInstance) => {
        console.log('--- MongoDB Connected ---');
        return mongooseInstance;
      });
    }
    
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    initError = error.message;
    cached.promise = null; // reset promise so next request can retry
    throw error;
  }
};

module.exports = {
  connectDB,
  getInitError: () => initError,
  isConnected: () => !!cached.conn && mongoose.connection.readyState === 1,
  mongoose
};
