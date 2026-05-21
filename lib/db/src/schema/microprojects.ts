import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const microprojectStatusEnum = pgEnum("microproject_status", ["open", "closed", "reviewing"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "accepted", "rejected"]);

export const microprojectsTable = pgTable("microprojects", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredSkills: text("required_skills").array().notNull().default([]),
  difficulty: difficultyEnum("difficulty").notNull(),
  duration: text("duration").notNull(),
  rewardPoints: integer("reward_points").notNull(),
  status: microprojectStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  microprojectId: integer("microproject_id").notNull(),
  userId: integer("user_id").notNull(),
  proposal: text("proposal").notNull(),
  status: applicationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMicroprojectSchema = createInsertSchema(microprojectsTable).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true });
export type InsertMicroproject = z.infer<typeof insertMicroprojectSchema>;
export type Microproject = typeof microprojectsTable.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
