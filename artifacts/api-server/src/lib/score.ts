import { db, skillsTable, projectsTable, validationsTable, sarExperiencesTable, applicationsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const LEVEL_WEIGHT: Record<string, number> = {
  beginner: 5,
  intermediate: 10,
  advanced: 20,
  expert: 30,
};

const SOFT_LEVEL_WEIGHT: Record<string, number> = {
  beginner: 3,
  intermediate: 7,
  advanced: 12,
  expert: 18,
};

export type HikeLevel = "emerging" | "developing" | "proficient" | "expert";

export function scoreToLevel(score: number): HikeLevel {
  if (score >= 601) return "expert";
  if (score >= 301) return "proficient";
  if (score >= 101) return "developing";
  return "emerging";
}

export function levelNextMilestone(score: number): number {
  if (score >= 601) return 1000;
  if (score >= 301) return 601;
  if (score >= 101) return 301;
  return 101;
}

export async function computeHikeScore(userId: number): Promise<{
  totalScore: number;
  technicalScore: number;
  softScore: number;
  projectsScore: number;
  validationsScore: number;
  sarScore: number;
  microprojectsScore: number;
  level: HikeLevel;
  nextMilestone: number;
}> {
  const skills = await db.select().from(skillsTable).where(eq(skillsTable.userId, userId));
  const [projCount] = await db.select({ c: count() }).from(projectsTable).where(eq(projectsTable.userId, userId));
  const [valCount] = await db.select({ c: count() }).from(validationsTable).where(eq(validationsTable.validatedUserId, userId));
  const [sarCount] = await db.select({ c: count() }).from(sarExperiencesTable).where(eq(sarExperiencesTable.userId, userId));
  const acceptedApps = await db.select().from(applicationsTable)
    .where(eq(applicationsTable.userId, userId));

  let technicalScore = 0;
  let softScore = 0;
  for (const skill of skills) {
    if (skill.category === "technical") {
      technicalScore += LEVEL_WEIGHT[skill.level] ?? 5;
    } else {
      softScore += SOFT_LEVEL_WEIGHT[skill.level] ?? 3;
    }
  }

  const projectsScore = projCount.c * 10;
  const validationsScore = valCount.c * 2;
  const sarScore = sarCount.c * 5;

  let microprojectsScore = 0;
  for (const app of acceptedApps) {
    if (app.status === "accepted" && app.hikePointsAwarded) {
      microprojectsScore += app.hikePointsAwarded;
    }
  }

  const totalScore = technicalScore + softScore + projectsScore + validationsScore + sarScore + microprojectsScore;
  const level = scoreToLevel(totalScore);
  const nextMilestone = levelNextMilestone(totalScore);

  return {
    totalScore,
    technicalScore,
    softScore,
    projectsScore,
    validationsScore,
    sarScore,
    microprojectsScore,
    level,
    nextMilestone,
  };
}
