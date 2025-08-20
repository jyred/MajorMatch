import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Node.js Runtime 설정
export const config = {
  runtime: 'nodejs18.x',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasDatabase: !!process.env.DATABASE_URL,
      vercelRegion: process.env.VERCEL_REGION || 'unknown',
      nodejs: process.version,
    };

    return res.json(status);
  } catch (error: any) {
    console.error("Health check error:", error);
    return res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
}
