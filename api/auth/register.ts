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
    const { storage } = await import('../server/storage');
    const { insertUserSchema } = await import('../shared/schema');
    
    const userData = insertUserSchema.parse(req.body);
    
    // Check if username or student ID already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: "이미 사용 중인 사용자명입니다" });
    }

    const existingStudent = await storage.getUserByStudentId(userData.studentId);
    if (existingStudent) {
      return res.status(400).json({ message: "이미 등록된 학번입니다" });
    }

    const user = await storage.createUser(userData);
    
    // Don't send password back
    const { password, ...userResponse } = user;
    return res.status(201).json({ user: userResponse });
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.errors) {
      return res.status(400).json({ 
        message: "입력 정보를 확인해주세요",
        errors: error.errors 
      });
    }
    return res.status(500).json({ message: "회원가입 중 오류가 발생했습니다" });
  }
}
