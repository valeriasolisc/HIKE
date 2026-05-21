import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sarExperiencesTable = pgTable("sar_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  situacion: text("situacion").notNull(),
  accion: text("accion").notNull(),
  resultado: text("resultado").notNull(),
  softSkills: text("soft_skills").array().notNull().default([]),
  context: text("context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSarSchema = createInsertSchema(sarExperiencesTable).omit({ id: true, createdAt: true });
export type InsertSar = z.infer<typeof insertSarSchema>;
export type SarExperience = typeof sarExperiencesTable.$inferSelect;
