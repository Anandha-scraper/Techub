import express from "express";
import serverless from "serverless-http";

// Simple in-memory storage for demo purposes
// In production, you'd want to use a proper database
const users = [
  { id: "1", username: "ADMIN", password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8K8K8", role: "admin", approved: true },
  { id: "2", username: "STUDENT1", password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8K8K8", role: "student" }
];

const app = express();
app.use(express.json());

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

    // Find user
    const user = users.find(u => u.username === normalizedUsername && u.role === role);
    
    if (!user) {
      console.warn(`[auth] user not found: ${normalizedUsername}`);
      return res.status(401).json({ message: "Invalid credentials: user not found" });
    }

    // Simple password check (in production, use proper bcrypt)
    const isMatch = normalizedPassword === "password123"; // Demo password
    
    if (!isMatch) {
      console.warn(`[auth] password mismatch for ${normalizedUsername}`);
      return res.status(401).json({ message: "Invalid credentials: password mismatch" });
    }

    // Require approval for admins
    if (user.role === 'admin' && !user.approved) {
      return res.status(403).json({ message: "Admin not yet approved by master" });
    }

    res.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role }
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
  maxDuration: 30
};