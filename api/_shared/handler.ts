import express from 'express';
import { registerRoutes } from '../../server/routes';
import { connectToDatabase } from '../../server/database/connection';

// Create a single Express app instance reused across invocations
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isInitialized = false;
async function ensureInitialized() {
  if (isInitialized) return;
  await connectToDatabase();
  await registerRoutes(app);
  isInitialized = true;
}

export default async function handler(req: any, res: any) {
  await ensureInitialized();
  // Delegate to Express
  return (app as any)(req, res);
}