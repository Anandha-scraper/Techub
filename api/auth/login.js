// JavaScript login API - no TypeScript issues
export default function handler(req, res) {
  console.log('Login API called:', req.method, req.url);
  
  // Always set JSON header
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'POST') {
    // Simple login response
    res.status(401).json({
      success: false,
      message: 'Login endpoint working - credentials required',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed',
      method: req.method
    });
  }
}