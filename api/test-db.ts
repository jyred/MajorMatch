import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("🔍 데이터베이스 연결 테스트 시작...");
    
    // 환경변수 확인
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_PREVIEW: process.env.DATABASE_URL?.substring(0, 30) + '...',
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV
    };

    console.log("환경변수 체크:", envCheck);

    // 데이터베이스 연결 테스트
    const { db } = await import('../server/db');
    
    // 간단한 쿼리 테스트 (테이블 목록 조회)
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("✅ 데이터베이스 연결 성공!");
    console.log("테이블 목록:", result);

    // 사용자 테이블 존재 확인
    const userTableExists = result.some((row: any) => 
      row.table_name === 'users'
    );

    return res.json({
      success: true,
      message: "데이터베이스 연결 성공!",
      environment: envCheck,
      tables: result,
      userTableExists,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ 데이터베이스 연결 실패:", error);
    
    return res.status(500).json({
      success: false,
      message: "데이터베이스 연결 실패",
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
