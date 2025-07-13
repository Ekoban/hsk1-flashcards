// Simple test API route
export default function handler(req: any, res: any) {
  console.log(`🔍 Simple test API called - Method: ${req.method}`);
  
  res.status(200).json({
    success: true,
    message: 'API route is working!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
