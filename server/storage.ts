import {
  users,
  assessments,
  chatSessions,
  satisfactionSurveys,
  bookmarkedMajors,
  userPreferences,
  type User,
  type Assessment,
  type ChatSession,
  type SatisfactionSurvey,
  type BookmarkedMajor,
  type UserPreferences,
  type InsertUser,
  type InsertAssessment,
  type InsertChatSession,
  type InsertSatisfactionSurvey,
  type InsertBookmarkedMajor,
  type InsertUserPreferences,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByStudentId(studentId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;
  updateUserProfileImage(id: string, profileImage: string): Promise<User | undefined>;
  
  // Assessment operations
  getAssessment(id: string): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessmentsByUser(userId: string): Promise<Assessment[]>;
  
  // Chat operations
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, session: Partial<ChatSession>): Promise<ChatSession | undefined>;
  getChatSessionsByUser(userId: string): Promise<ChatSession[]>;
  
  // Satisfaction survey operations
  getSatisfactionSurvey(id: string): Promise<SatisfactionSurvey | undefined>;
  createSatisfactionSurvey(survey: InsertSatisfactionSurvey): Promise<SatisfactionSurvey>;
  getSatisfactionSurveysByUser(userId: string): Promise<SatisfactionSurvey[]>;
  getSatisfactionSurveyByAssessment(assessmentId: string): Promise<SatisfactionSurvey | undefined>;
  updateSatisfactionSurvey(id: string, survey: Partial<SatisfactionSurvey>): Promise<SatisfactionSurvey | undefined>;
  
  // Bookmark operations
  createBookmark(bookmark: InsertBookmarkedMajor): Promise<BookmarkedMajor>;
  getUserBookmarks(userId: string): Promise<BookmarkedMajor[]>;
  deleteBookmark(id: string): Promise<void>;

  // User preferences operations
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByStudentId(studentId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.studentId, studentId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async updateUserProfileImage(id: string, profileImage: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ profileImage, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Assessment operations
  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment || undefined;
  }

  async getAssessmentsByUser(userId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt));
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  // Chat operations
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async createChatSession(insertChatSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values(insertChatSession)
      .returning();
    return session;
  }

  async updateChatSession(id: string, session: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const [updatedSession] = await db
      .update(chatSessions)
      .set(session)
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession || undefined;
  }

  async getChatSessionsByUser(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.createdAt));
  }

  // Satisfaction survey operations
  async getSatisfactionSurvey(id: string): Promise<SatisfactionSurvey | undefined> {
    const [survey] = await db.select().from(satisfactionSurveys).where(eq(satisfactionSurveys.id, id));
    return survey || undefined;
  }

  async createSatisfactionSurvey(insertSurvey: InsertSatisfactionSurvey): Promise<SatisfactionSurvey> {
    const [survey] = await db
      .insert(satisfactionSurveys)
      .values(insertSurvey)
      .returning();
    return survey;
  }

  async getSatisfactionSurveysByUser(userId: string): Promise<SatisfactionSurvey[]> {
    return await db
      .select()
      .from(satisfactionSurveys)
      .where(eq(satisfactionSurveys.userId, userId))
      .orderBy(desc(satisfactionSurveys.createdAt));
  }

  async getSatisfactionSurveyByAssessment(assessmentId: string): Promise<SatisfactionSurvey | undefined> {
    const [survey] = await db
      .select()
      .from(satisfactionSurveys)
      .where(eq(satisfactionSurveys.assessmentId, assessmentId));
    return survey || undefined;
  }

  async updateSatisfactionSurvey(id: string, survey: Partial<SatisfactionSurvey>): Promise<SatisfactionSurvey | undefined> {
    const [updatedSurvey] = await db
      .update(satisfactionSurveys)
      .set(survey)
      .where(eq(satisfactionSurveys.id, id))
      .returning();
    return updatedSurvey || undefined;
  }

  // Bookmark operations
  async createBookmark(insertBookmark: InsertBookmarkedMajor): Promise<BookmarkedMajor> {
    const [bookmark] = await db
      .insert(bookmarkedMajors)
      .values(insertBookmark)
      .returning();
    return bookmark;
  }

  async getUserBookmarks(userId: string): Promise<BookmarkedMajor[]> {
    return await db
      .select()
      .from(bookmarkedMajors)
      .where(eq(bookmarkedMajors.userId, userId))
      .orderBy(desc(bookmarkedMajors.createdAt));
  }

  async deleteBookmark(id: string): Promise<void> {
    await db.delete(bookmarkedMajors).where(eq(bookmarkedMajors.id, id));
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences || undefined;
  }

  async upsertUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const [preferences] = await db
      .insert(userPreferences)
      .values(insertPreferences)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...insertPreferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return preferences;
  }
}

export const storage = new DatabaseStorage();