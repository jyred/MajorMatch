import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seedUsers() {
  console.log("🌱 시드 데이터 생성 시작...");
  
  try {
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
        console.log(`✅ 사용자 생성 완료: ${userData.username}`);
      } else {
        console.log(`⚠️  이미 존재하는 사용자: ${userData.username}`);
      }
    }
    
    console.log("🎉 시드 데이터 생성 완료!");
    
    // 생성된 사용자 목록 출력
    const allUsers = await db.select({
      id: users.id,
      studentId: users.studentId,
      username: users.username,
      createdAt: users.createdAt
    }).from(users);
    
    console.log("\n📋 현재 등록된 사용자들:");
    console.table(allUsers);
    
  } catch (error) {
    console.error("❌ 시드 데이터 생성 실패:", error);
  }
}

seedUsers().catch(console.error);
