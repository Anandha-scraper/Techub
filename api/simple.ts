// Ultra-simple API handler - this MUST work
export default function handler(req: any, res: any) {
  console.log('=== API CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  
  // Always set JSON header
  res.setHeader('Content-Type', 'application/json');
  
  // Simple response
  res.status(200).json({
    success: true,
    message: 'Simple API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}