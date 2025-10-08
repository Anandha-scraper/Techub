import express from 'express';
import { connectToDatabase } from '../server/database/connection.js';
import mongoose from 'mongoose';

// Import models directly to avoid path issues
import { AdminUser } from '../server/models/AdminUser.js';
import { StudentUser } from '../server/models/StudentUser.js';
import { Student } from '../server/models/Student.js';
import { Feedback } from '../server/models/Feedback.js';
import { PointTransaction } from '../server/models/PointTransaction.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isInitialized = false;
let initializationError: Error | null = null;

async function ensureInitialized() {
  if (isInitialized) return;
  if (initializationError) throw initializationError;
  
  try {
    console.log('Initializing serverless function...');
    await connectToDatabase();
    await registerRoutes(app);
    isInitialized = true;
    console.log('Serverless function initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
    initializationError = error as Error;
    throw error;
  }
}

async function registerRoutes(app: any) {
  // Health check endpoint
  app.get("/api/health", async (req: any, res: any) => {
    try {
      res.json({ 
        success: true, 
        message: "API is working",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Health check failed",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req: any, res: any) => {
    try {
      const { username, password, role } = req.body;

      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required" });
      }

      // Normalize input
      const rawUsername: string = String(username).trim();
      const normalizedUsername = role === 'student' ? rawUsername.toUpperCase() : rawUsername;
      const normalizedPassword: string = String(password).trim();

      // Validate against MongoDB (hashed passwords)
      let userDoc: any = null;
      if (role === 'student') {
        userDoc = await StudentUser.findOne({ username: normalizedUsername });
      } else {
        userDoc = await AdminUser.findOne({ username: normalizedUsername });
      }
      
      if (!userDoc) {
        console.warn(`[auth] user not found: ${normalizedUsername}`);
        return res.status(401).json({ message: "Invalid credentials: user not found" });
      }
      
      if (userDoc.role !== role) {
        console.warn(`[auth] role mismatch for ${normalizedUsername}. expected=${role} actual=${userDoc.role}`);
        return res.status(401).json({ message: "Invalid credentials: role mismatch" });
      }

      const isMatch = await userDoc.comparePassword(normalizedPassword);
      if (!isMatch) {
        console.warn(`[auth] password mismatch for ${normalizedUsername}`);
        return res.status(401).json({ message: "Invalid credentials: password mismatch" });
      }

      // Require approval for admins (master bypasses)
      if (userDoc.role === 'admin' && userDoc.approved !== true) {
        return res.status(403).json({ message: "Admin not yet approved by master" });
      }

      // Update lastLogin for admin/master on successful login
      try {
        if (userDoc.role === 'admin' || userDoc.role === 'master') {
          await AdminUser.updateOne({ _id: userDoc._id }, { $set: { lastLogin: new Date() } });
        }
      } catch {}

      res.json({
        success: true,
        user: { id: userDoc._id.toString(), username: userDoc.username, role: userDoc.role }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Add more routes as needed...
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

