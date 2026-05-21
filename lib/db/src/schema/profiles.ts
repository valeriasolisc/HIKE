import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  bio: text("bio"),
  headline: text("headline"),
  location: text("location"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, updatedAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
