import { pgTable, serial, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const requestTypeEnum = pgEnum("request_type", ["learn", "exchange"]);
export const requestStatusEnum = pgEnum("request_status", ["pending", "accepted", "rejected"]);
export const sessionStatusEnum = pgEnum("session_status", ["scheduled", "completed"]);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  matric: text("matric").notNull().unique(),
  phone: text("phone").notNull(),
  department: text("department").notNull(),
  faculty: text("faculty").notNull(),
  year: integer("year").notNull(),
  totalScore: integer("total_score").default(0).notNull(),
  dailyScore: integer("daily_score").default(0).notNull(), // For daily cap
  avatar: text("avatar"),
  pushToken: text("push_token"),
  lastLogin: timestamp("last_login").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Skills Table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// UserSkills Table
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  type: text("type").notNull(), // "teach" or "learn"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Requests Table
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  skillId: integer("skill_id").references(() => skills.id).notNull(),
  type: requestTypeEnum("type").notNull(),
  status: requestStatusEnum("status").default("pending").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions Table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => requests.id).notNull(),
  tutorId: integer("tutor_id").references(() => users.id).notNull(),
  learnerId: integer("learner_id").references(() => users.id).notNull(),
  status: sessionStatusEnum("status").default("scheduled").notNull(),
  confirmedByTutor: boolean("confirmed_by_tutor").default(false).notNull(),
  confirmedByLearner: boolean("confirmed_by_learner").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Ratings Table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id).notNull(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  score: integer("score").notNull(), // e.g., 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activities Table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // e.g., "learn_skill", "teach_skill", "session_completed"
  description: text("description").notNull(),
  xpGained: integer("xp_gained").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
