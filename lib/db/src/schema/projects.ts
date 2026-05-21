import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  impact: text("impact").notNull(),
  role: text("role").notNull(),
  technologies: text("technologies").array().notNull().default([]),
  imageUrl: text("image_url"),
  githubUrl: text("github_url"),
  figmaUrl: text("figma_url"),
  demoUrl: text("demo_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
