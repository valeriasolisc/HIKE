import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const microprojectStatusEnum = pgEnum("microproject_status", ["open", "closed", "reviewing"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "accepted", "rejected"]);

export const microprojectsTable = pgTable("microprojects", {
  id: serial("id").primaryKey(),
  recruiterId: integer("recruiter_id"),
  companyName: text("company_name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  methodologyDescription: text("methodology_description"),
  requiredSkills: text("required_skills").array().notNull().default([]),
  difficulty: difficultyEnum("difficulty").notNull(),
  duration: text("duration").notNull(),
  rewardPoints: integer("reward_points").notNull(),
  hp2: integer("hp2").notNull().default(0),
  hp3: integer("hp3").notNull().default(0),
  hpParticipant: integer("hp_participant").notNull().default(1),
  minParticipants: integer("min_participants").notNull().default(1),
  status: microprojectStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  microprojectId: integer("microproject_id").notNull(),
  userId: integer("user_id").notNull(),
  proposal: text("proposal").notNull(),
  deliverableUrl: text("deliverable_url"),
  feedback: text("feedback"),
  position: text("position"),
  hikePointsAwarded: integer("hike_points_awarded"),
  status: applicationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMicroprojectSchema = createInsertSchema(microprojectsTable).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true });
export type InsertMicroproject = z.infer<typeof insertMicroprojectSchema>;
export type Microproject = typeof microprojectsTable.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
