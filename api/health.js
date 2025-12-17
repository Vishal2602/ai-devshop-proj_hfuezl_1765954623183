/**
 * Health Check Endpoint - GET /api/health
 * Vercel Serverless Function
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
