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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다');
    }

    console.log("🏗️ 데이터베이스 스키마 생성 시작...");
    
    const sql = postgres(process.env.DATABASE_URL);
    
    // Create users table
    await sql`
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

    // Create assessments table
    await sql`
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

    // Create chat_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        assessment_id VARCHAR REFERENCES assessments(id),
        title TEXT,
        messages JSON NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create satisfaction_surveys table
    await sql`
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

    // Create bookmarked_majors table
    await sql`
      CREATE TABLE IF NOT EXISTS bookmarked_majors (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        major_name VARCHAR NOT NULL,
        major_category VARCHAR,
        bookmark_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create user_preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL UNIQUE,
        preferred_industries JSON,
        career_goals TEXT,
        work_environment_preferences JSON,
        salary_expectations INTEGER,
        work_life_balance_importance INTEGER,
        location_preferences JSON,
        additional_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_user_id ON satisfaction_surveys(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookmarked_majors_user_id ON bookmarked_majors(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);`;

    console.log("✅ 모든 테이블 생성 완료!");

    // 테이블 목록 확인
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    await sql.end();

    return res.json({
      success: true,
      message: "데이터베이스 스키마가 성공적으로 생성되었습니다!",
      tables: tables.map(t => t.table_name),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ 스키마 생성 실패:", error);
    
    return res.status(500).json({
      success: false,
      message: "스키마 생성 중 오류가 발생했습니다",
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
