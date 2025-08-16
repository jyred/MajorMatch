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
    console.log("🔧 데이터베이스 스키마 생성 시작...");
    
    const { db } = await import('../server/db');
    
    // 테이블 생성 SQL
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id VARCHAR(9) NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    const createAssessmentsTable = `
      CREATE TABLE IF NOT EXISTS assessments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id),
        responses JSON NOT NULL,
        riasec_scores JSON NOT NULL,
        recommended_majors JSON NOT NULL,
        explanation TEXT NOT NULL,
        similar_cases_feedback TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    const createChatSessionsTable = `
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id),
        messages JSON NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    const createSatisfactionSurveysTable = `
      CREATE TABLE IF NOT EXISTS satisfaction_surveys (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        assessment_id VARCHAR REFERENCES assessments(id) NOT NULL,
        overall_satisfaction INTEGER NOT NULL,
        recommendation_accuracy INTEGER NOT NULL,
        system_usability INTEGER NOT NULL,
        would_recommend BOOLEAN NOT NULL,
        feedback TEXT,
        selected_major VARCHAR,
        major_satisfaction INTEGER,
        follow_up_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    const createBookmarkedMajorsTable = `
      CREATE TABLE IF NOT EXISTS bookmarked_majors (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        major_name VARCHAR NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    const createUserPreferencesTable = `
      CREATE TABLE IF NOT EXISTS user_preferences (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        dark_mode BOOLEAN DEFAULT FALSE,
        email_notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // 테이블들 생성
    const tables = [
      { name: 'users', sql: createUsersTable },
      { name: 'assessments', sql: createAssessmentsTable },
      { name: 'chat_sessions', sql: createChatSessionsTable },
      { name: 'satisfaction_surveys', sql: createSatisfactionSurveysTable },
      { name: 'bookmarked_majors', sql: createBookmarkedMajorsTable },
      { name: 'user_preferences', sql: createUserPreferencesTable }
    ];

    const results: string[] = [];
    
    for (const table of tables) {
      try {
        await db.execute(table.sql);
        results.push(`✅ ${table.name} 테이블 생성 완료`);
        console.log(`✅ ${table.name} 테이블 생성 완료`);
      } catch (error: any) {
        results.push(`❌ ${table.name} 테이블 생성 실패: ${error.message}`);
        console.error(`❌ ${table.name} 테이블 생성 실패:`, error);
      }
    }

    // 생성된 테이블 목록 확인
    const tablesResult = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    return res.json({
      success: true,
      message: "스키마 생성 완료!",
      results,
      tables: tablesResult,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ 스키마 생성 실패:", error);
    
    return res.status(500).json({
      success: false,
      message: "스키마 생성 실패",
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
