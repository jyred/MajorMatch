import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

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

  // 프로덕션 환경에서는 비활성화
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'This endpoint is not available in production' });
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

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다');
    }

    // 데이터베이스 연결 테스트
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    // 간단한 쿼리 테스트 (테이블 목록 조회)
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log("✅ 데이터베이스 연결 성공!");
    console.log("테이블 목록:", result);

    // 사용자 테이블 존재 확인
    const userTableExists = result.some((row: any) => 
      row.table_name === 'users'
    );

    // 연결 종료
    await sql.end();

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
