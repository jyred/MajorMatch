import type { VercelRequest, VercelResponse } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { storage } = await import('../storage');
    const { loginUserSchema } = await import('@shared/schema');
    
    const { username, password } = loginUserSchema.parse(req.body);
    
    const user = await storage.validateUser(username, password);
    if (!user) {
      return res.status(401).json({ message: "사용자명 또는 비밀번호가 올바르지 않습니다" });
    }

    // Don't send password back
    const { password: _, ...userResponse } = user;
    return res.json({ user: userResponse });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ 
        message: "입력 정보를 확인해주세요",
        errors: error.errors 
      });
    }
    console.error("Login error:", error);
    return res.status(500).json({ message: "로그인 중 오류가 발생했습니다" });
  }
}
