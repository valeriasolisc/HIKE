import { Router, type IRouter } from "express";
import { db, skillsTable, activityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListSkillsQueryParams, ListSkillsResponse,
  AddSkillBody, DeleteSkillParams,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth-middleware";

const router: IRouter = Router();

router.get("/skills", async (req, res): Promise<void> => {
  const qp = ListSkillsQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }
  const { userId } = qp.data;
  const results = userId
    ? await db.select().from(skillsTable).where(eq(skillsTable.userId, userId))
    : await db.select().from(skillsTable);
  res.json(ListSkillsResponse.parse(results));
});

router.post("/skills", authMiddleware, async (req, res): Promise<void> => {
  const parsed = AddSkillBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = (req as typeof req & { userId: number }).userId;
  const [skill] = await db.insert(skillsTable).values({ ...parsed.data, userId }).returning();

  await db.insert(activityTable).values({
    userId,
    type: "skill_added",
    description: `Added skill: ${skill.name}`,
  });

  res.status(201).json(skill);
});

router.delete("/skills/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = DeleteSkillParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [skill] = await db.delete(skillsTable).where(eq(skillsTable.id, params.data.id)).returning();
  if (!skill) {
    res.status(404).json({ error: "Skill not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
