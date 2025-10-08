// Simple test API endpoint to debug the issue
export default async function handler(req: any, res: any) {
  console.log('Test API called:', req.method, req.url);
  
  try {
    // Always return JSON
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'GET' && req.url === '/api/test') {
      res.status(200).json({
        success: true,
        message: 'Test endpoint working',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        environment: process.env.NODE_ENV || 'development'
      });
    } else if (req.method === 'POST' && req.url === '/api/auth/login') {
      res.status(401).json({
        success: false,
        message: 'Test login endpoint - credentials required',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        method: req.method,
        url: req.url
      });
    }
  } catch (error) {
    console.error('Test API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Test API error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}