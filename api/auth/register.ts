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

// Define validation schema
const insertUserSchema = z.object({
  studentId: z.string().regex(/^\d{9}$/, "학번은 9자리 숫자여야 합니다").refine(
    (studentId) => {
      const year = parseInt(studentId.substring(0, 4));
      const currentYear = new Date().getFullYear();
      return year >= 2020 && year <= currentYear + 1;
    },
    {
      message: "올바른 학번을 입력해주세요 (2020년 이후)"
    }
  ),
  username: z.string().min(2, "사용자명은 최소 2자 이상이어야 합니다")
    .max(50, "사용자명은 최대 50자까지 가능합니다")
    .regex(/^[a-zA-Z0-9가-힣_]+$/, "사용자명은 영문, 숫자, 한글, 언더스코어만 사용 가능합니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "비밀번호는 영문과 숫자를 포함해야 합니다")
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
    console.log("🔄 회원가입 요청 시작:", req.body);
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다');
    }

    // Validate input data
    console.log("📝 입력 데이터 검증 중...");
    const userData = insertUserSchema.parse(req.body);
    console.log("✅ 입력 데이터 검증 완료:", { studentId: userData.studentId, username: userData.username });
    
    // Setup database connection
    console.log("🔗 데이터베이스 연결 중...");
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);
    console.log("✅ 데이터베이스 연결 완료");
    
    // Check if username already exists
    console.log("👤 사용자명 중복 확인 중:", userData.username);
    const existingUsers = await db.select().from(users).where(eq(users.username, userData.username));
    if (existingUsers.length > 0) {
      console.log("❌ 사용자명 중복:", userData.username);
      await sql.end();
      return res.status(400).json({ message: "이미 사용 중인 사용자명입니다" });
    }
    console.log("✅ 사용자명 사용 가능");

    // Check if student ID already exists
    console.log("🎓 학번 중복 확인 중:", userData.studentId);
    const existingStudents = await db.select().from(users).where(eq(users.studentId, userData.studentId));
    if (existingStudents.length > 0) {
      console.log("❌ 학번 중복:", userData.studentId);
      await sql.end();
      return res.status(400).json({ message: "이미 등록된 학번입니다" });
    }
    console.log("✅ 학번 사용 가능");

    // Hash password
    console.log("🔐 비밀번호 해싱 중...");
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log("✅ 비밀번호 해싱 완료");

    // Create user
    console.log("👤 사용자 생성 중...");
    const newUsers = await db.insert(users).values({
      studentId: userData.studentId,
      username: userData.username,
      password: hashedPassword,
    }).returning();

    if (newUsers.length === 0) {
      console.log("❌ 사용자 생성 실패");
      await sql.end();
      return res.status(500).json({ message: "사용자 생성에 실패했습니다" });
    }

    const user = newUsers[0];
    console.log("✅ 사용자 생성 완료:", user.id);
    
    // Close database connection
    await sql.end();
    console.log("🔚 데이터베이스 연결 종료");
    
    // Don't send password back
    const { password, ...userResponse } = user;
    console.log("🎉 회원가입 성공!");
    return res.status(201).json({ user: userResponse });
  } catch (error: any) {
    console.error("❌ 회원가입 에러:", error);
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
      message: "회원가입 중 오류가 발생했습니다",
      error: error.message 
    });
  }
}
