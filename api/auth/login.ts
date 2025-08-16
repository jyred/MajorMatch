import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// Define users table schema
const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id", { length: 9 }).notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define validation schema for login
const loginUserSchema = z.object({
  username: z.string().min(1, "사용자명을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요")
});

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
    console.log("🔄 로그인 요청 시작:", { username: req.body?.username });
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다');
    }

    // Validate input data
    console.log("📝 입력 데이터 검증 중...");
    const { username, password } = loginUserSchema.parse(req.body);
    console.log("✅ 입력 데이터 검증 완료:", { username });

    // Setup database connection
    console.log("🔗 데이터베이스 연결 중...");
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);
    console.log("✅ 데이터베이스 연결 완료");
    
    // Find user by username
    console.log("👤 사용자 조회 중:", username);
    const foundUsers = await db.select().from(users).where(eq(users.username, username));
    
    if (foundUsers.length === 0) {
      console.log("❌ 사용자를 찾을 수 없음:", username);
      await sql.end();
      return res.status(401).json({ message: "사용자명 또는 비밀번호가 올바르지 않습니다" });
    }

    const user = foundUsers[0];
    console.log("✅ 사용자 조회 완료:", user.id);

    // Verify password
    console.log("🔐 비밀번호 검증 중...");
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log("❌ 비밀번호 불일치");
      await sql.end();
      return res.status(401).json({ message: "사용자명 또는 비밀번호가 올바르지 않습니다" });
    }
    
    console.log("✅ 비밀번호 검증 완료");

    // Close database connection
    await sql.end();
    console.log("🔚 데이터베이스 연결 종료");

    // Don't send password back
    const { password: _, ...userResponse } = user;
    console.log("🎉 로그인 성공!");
    return res.json({ user: userResponse });
  } catch (error: any) {
    console.error("❌ 로그인 에러:", error);
    console.error("에러 상세:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.errors) {
      console.error("검증 에러들:", error.errors);
      return res.status(400).json({ 
        message: "입력 정보를 확인해주세요",
        errors: error.errors 
      });
    }
    return res.status(500).json({ 
      message: "로그인 중 오류가 발생했습니다",
      error: error.message 
    });
  }
}
