import { Router, type IRouter } from "express";
import { db, validationsTable, usersTable, activityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListValidationsQueryParams, ListValidationsResponse,
  CreateValidationBody,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth-middleware";

const router: IRouter = Router();

router.get("/validations", async (req, res): Promise<void> => {
  const qp = ListValidationsQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }
  const { userId } = qp.data;
  const results = await db.select().from(validationsTable).where(eq(validationsTable.validatedUserId, userId));

  const enriched = await Promise.all(results.map(async (v) => {
    const [validator] = await db.select().from(usersTable).where(eq(usersTable.id, v.validatorId));
    return {
      ...v,
      validatorName: validator?.name ?? null,
      rating: v.rating ?? null,
      createdAt: v.createdAt.toISOString(),
    };
  }));

  res.json(ListValidationsResponse.parse(enriched));
});

router.post("/validations", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateValidationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const validatorId = (req as typeof req & { userId: number }).userId;

  const [validation] = await db.insert(validationsTable).values({
    ...parsed.data,
    validatorId,
    rating: parsed.data.rating ?? null,
  }).returning();

  await db.insert(activityTable).values({
    userId: parsed.data.validatedUserId,
    type: "validation_received",
    description: `Received validation for: ${parsed.data.skillName}`,
  });

  const [validator] = await db.select().from(usersTable).where(eq(usersTable.id, validatorId));
  res.status(201).json({
    ...validation,
    validatorName: validator?.name ?? null,
    rating: validation.rating ?? null,
    createdAt: validation.createdAt.toISOString(),
  });
});

export default router;
