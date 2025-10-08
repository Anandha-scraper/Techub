// Simplified API handler that handles initialization errors gracefully
import express from 'express';

const app = express();
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Health check working',
    timestamp: new Date().toISOString()
  });
});

// Simple login endpoint
app.post('/api/auth/login', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Login endpoint working - credentials required',
    timestamp: new Date().toISOString()
  });
});

export default async function handler(req: any, res: any) {
  try {
    // Delegate to Express
    return (app as any)(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Handler error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}