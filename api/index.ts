import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Self-contained models to avoid import issues
const AdminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 50 },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['master', 'admin'], required: true },
  approved: { type: Boolean, default: function (this: any) { return this.role === 'admin' ? false : true; } },
  lastLogin: { type: Date }
}, { timestamps: true });

const StudentUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, uppercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student'], default: 'student' }
}, { timestamps: true });

// Hash password before saving
AdminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

StudentUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password methods
AdminUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

StudentUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const AdminUser = mongoose.model('AdminUser', AdminUserSchema);
const StudentUser = mongoose.model('StudentUser', StudentUserSchema);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isInitialized = false;
let initializationError: Error | null = null;

async function connectToDatabase(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  const DB_NAME = process.env.DB_NAME || 'techub';
  
  if (!MONGODB_URI) {
    const error = new Error('MONGODB_URI environment variable is not set');
    console.error('Database connection failed:', error.message);
    throw error;
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
    
    console.log('Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    throw error;
  }
}

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