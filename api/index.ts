import express from "express";
import { registerRoutes } from "../server/routes";
import { connectToDatabase } from "../server/database/connection";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isInitialized = false;
async function ensureInitialized(): Promise<void> {
  if (isInitialized) return;
  await connectToDatabase();
  await registerRoutes(app);
  isInitialized = true;
}

export default async function handler(req: any, res: any) {
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
  return (app as any)(req, res);
}

