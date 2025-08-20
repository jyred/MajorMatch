import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  insertAssessmentSchema, 
  insertChatSessionSchema,
  insertUserSchema,
  loginUserSchema,
  insertSatisfactionSurveySchema,
  type RIASECScores, 
  type ChatMessage,
  type User 
} from "@shared/schema";
import OpenAI from "openai";
import { pineconeService } from "./pinecone";
import { rasaService } from "./rasa";
import { minimalValidator } from "./minimal-validator";
import { naturalChatService } from "./natural-chat";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// Session interface extension
declare module 'express-session' {
  interface SessionData {
    userId: string;
    user: User;
  }
}

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "인증이 필요합니다" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware for all routes
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Session middleware setup
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Pinecone service
  try {
    await pineconeService.initialize();
    console.log("Pinecone service initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Pinecone service:", error);
  }

  // ==== AUTHENTICATION ROUTES ====
  
  // Register route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or student ID already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "이미 사용 중인 사용자명입니다" });
      }

      const existingStudent = await storage.getUserByStudentId(userData.studentId);
      if (existingStudent) {
        return res.status(400).json({ message: "이미 등록된 학번입니다" });
      }

      const user = await storage.createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      req.session.user = user;
      
      // Don't send password back
      const { password, ...userResponse } = user;
      res.status(201).json({ user: userResponse });
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        return res.status(400).json({ 
          message: "입력 정보를 확인해주세요",
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다" });
    }
  });

  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginUserSchema.parse(req.body);
      
      const user = await storage.validateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "사용자명 또는 비밀번호가 올바르지 않습니다" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.user = user;

      // Don't send password back
      const { password: _, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ 
          message: "입력 정보를 확인해주세요",
          errors: error.errors 
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "로그인 중 오류가 발생했습니다" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다" });
      }
      res.json({ message: "로그아웃되었습니다" });
    });
  });

  // Get current user
  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        // Clear invalid session
        req.session.destroy((err) => {
          if (err) console.error("Session destroy error:", err);
        });
        return res.status(401).json({ message: "인증이 필요합니다" });
      }
      
      const { password, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "사용자 정보 조회 중 오류가 발생했습니다" });
    }
  });

  // ==== SATISFACTION SURVEY ROUTES ====
  
  // Create satisfaction survey
  app.post("/api/satisfaction-surveys", requireAuth, async (req, res) => {
    try {
      const surveyData = insertSatisfactionSurveySchema.parse({
        ...req.body,
        userId: req.session.userId
      });

      // GPT 무결성 검사
      const validationResult = await minimalValidator.validateSatisfactionSurvey({
        assessmentId: surveyData.assessmentId,
        overallSatisfaction: surveyData.overallSatisfaction,
        accuracyRating: surveyData.accuracyRating,
        usefulnessRating: surveyData.usefulnessRating,
        selectedMajor: surveyData.selectedMajor,
        feedback: surveyData.feedback
      });

      // 검증 실패시 경고와 함께 저장하되 사용자에게 알림
      if (!validationResult.isValid && validationResult.confidence > 0.7) {
        console.warn("만족도 조사 데이터 검증 실패:", validationResult.issues);
        // 심각한 오류가 아니면 저장은 진행하되 로그 기록
      }

      const survey = await storage.createSatisfactionSurvey(surveyData);
      
      // Store survey data in Pinecone for case study collection
      await pineconeService.storeCaseStudy({
        id: `survey-${survey.id}`,
        assessmentId: survey.assessmentId,
        riasecScores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }, // Will be populated from assessment
        selectedMajor: survey.selectedMajor || "",
        satisfaction: survey.overallSatisfaction,
        feedback: survey.feedback || "",
        timestamp: new Date().toISOString()
      });

      const response: any = { survey };
      
      // 검증 결과가 있으면 포함
      if (!validationResult.isValid && validationResult.suggestions.length > 0) {
        response.validationWarnings = validationResult.suggestions;
      }

      res.status(201).json(response);
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ 
          message: "입력 정보를 확인해주세요",
          errors: error.errors 
        });
      }
      console.error("Create satisfaction survey error:", error);
      res.status(500).json({ message: "만족도 조사 저장 중 오류가 발생했습니다" });
    }
  });

  // Get satisfaction surveys for user
  app.get("/api/satisfaction-surveys", requireAuth, async (req, res) => {
    try {
      const surveys = await storage.getSatisfactionSurveysByUser(req.session.userId!);
      res.json(surveys);
    } catch (error) {
      console.error("Get satisfaction surveys error:", error);
      res.status(500).json({ message: "만족도 조사 조회 중 오류가 발생했습니다" });
    }
  });

  // Get satisfaction survey by assessment
  app.get("/api/satisfaction-surveys/assessment/:assessmentId", requireAuth, async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const survey = await storage.getSatisfactionSurveyByAssessment(assessmentId);
      
      if (!survey) {
        return res.status(404).json({ message: "만족도 조사를 찾을 수 없습니다" });
      }

      // Verify ownership
      if (survey.userId !== req.session.userId) {
        return res.status(403).json({ message: "접근 권한이 없습니다" });
      }

      res.json(survey);
    } catch (error) {
      console.error("Get satisfaction survey by assessment error:", error);
      res.status(500).json({ message: "만족도 조사 조회 중 오류가 발생했습니다" });
    }
  });
  
  // ==== ASSESSMENT ROUTES ====
  
  // Analyze RIASEC from assessment responses
  app.post("/api/analyze-riasec", requireAuth, async (req, res) => {
    try {
      const { responses } = req.body;
      
      if (!responses || typeof responses !== 'object') {
        return res.status(400).json({ message: "응답 데이터가 필요합니다." });
      }

      // Calculate RIASEC scores directly from responses (standardized to 100 points)
      // Map question IDs to RIASEC types based on actual question data
      const riasecMapping: { [key: number]: keyof RIASECScores } = {
        1: "realistic", 2: "realistic", 3: "realistic",           // Questions 1-3: Realistic
        4: "investigative", 5: "investigative", 6: "investigative", // Questions 4-6: Investigative
        7: "artistic", 8: "artistic", 9: "artistic",             // Questions 7-9: Artistic
        10: "social", 11: "social", 12: "social",                // Questions 10-12: Social
        13: "enterprising", 14: "enterprising", 15: "enterprising", // Questions 13-15: Enterprising
        16: "conventional", 17: "conventional", 18: "conventional"  // Questions 16-18: Conventional
      };

      const rawScores = {
        realistic: 0,
        investigative: 0, 
        artistic: 0,
        social: 0,
        enterprising: 0,
        conventional: 0
      };

      // Calculate total scores for each RIASEC type
      Object.entries(responses).forEach(([questionId, score]) => {
        const questionNum = parseInt(questionId);
        const riasecType = riasecMapping[questionNum];
        if (riasecType && typeof score === 'number') {
          rawScores[riasecType] += score;
        }
      });

      // Standardize scores to 100-point scale
      // Each RIASEC type has 3 questions with 1-5 scale, so max possible is 15 per type
      const riasecScores: RIASECScores = {
        realistic: Math.round((rawScores.realistic / 15) * 100),
        investigative: Math.round((rawScores.investigative / 15) * 100),
        artistic: Math.round((rawScores.artistic / 15) * 100),
        social: Math.round((rawScores.social / 15) * 100),
        enterprising: Math.round((rawScores.enterprising / 15) * 100),
        conventional: Math.round((rawScores.conventional / 15) * 100)
      };

      // Log calculated scores for debugging
      console.log("Raw scores:", rawScores);
      console.log("Standardized RIASEC scores (0-100):", riasecScores);
      
      // Get major recommendations based on calculated RIASEC scores
      const majorPrompt = `다음 RIASEC 성향 분석 결과를 바탕으로 창의융합학부의 전공을 추천해주세요.

RIASEC 점수: ${JSON.stringify(riasecScores)}

창의융합학부 전공 목록:
- 컴퓨터공학과
- 소프트웨어학과  
- 정보통계학과
- 디지털미디어학과
- 산업공학과
- 건축학과
- 도시계획학과
- 환경공학과
- 신소재공학과
- 화학공학과

각 전공에 대해 다음 정보를 포함하여 JSON으로 응답해주세요:
{
  "recommendations": [
    {
      "major": "전공명",
      "matchRate": 0-100,
      "reason": "추천 이유 (2-3문장)"
    }
  ],
  "explanation": "전체적인 성향 분석 및 전공 추천 근거 (4-5문장)"
}

상위 3개 전공만 추천해주세요.`;

      const majorCompletion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "당신은 대학 전공 상담 전문가입니다. RIASEC 성향에 맞는 전공을 추천해주세요."
          },
          {
            role: "user",
            content: majorPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5
      });

      const majorResult = JSON.parse(majorCompletion.choices[0].message.content || "{}");
      
      // GPT 무결성 검사 - RIASEC 분석 결과 검증
      const validationResult = await minimalValidator.validateRiasecAssessment({
        responses,
        riasecScores,
        recommendedMajors: majorResult.recommendations?.map((r: any) => r.major) || []
      });

      // 간단한 로그만 기록 (GPT 검증 제거)
      if (!validationResult.isValid) {
        console.log("Basic validation issues:", validationResult.issues);
      }
      
      // Generate additional feedback from similar cases using Pinecone
      let similarCasesFeedback = "";
      try {
        similarCasesFeedback = await pineconeService.generateFeedbackFromSimilarCases(
          riasecScores,
          majorResult.recommendations?.map((r: any) => r.major) || []
        );
      } catch (error) {
        console.error("Failed to get similar cases feedback:", error);
      }

      // Save assessment with similar cases feedback
      const assessment = await storage.createAssessment({
        userId: req.session.userId!, // Use logged in user
        responses,
        riasecScores,
        recommendedMajors: majorResult.recommendations?.map((r: any) => r.major) || [],
        explanation: majorResult.explanation || "추천 전공을 확인하시고 상담을 받아보세요.",
        similarCasesFeedback: similarCasesFeedback || null
      });

      const response: any = {
        assessmentId: assessment.id,
        riasecScores,
        recommendations: majorResult.recommendations || [],
        explanation: majorResult.explanation || "추천 전공을 확인하시고 상담을 받아보세요.",
        similarCasesFeedback
      };

      // 검증 경고사항이 있으면 포함 (간단한 검증만)
      if (!validationResult.isValid && validationResult.suggestions) {
        response.validationWarnings = validationResult.suggestions;
        response.validationNote = "분석 결과에 일부 불일치가 감지되었습니다. 추가 상담을 권장합니다.";
      }

      res.json(response);
    } catch (error) {
      console.error("RIASEC analysis error:", error);
      res.status(500).json({ message: "성향 분석 중 오류가 발생했습니다." });
    }
  });

  // Get major recommendations based on RIASEC scores
  app.post("/api/recommend-majors", requireAuth, async (req, res) => {
    try {
      const { riasecScores } = req.body;
      
      if (!riasecScores) {
        return res.status(400).json({ message: "RIASEC 점수가 필요합니다." });
      }

      // Log the received scores for debugging
      console.log("Received RIASEC scores for recommendation:", riasecScores);

      const prompt = `다음 RIASEC 성향 분석 결과를 바탕으로 창의융합학부의 전공을 추천해주세요.

RIASEC 점수 (각 항목 100점 만점): ${JSON.stringify(riasecScores)}

창의융합학부 전공 목록:
- 컴퓨터공학과
- 소프트웨어학과  
- 정보통계학과
- 디지털미디어학과
- 산업공학과
- 건축학과
- 도시계획학과
- 환경공학과
- 신소재공학과
- 화학공학과

각 전공에 대해 다음 정보를 포함하여 JSON으로 응답해주세요:
{
  "recommendations": [
    {
      "major": "전공명",
      "matchRate": 0-100,
      "reason": "추천 이유 (2-3문장)"
    }
  ],
  "explanation": "전체적인 성향 분석 및 전공 추천 근거 (4-5문장)"
}

상위 3개 전공만 추천해주세요.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "당신은 대학 전공 상담 전문가입니다. RIASEC 성향에 맞는 전공을 추천해주세요."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      
      // Generate additional feedback from similar cases using Pinecone
      let similarCasesFeedback = "";
      try {
        similarCasesFeedback = await pineconeService.generateFeedbackFromSimilarCases(
          riasecScores,
          result.recommendations?.map((r: any) => r.major) || []
        );
      } catch (error) {
        console.error("Failed to get similar cases feedback:", error);
      }
      
      // Add similar cases feedback to the result
      if (similarCasesFeedback) {
        result.similarCasesFeedback = similarCasesFeedback;
      }

      // Save assessment with similar cases feedback
      const assessment = await storage.createAssessment({
        userId: req.session.userId!, // Use logged in user
        responses: riasecScores,
        riasecScores,
        recommendedMajors: result.recommendations?.map((r: any) => r.major) || [],
        explanation: result.explanation || "추천 전공을 확인하시고 상담을 받아보세요.",
        similarCasesFeedback: similarCasesFeedback || null
      });
      
      // Return assessment ID along with results
      res.json({ ...result, assessmentId: assessment.id });
    } catch (error) {
      console.error("Major recommendation error:", error);
      res.status(500).json({ message: "전공 추천 중 오류가 발생했습니다." });
    }
  });

  // Save assessment results
  app.post("/api/assessments", requireAuth, async (req, res) => {
    try {
      const validatedData = insertAssessmentSchema.parse({
        ...req.body,
        userId: req.session.userId!
      });
      const assessment = await storage.createAssessment(validatedData);
      res.json(assessment);
    } catch (error) {
      console.error("Save assessment error:", error);
      res.status(500).json({ message: "진단 결과 저장 중 오류가 발생했습니다." });
    }
  });

  // Get all assessments for current user
  app.get("/api/assessments", requireAuth, async (req, res) => {
    try {
      const assessments = await storage.getAssessmentsByUser(req.session.userId!);
      res.json(assessments);
    } catch (error) {
      console.error("Get assessments error:", error);
      res.status(500).json({ message: "진단 결과 조회 중 오류가 발생했습니다." });
    }
  });

  // Get assessment by ID
  app.get("/api/assessments/:id", requireAuth, async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "진단 결과를 찾을 수 없습니다." });
      }
      
      // Verify ownership
      if (assessment.userId !== req.session.userId) {
        return res.status(403).json({ message: "접근 권한이 없습니다." });
      }
      
      res.json(assessment);
    } catch (error) {
      console.error("Get assessment error:", error);
      res.status(500).json({ message: "진단 결과 조회 중 오류가 발생했습니다." });
    }
  });

  // Natural conversational chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId, riasecScores, recommendedMajors } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "메시지가 필요합니다." });
      }

      // Check for authentication - either session or header-based
      let userId: string;
      if (req.session && req.session.userId) {
        userId = req.session.userId;
      } else {
        const headerUserId = req.headers['x-user-id'] as string;
        if (!headerUserId) {
          return res.status(401).json({ message: "인증이 필요합니다." });
        }
        userId = headerUserId;
      }

      // Get or create chat session
      let session = sessionId ? await storage.getChatSession(sessionId) : null;
      
      if (!session) {
        session = await storage.createChatSession({
          userId,
          messages: []
        });
      }
      
      // Update user profile with RIASEC scores if available
      if (riasecScores) {
        naturalChatService.updateUserProfile(userId, { riasecScores });
      }

      // Generate natural response (includes all filtering and enhancement)
      const aiResponse = await naturalChatService.generateNaturalResponse(userId, message);

      // Extract interests and update profile only if response was successful
      if (!aiResponse.includes("시간당 메시지 한도") && !aiResponse.includes("부적절한 내용")) {
        await naturalChatService.extractAndUpdateInterests(userId, message);
        naturalChatService.updateConversationHistory(userId, message, aiResponse);
      }

      // Update session with new messages
      const newMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      };
      
      const aiMessage: ChatMessage = {
        role: "assistant", 
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...session.messages, newMessage, aiMessage];
      
      await storage.updateChatSession(session.id, {
        messages: updatedMessages
      });

      res.json({
        response: aiResponse,
        sessionId: session.id
      });
    } catch (error) {
      console.error("Natural chat error:", error);
      res.status(500).json({ message: "채팅 중 오류가 발생했습니다." });
    }
  });

  // Store user case study for future similarity search
  app.post("/api/store-case-study", async (req, res) => {
    try {
      const { riasecScores, selectedMajor, satisfactionRating, description, graduationYear, careerPath } = req.body;
      
      if (!riasecScores || !selectedMajor || !satisfactionRating) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
      }

      const caseStudy = {
        id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        riasecScores,
        selectedMajor,
        satisfactionRating,
        description: description || "사례 정보",
        graduationYear,
        careerPath
      };

      await pineconeService.storeCaseStudy(caseStudy);
      
      res.json({ message: "사례가 성공적으로 저장되었습니다.", caseId: caseStudy.id });
    } catch (error) {
      console.error("Store case study error:", error);
      res.status(500).json({ message: "사례 저장 중 오류가 발생했습니다." });
    }
  });

  // Get similar cases for a given RIASEC profile
  app.post("/api/similar-cases", async (req, res) => {
    try {
      const { riasecScores, topK = 5 } = req.body;
      
      if (!riasecScores) {
        return res.status(400).json({ message: "RIASEC 점수가 필요합니다." });
      }

      const similarCases = await pineconeService.findSimilarCases(riasecScores, topK);
      
      res.json({ similarCases });
    } catch (error) {
      console.error("Similar cases error:", error);
      res.status(500).json({ message: "유사 사례 검색 중 오류가 발생했습니다." });
    }
  });

  // Get conversation state for debugging/management
  app.get("/api/conversation/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const conversation = rasaService.getConversation(sessionId);
      
      if (!conversation) {
        return res.status(404).json({ message: "대화를 찾을 수 없습니다." });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ message: "대화 정보 조회 중 오류가 발생했습니다." });
    }
  });

  // Profile image upload endpoint
  app.post("/api/profile/image", requireAuth, async (req, res) => {
    try {
      const { imageData } = req.body;
      const userId = req.session.userId!;
      
      if (!imageData || !imageData.startsWith('data:image/')) {
        return res.status(400).json({ message: "올바른 이미지 데이터가 필요합니다." });
      }

      // Update user profile image
      await storage.updateUserProfileImage(userId, imageData);
      
      res.json({ message: "프로필 이미지가 성공적으로 업데이트되었습니다." });
    } catch (error) {
      console.error("Profile image upload error:", error);
      res.status(500).json({ message: "프로필 이미지 업로드 중 오류가 발생했습니다." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
