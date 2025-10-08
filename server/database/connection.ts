import 'dotenv/config';
import mongoose from 'mongoose';

let isConnected = false;

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

  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Optimized connection for serverless
    await mongoose.connect(MONGODB_URI, { 
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for serverless
      connectTimeoutMS: 5000,
      maxPoolSize: 1, // Maintain only 1 connection for serverless
      minPoolSize: 0, // Allow connection to close when idle
      maxIdleTimeMS: 10000, // Close connections after 10 seconds of inactivity
    });
    
    isConnected = true;
    console.log('Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    isConnected = false;
    throw error;
  }
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
