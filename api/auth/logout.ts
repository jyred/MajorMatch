import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // For now, just return success
    // This will be updated when proper session management is implemented
    return res.json({ message: "로그아웃되었습니다" });
  } catch (error: any) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다" });
  }
}
