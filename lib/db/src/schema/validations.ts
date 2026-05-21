import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const validationsTable = pgTable("validations", {
  id: serial("id").primaryKey(),
  validatedUserId: integer("validated_user_id").notNull(),
  validatorId: integer("validator_id").notNull(),
  skillName: text("skill_name").notNull(),
  message: text("message").notNull(),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertValidationSchema = createInsertSchema(validationsTable).omit({ id: true, createdAt: true });
export type InsertValidation = z.infer<typeof insertValidationSchema>;
export type Validation = typeof validationsTable.$inferSelect;
