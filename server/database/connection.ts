import 'dotenv/config';
import mongoose from 'mongoose';

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

export const connectToDatabase = async (): Promise<void> => {
  const MONGODB_URI = process.env.MONGODB_URI;
  const DB_NAME = process.env.DB_NAME || 'techub';
  
  if (!MONGODB_URI) {
    const error = new Error('MONGODB_URI environment variable is not set');
    console.error('Database connection failed:', error.message);
    throw error;
  }
  
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      console.log('Attempting to connect to MongoDB...');
      
      // Optimized connection for serverless
      await mongoose.connect(MONGODB_URI, { 
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 3000, // Reduced timeout for faster failure detection
        connectTimeoutMS: 3000,
        socketTimeoutMS: 3000,
        maxPoolSize: 1, // Maintain only 1 connection for serverless
        minPoolSize: 0, // Allow connection to close when idle
        maxIdleTimeMS: 5000, // Close connections after 5 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering for serverless
        retryWrites: true,
        retryReads: true,
        // Additional serverless optimizations
        heartbeatFrequencyMS: 10000,
      });
      
      isConnected = true;
      console.log('Connected to MongoDB Atlas successfully');
    } catch (error) {
      console.error('Error connecting to MongoDB Atlas:', error);
      isConnected = false;
      connectionPromise = null; // Reset so we can retry
      throw error;
    }
  })();

  return connectionPromise;
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('Disconnected from MongoDB Atlas');
  } catch (error) {
    console.error('Error disconnecting from MongoDB Atlas:', error);
    throw error;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});
