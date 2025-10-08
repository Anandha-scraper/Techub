// CommonJS health API
module.exports = function handler(req, res) {
  console.log('Health API called:', req.method, req.url);
  
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    success: true,
    message: 'Health check working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};