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

// Register all routes from the main server
await registerRoutes(app, false);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const handler = serverless(app);

export default async function(req: any, res: any) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  memory: 1024,
  maxDuration: 10
};