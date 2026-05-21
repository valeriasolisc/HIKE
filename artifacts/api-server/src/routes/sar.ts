import { Router, type IRouter } from "express";
import { db, sarExperiencesTable, activityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListSarExperiencesQueryParams, ListSarExperiencesResponse,
  CreateSarExperienceBody, GetSarExperienceParams, GetSarExperienceResponse,
  UpdateSarExperienceParams, UpdateSarExperienceBody, UpdateSarExperienceResponse,
  DeleteSarExperienceParams,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth-middleware";

const router: IRouter = Router();

function mapSar(s: typeof sarExperiencesTable.$inferSelect) {
  return {
    ...s,
    softSkills: s.softSkills ?? [],
    context: s.context ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/sar", async (req, res): Promise<void> => {
  const qp = ListSarExperiencesQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }
  const { userId } = qp.data;
  const results = userId
    ? await db.select().from(sarExperiencesTable).where(eq(sarExperiencesTable.userId, userId))
    : await db.select().from(sarExperiencesTable);
  res.json(ListSarExperiencesResponse.parse(results.map(mapSar)));
});

router.post("/sar", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateSarExperienceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = (req as typeof req & { userId: number }).userId;
  const [sar] = await db.insert(sarExperiencesTable).values({ ...parsed.data, userId }).returning();

  await db.insert(activityTable).values({
    userId,
    type: "sar_created",
    description: `Added SAR experience`,
  });

  res.status(201).json(GetSarExperienceResponse.parse(mapSar(sar)));
});

router.get("/sar/:id", async (req, res): Promise<void> => {
  const params = GetSarExperienceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [sar] = await db.select().from(sarExperiencesTable).where(eq(sarExperiencesTable.id, params.data.id));
  if (!sar) {
    res.status(404).json({ error: "SAR experience not found" });
    return;
  }
  res.json(GetSarExperienceResponse.parse(mapSar(sar)));
});

router.patch("/sar/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = UpdateSarExperienceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateSarExperienceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [sar] = await db.update(sarExperiencesTable).set(parsed.data).where(eq(sarExperiencesTable.id, params.data.id)).returning();
  if (!sar) {
    res.status(404).json({ error: "SAR experience not found" });
    return;
  }
  res.json(UpdateSarExperienceResponse.parse(mapSar(sar)));
});

router.delete("/sar/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = DeleteSarExperienceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [sar] = await db.delete(sarExperiencesTable).where(eq(sarExperiencesTable.id, params.data.id)).returning();
  if (!sar) {
    res.status(404).json({ error: "SAR experience not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
