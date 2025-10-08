// CommonJS API handler - compatible with Vercel
module.exports = function handler(req, res) {
  console.log('API called:', req.method, req.url);
  
  // Always set JSON header
  res.setHeader('Content-Type', 'application/json');
  
  // Simple response
  res.status(200).json({
    success: true,
    message: 'CommonJS API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};