import { Router, type IRouter } from "express";
import { db, usersTable, profilesTable, projectsTable, skillsTable, validationsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { GetProfileParams, UpdateProfileParams, UpdateProfileBody, GetProfileResponse, UpdateProfileResponse } from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth-middleware";

const router: IRouter = Router();

async function computeScore(userId: number): Promise<number> {
  const [projCount] = await db.select({ c: count() }).from(projectsTable).where(eq(projectsTable.userId, userId));
  const [skillCount] = await db.select({ c: count() }).from(skillsTable).where(eq(skillsTable.userId, userId));
  const [valCount] = await db.select({ c: count() }).from(validationsTable).where(eq(validationsTable.validatedUserId, userId));
  const score = Math.min(1000, (projCount.c * 100) + (skillCount.c * 30) + (valCount.c * 50));
  return score;
}

router.get("/profiles/:userId", async (req, res): Promise<void> => {
  const params = GetProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, params.data.userId));
  const [projCount] = await db.select({ c: count() }).from(projectsTable).where(eq(projectsTable.userId, params.data.userId));
  const [skillCount] = await db.select({ c: count() }).from(skillsTable).where(eq(skillsTable.userId, params.data.userId));
  const [valCount] = await db.select({ c: count() }).from(validationsTable).where(eq(validationsTable.validatedUserId, params.data.userId));
  const score = await computeScore(params.data.userId);

  res.json(GetProfileResponse.parse({
    userId: user.id,
    name: user.name,
    bio: profile?.bio ?? null,
    headline: profile?.headline ?? null,
    avatarUrl: user.avatarUrl ?? null,
    location: profile?.location ?? null,
    githubUrl: profile?.githubUrl ?? null,
    linkedinUrl: profile?.linkedinUrl ?? null,
    portfolioUrl: profile?.portfolioUrl ?? null,
    score,
    projectCount: projCount.c,
    skillCount: skillCount.c,
    validationCount: valCount.c,
  }));
});

router.patch("/profiles/:userId", authMiddleware, async (req, res): Promise<void> => {
  const params = UpdateProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const existing = await db.select().from(profilesTable).where(eq(profilesTable.userId, params.data.userId));
  if (existing.length === 0) {
    await db.insert(profilesTable).values({ userId: params.data.userId, ...parsed.data });
  } else {
    await db.update(profilesTable).set(parsed.data).where(eq(profilesTable.userId, params.data.userId));
  }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, params.data.userId));
  const [projCount] = await db.select({ c: count() }).from(projectsTable).where(eq(projectsTable.userId, params.data.userId));
  const [skillCount] = await db.select({ c: count() }).from(skillsTable).where(eq(skillsTable.userId, params.data.userId));
  const [valCount] = await db.select({ c: count() }).from(validationsTable).where(eq(validationsTable.validatedUserId, params.data.userId));
  const score = await computeScore(params.data.userId);

  res.json(UpdateProfileResponse.parse({
    userId: user.id,
    name: user.name,
    bio: profile?.bio ?? null,
    headline: profile?.headline ?? null,
    avatarUrl: user.avatarUrl ?? null,
    location: profile?.location ?? null,
    githubUrl: profile?.githubUrl ?? null,
    linkedinUrl: profile?.linkedinUrl ?? null,
    portfolioUrl: profile?.portfolioUrl ?? null,
    score,
    projectCount: projCount.c,
    skillCount: skillCount.c,
    validationCount: valCount.c,
  }));
});

export { computeScore };
export default router;
