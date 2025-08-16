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
    const { db } = await import('../server/db');
    const { users } = await import('../shared/schema');
    const { eq } = await import('drizzle-orm');
    const bcrypt = await import('bcryptjs');

    console.log("🌱 시드 데이터 생성 시작...");
    
    // 테스트 사용자들 데이터
    const testUsers = [
      {
        studentId: "202410001",
        username: "testuser1",
        password: "password123",
      },
      {
        studentId: "202410002", 
        username: "testuser2",
        password: "password123",
      },
      {
        studentId: "202410003",
        username: "admin",
        password: "admin123",
      }
    ];

    const results: string[] = [];
    
    for (const userData of testUsers) {
      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // 중복 확인
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, userData.username));
        
      if (existing.length === 0) {
        await db.insert(users).values({
          studentId: userData.studentId,
          username: userData.username,
          password: hashedPassword,
        });
        results.push(`✅ 사용자 생성 완료: ${userData.username}`);
      } else {
        results.push(`⚠️  이미 존재하는 사용자: ${userData.username}`);
      }
    }
    
    // 생성된 사용자 목록 출력
    const allUsers = await db.select({
      id: users.id,
      studentId: users.studentId,
      username: users.username,
      createdAt: users.createdAt
    }).from(users);
    
    return res.json({
      message: "시드 데이터 생성 완료!",
      results,
      users: allUsers
    });
    
  } catch (error: any) {
    console.error("❌ 시드 데이터 생성 실패:", error);
    return res.status(500).json({ 
      message: "시드 데이터 생성 실패", 
      error: error.message 
    });
  }
}
