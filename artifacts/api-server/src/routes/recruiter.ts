import { Router, type IRouter } from "express";
import { db, usersTable, projectsTable, skillsTable, validationsTable, sarExperiencesTable } from "@workspace/db";
import { eq, count, gte } from "drizzle-orm";
import { SearchTalentQueryParams, SearchTalentResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recruiter/search", async (req, res): Promise<void> => {
  const qp = SearchTalentQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }
  const { limit = 20, offset = 0, minScore } = qp.data;

  const students = await db.select().from(usersTable).where(eq(usersTable.role, "student")).limit(limit).offset(offset);

  const results = await Promise.all(students.map(async (user) => {
    const [projCount] = await db.select({ c: count() }).from(projectsTable).where(eq(projectsTable.userId, user.id));
    const [valCount] = await db.select({ c: count() }).from(validationsTable).where(eq(validationsTable.validatedUserId, user.id));
    const [sarCount] = await db.select({ c: count() }).from(sarExperiencesTable).where(eq(sarExperiencesTable.userId, user.id));
    const skills = await db.select().from(skillsTable).where(eq(skillsTable.userId, user.id));

    const score = Math.min(1000, (projCount.c * 100) + (skills.length * 30) + (valCount.c * 50));
    const topSkills = skills.slice(0, 5).map(s => s.name);

    let activityLevel: "low" | "medium" | "high" = "low";
    if (score >= 400) activityLevel = "high";
    else if (score >= 200) activityLevel = "medium";

    return {
      anonymousId: `TALENTO-${user.id.toString().padStart(4, "0")}`,
      score,
      topSkills,
      projectCount: projCount.c,
      validationCount: valCount.c,
      sarCount: sarCount.c,
      activityLevel,
    };
  }));

  const filtered = minScore ? results.filter(r => r.score >= minScore) : results;
  res.json(SearchTalentResponse.parse(filtered));
});

export default router;
