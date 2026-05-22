import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const savedCandidatesTable = pgTable("saved_candidates", {
  id: serial("id").primaryKey(),
  recruiterId: integer("recruiter_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavedCandidateSchema = createInsertSchema(savedCandidatesTable).omit({ id: true, createdAt: true });
export type InsertSavedCandidate = z.infer<typeof insertSavedCandidateSchema>;
export type SavedCandidate = typeof savedCandidatesTable.$inferSelect;
