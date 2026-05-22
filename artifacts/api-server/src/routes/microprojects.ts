import { Router, type IRouter } from "express";
import { db, microprojectsTable, applicationsTable, activityTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import {
  ListMicroprojectsQueryParams, ListMicroprojectsResponse,
  CreateMicroprojectBody, GetMicroprojectParams, GetMicroprojectResponse,
  ApplyMicroprojectParams, ApplyMicroprojectBody,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth-middleware";

const router: IRouter = Router();

async function mapMicroproject(m: typeof microprojectsTable.$inferSelect) {
  const [appCount] = await db.select({ c: count() }).from(applicationsTable).where(eq(applicationsTable.microprojectId, m.id));
  return {
    ...m,
    requiredSkills: m.requiredSkills ?? [],
    applicantCount: appCount.c,
    createdAt: m.createdAt.toISOString(),
  };
}

router.get("/microprojects", async (req, res): Promise<void> => {
  const qp = ListMicroprojectsQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }
  const { limit = 20 } = qp.data;
  const results = await db.select().from(microprojectsTable).limit(limit);
  const mapped = await Promise.all(results.map(mapMicroproject));
  res.json(ListMicroprojectsResponse.parse(mapped));
});

router.post("/microprojects", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateMicroprojectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = (req as typeof req & { userId: number }).userId;
  const [mp] = await db.insert(microprojectsTable).values({
    ...parsed.data,
    recruiterId: userId,
  }).returning();
  const mapped = await mapMicroproject(mp);
  res.status(201).json(GetMicroprojectResponse.parse(mapped));
});

router.get("/microprojects/:id", async (req, res): Promise<void> => {
  const params = GetMicroprojectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [mp] = await db.select().from(microprojectsTable).where(eq(microprojectsTable.id, params.data.id));
  if (!mp) {
    res.status(404).json({ error: "Microproject not found" });
    return;
  }
  const mapped = await mapMicroproject(mp);
  res.json(GetMicroprojectResponse.parse(mapped));
});

router.post("/microprojects/:id/apply", authMiddleware, async (req, res): Promise<void> => {
  const params = ApplyMicroprojectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ApplyMicroprojectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = (req as typeof req & { userId: number }).userId;

  const existingApp = await db.select().from(applicationsTable)
    .where(eq(applicationsTable.microprojectId, params.data.id));
  const alreadyApplied = existingApp.some(a => a.userId === userId);
  if (alreadyApplied) {
    res.status(409).json({ error: "Ya has postulado a este microproyecto" });
    return;
  }

  const [app] = await db.insert(applicationsTable).values({
    microprojectId: params.data.id,
    userId,
    proposal: parsed.data.proposal,
  }).returning();

  await db.insert(activityTable).values({
    userId,
    type: "microproject_applied",
    description: `Postulaste a un microproyecto`,
  });

  res.status(201).json({ ...app, createdAt: app.createdAt.toISOString() });
});

export default router;
