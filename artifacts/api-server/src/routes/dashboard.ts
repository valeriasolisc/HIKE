import { Router, type IRouter } from "express";
import { db, usersTable, projectsTable, skillsTable, validationsTable, sarExperiencesTable, activityTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import {
  GetStudentDashboardParams, GetStudentDashboardResponse,
  GetScoreBreakdownParams, GetScoreBreakdownResponse,
  GetActivityFeedParams, GetActivityFeedResponse,
  GetPlatformStatsResponse,
} from "@workspace/api-zod";
import { computeHikeScore } from "../lib/score";

const router: IRouter = Router();

function mapProject(p: typeof projectsTable.$inferSelect) {
  return {
    ...p,
    technologies: p.technologies ?? [],
    imageUrl: p.imageUrl ?? null,
    githubUrl: p.githubUrl ?? null,
    figmaUrl: p.figmaUrl ?? null,
    demoUrl: p.demoUrl ?? null,
    videoUrl: p.videoUrl ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/dashboard/student/:userId", async (req, res): Promise<void> => {
  const params = GetStudentDashboardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { userId } = params.data;

  const [projCount] = await db.select({ c: count() }).from(projectsTable).where(eq(projectsTable.userId, userId));
  const [skillCountR] = await db.select({ c: count() }).from(skillsTable).where(eq(skillsTable.userId, userId));
  const [valCount] = await db.select({ c: count() }).from(validationsTable).where(eq(validationsTable.validatedUserId, userId));
  const [sarCount] = await db.select({ c: count() }).from(sarExperiencesTable).where(eq(sarExperiencesTable.userId, userId));

  const hikeScore = await computeHikeScore(userId);

  const recentProjects = await db.select().from(projectsTable).where(eq(projectsTable.userId, userId)).orderBy(desc(projectsTable.createdAt)).limit(3);
  const topSkills = await db.select().from(skillsTable).where(eq(skillsTable.userId, userId)).limit(5);

  res.json(GetStudentDashboardResponse.parse({
    userId,
    score: hikeScore.totalScore,
    scoreChange: 0,
    projectCount: projCount.c,
    skillCount: skillCountR.c,
    validationCount: valCount.c,
    sarCount: sarCount.c,
    recentProjects: recentProjects.map(mapProject),
    topSkills,
  }));
});

router.get("/dashboard/score/:userId", async (req, res): Promise<void> => {
  const params = GetScoreBreakdownParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { userId } = params.data;

  const hikeScore = await computeHikeScore(userId);

  res.json(GetScoreBreakdownResponse.parse({
    userId,
    totalScore: hikeScore.totalScore,
    projectsScore: hikeScore.projectsScore,
    skillsScore: hikeScore.technicalScore + hikeScore.softScore,
    validationsScore: hikeScore.validationsScore,
    sarScore: hikeScore.sarScore,
    activityScore: hikeScore.microprojectsScore,
    level: hikeScore.level,
    nextMilestone: hikeScore.nextMilestone,
  }));
});

router.get("/dashboard/activity/:userId", async (req, res): Promise<void> => {
  const params = GetActivityFeedParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { userId } = params.data;

  const results = await db.select().from(activityTable)
    .where(eq(activityTable.userId, userId))
    .orderBy(desc(activityTable.createdAt))
    .limit(10);

  res.json(GetActivityFeedResponse.parse(results.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }))));
});

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [studentCount] = await db.select({ c: count() }).from(usersTable).where(eq(usersTable.role, "student"));
  const [projCount] = await db.select({ c: count() }).from(projectsTable);
  const [valCount] = await db.select({ c: count() }).from(validationsTable);
  const [skillCountR] = await db.select({ c: count() }).from(skillsTable);

  res.json(GetPlatformStatsResponse.parse({
    totalStudents: studentCount.c,
    totalProjects: projCount.c,
    totalValidations: valCount.c,
    totalSkills: skillCountR.c,
    avgScore: 340,
  }));
});

export default router;
