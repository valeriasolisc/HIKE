import { Router, type IRouter } from "express";
import { db, savedCandidatesTable, usersTable, skillsTable, projectsTable, validationsTable, sarExperiencesTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth-middleware";
import { computeHikeScore } from "../lib/score";

const router: IRouter = Router();

router.get("/saved-candidates", authMiddleware, async (req, res): Promise<void> => {
  const recruiterId = (req as typeof req & { userId: number }).userId;

  const saved = await db.select().from(savedCandidatesTable)
    .where(eq(savedCandidatesTable.recruiterId, recruiterId));

  const result = await Promise.all(saved.map(async (s) => {
    const skills = await db.select().from(skillsTable).where(eq(skillsTable.userId, s.candidateId));
    const [projCount] = await db.select({ c: count() }).from(projectsTable).where(eq(projectsTable.userId, s.candidateId));
    const [valCount] = await db.select({ c: count() }).from(validationsTable).where(eq(validationsTable.validatedUserId, s.candidateId));
    const [sarCount] = await db.select({ c: count() }).from(sarExperiencesTable).where(eq(sarExperiencesTable.userId, s.candidateId));
    const hikeScore = await computeHikeScore(s.candidateId);

    return {
      savedId: s.id,
      candidateId: s.candidateId,
      anonymousAlias: `Candidato-${s.candidateId.toString().padStart(4, "0")}`,
      score: hikeScore.totalScore,
      level: hikeScore.level,
      topSkills: skills.slice(0, 5).map(sk => sk.name),
      projectCount: projCount.c,
      validationCount: valCount.c,
      sarCount: sarCount.c,
      savedAt: s.createdAt.toISOString(),
    };
  }));

  res.json(result);
});

router.post("/saved-candidates", authMiddleware, async (req, res): Promise<void> => {
  const recruiterId = (req as typeof req & { userId: number }).userId;
  const { candidateId } = req.body as { candidateId?: number };

  if (!candidateId || typeof candidateId !== "number") {
    res.status(400).json({ error: "candidateId requerido" });
    return;
  }

  const existing = await db.select().from(savedCandidatesTable)
    .where(and(
      eq(savedCandidatesTable.recruiterId, recruiterId),
      eq(savedCandidatesTable.candidateId, candidateId)
    ));

  if (existing.length > 0) {
    res.status(409).json({ error: "Candidato ya guardado" });
    return;
  }

  const [saved] = await db.insert(savedCandidatesTable).values({
    recruiterId,
    candidateId,
  }).returning();

  res.status(201).json({ ...saved, createdAt: saved.createdAt.toISOString() });
});

router.delete("/saved-candidates/:candidateId", authMiddleware, async (req, res): Promise<void> => {
  const recruiterId = (req as typeof req & { userId: number }).userId;
  const candidateId = parseInt(req.params.candidateId);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  await db.delete(savedCandidatesTable)
    .where(and(
      eq(savedCandidatesTable.recruiterId, recruiterId),
      eq(savedCandidatesTable.candidateId, candidateId)
    ));

  res.json({ ok: true });
});

export default router;
