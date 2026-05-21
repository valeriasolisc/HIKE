import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activityTypeEnum = pgEnum("activity_type", [
  "project_added",
  "skill_added",
  "validation_received",
  "sar_created",
  "microproject_applied",
]);

export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: activityTypeEnum("type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activityTable).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activityTable.$inferSelect;
