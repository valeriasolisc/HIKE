import { pgTable, text, serial, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const skillCategoryEnum = pgEnum("skill_category", ["technical", "soft", "tool", "language"]);
export const skillLevelEnum = pgEnum("skill_level", ["beginner", "intermediate", "advanced", "expert"]);

export const skillsTable = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  category: skillCategoryEnum("category").notNull(),
  level: skillLevelEnum("level").notNull(),
});

export const insertSkillSchema = createInsertSchema(skillsTable).omit({ id: true });
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skillsTable.$inferSelect;
