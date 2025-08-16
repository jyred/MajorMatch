import { storage } from "../server/storage";

async function testLogin() {
  console.log("🔐 로그인 기능 테스트 시작...");
  
  try {
    // 테스트 사용자 정보
    const testCredentials = [
      { username: "testuser1", password: "password123" },
      { username: "admin", password: "admin123" },
      { username: "nonexistent", password: "wrongpass" }, // 실패 케이스
    ];

    for (const { username, password } of testCredentials) {
      console.log(`\n🧪 테스트 중: ${username}`);
      
      const user = await storage.validateUser(username, password);
      
      if (user) {
        console.log(`✅ 로그인 성공!`);
        console.log(`   사용자 ID: ${user.id}`);
        console.log(`   학번: ${user.studentId}`);
        console.log(`   사용자명: ${user.username}`);
      } else {
        console.log(`❌ 로그인 실패: 잘못된 사용자명 또는 비밀번호`);
      }
    }
    
    console.log("\n🎉 로그인 테스트 완료!");
    
  } catch (error) {
    console.error("❌ 로그인 테스트 실패:", error);
  }
}

testLogin().catch(console.error);
