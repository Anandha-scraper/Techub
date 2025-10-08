import express from 'express';
import { registerRoutes } from '../server/routes';
import { connectToDatabase } from '../server/database/connection';

// Create a single Express app instance reused across invocations
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isInitialized = false;
let initializationError: Error | null = null;

async function ensureInitialized() {
  if (isInitialized) return;
  if (initializationError) throw initializationError;
  
  try {
    await connectToDatabase();
    await registerRoutes(app);
    isInitialized = true;
  } catch (error) {
    initializationError = error as Error;
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  try {
    await ensureInitialized();
    // Delegate to Express
    return (app as any)(req, res);
  } catch (error) {
    console.error('API Handler Error:', error);
    
    // Return proper JSON error response
    res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
}

