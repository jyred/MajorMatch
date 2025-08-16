import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id", { length: 9 }).notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  responses: json("responses").$type<Record<string, number>>().notNull(),
  riasecScores: json("riasec_scores").$type<{
    realistic: number;
    investigative: number;
    artistic: number;
    social: number;
    enterprising: number;
    conventional: number;
  }>().notNull(),
  recommendedMajors: json("recommended_majors").$type<string[]>().notNull(),
  explanation: text("explanation").notNull(),
  similarCasesFeedback: text("similar_cases_feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 만족도 조사 테이블 추가
export const satisfactionSurveys = pgTable("satisfaction_surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  assessmentId: varchar("assessment_id").references(() => assessments.id).notNull(),
  overallSatisfaction: integer("overall_satisfaction").notNull(), // 1-5
  recommendationAccuracy: integer("recommendation_accuracy").notNull(), // 1-5
  systemUsability: integer("system_usability").notNull(), // 1-5
  wouldRecommend: boolean("would_recommend").notNull(),
  feedback: text("feedback"),
  selectedMajor: varchar("selected_major"),
  majorSatisfaction: integer("major_satisfaction"), // 1-5, null if not selected yet
  followUpDate: timestamp("follow_up_date"), // 실제 전공 선택 후 추가 피드백 날짜
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bookmarked majors table
export const bookmarkedMajors = pgTable("bookmarked_majors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  majorName: varchar("major_name").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  darkMode: boolean("dark_mode").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  messages: json("messages").$type<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  studentId: true,
  username: true,
  password: true,
}).extend({
  studentId: z.string().regex(/^\d{9}$/, "학번은 9자리 숫자여야 합니다").refine(
    (studentId) => {
      const year = parseInt(studentId.substring(0, 4));
      const currentYear = new Date().getFullYear();
      return year >= 2020 && year <= currentYear + 1;
    },
    "학번의 첫 4자리는 유효한 년도여야 합니다"
  ),
  username: z.string().min(3, "사용자명은 최소 3자 이상이어야 합니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "사용자명을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const insertSatisfactionSurveySchema = createInsertSchema(satisfactionSurveys).omit({
  id: true,
  createdAt: true,
}).extend({
  overallSatisfaction: z.number().min(1).max(5),
  recommendationAccuracy: z.number().min(1).max(5),
  systemUsability: z.number().min(1).max(5),
  wouldRecommend: z.boolean(),
  feedback: z.string().optional(),
  selectedMajor: z.string().optional(),
  majorSatisfaction: z.number().min(1).max(5).optional(),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

export type InsertSatisfactionSurvey = z.infer<typeof insertSatisfactionSurveySchema>;
export type SatisfactionSurvey = typeof satisfactionSurveys.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type RIASECScores = {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
};

export type AssessmentResponse = {
  questionId: number;
  answer: number;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export const insertBookmarkedMajorSchema = createInsertSchema(bookmarkedMajors).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBookmarkedMajor = z.infer<typeof insertBookmarkedMajorSchema>;
export type BookmarkedMajor = typeof bookmarkedMajors.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
