import express from "express";
import serverless from "serverless-http";
import { connectToDatabase } from "../server/database/connection";
import { registerRoutes } from "../server/routes";

// Global connection state
let isConnected = false;

const app = express();
app.use(express.json());

// Middleware to ensure database connection
app.use(async (req, res, next) => {
  try {
    if (!isConnected) {
      await connectToDatabase();
      isConnected = true;
    }
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ 
      success: false, 
      message: "Database connection failed",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Initialize routes lazily on first request
let routesInitialized = false;
let routesPromise: Promise<void> | null = null;

const initializeRoutes = async () => {
  if (routesInitialized) return;
  if (routesPromise) return routesPromise;
  
  routesPromise = registerRoutes(app, false);
  await routesPromise;
  routesInitialized = true;
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const handler = serverless(app);

export default async function(req: any, res: any) {
  // Ensure routes are initialized before handling request
  await initializeRoutes();
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  memory: 1024,
  maxDuration: 10
};