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
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다');
    }

    // Validate input data
    const userData = insertUserSchema.parse(req.body);
    
    // Setup database connection
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    // Check if username already exists
    const existingUsers = await db.select().from(users).where(eq(users.username, userData.username));
    if (existingUsers.length > 0) {
      await sql.end();
      return res.status(400).json({ message: "이미 사용 중인 사용자명입니다" });
    }

    // Check if student ID already exists
    const existingStudents = await db.select().from(users).where(eq(users.studentId, userData.studentId));
    if (existingStudents.length > 0) {
      await sql.end();
      return res.status(400).json({ message: "이미 등록된 학번입니다" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const newUsers = await db.insert(users).values({
      studentId: userData.studentId,
      username: userData.username,
      password: hashedPassword,
    }).returning();

    if (newUsers.length === 0) {
      await sql.end();
      return res.status(500).json({ message: "사용자 생성에 실패했습니다" });
    }

    const user = newUsers[0];
    
    // Close database connection
    await sql.end();
    
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
