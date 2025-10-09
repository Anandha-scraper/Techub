import express from "express";
import { registerRoutes } from "../server/routes";
import { connectToDatabase } from "../server/database/connection";
import serverless from "serverless-http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (isInitialized) return;
  
  // Prevent multiple concurrent initializations
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      await connectToDatabase();
      // Register routes without creating a server
      await registerRoutes(app, false);
      isInitialized = true;
    } catch (error) {
      isInitialized = false;
      initializationPromise = null;
      throw error;
    }
  })();
  
  return initializationPromise;
}

const handler = serverless(app);

export default async function(req: any, res: any) {
  // Lightweight health check that doesn't require DB init
  if (req.method === 'GET' && (req.url === '/api/health' || req.url?.startsWith('/api/health'))) {
    return res.status(200).json({ success: true, message: 'API reachable', timestamp: new Date().toISOString() });
  }
  
  try {
    await ensureInitialized();
  } catch (err: any) {
    const message = err?.message || 'Initialization error';
    console.error('[api] init error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message });
    }
    return;
  }
  
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  memory: 1024,
  maxDuration: 10
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

