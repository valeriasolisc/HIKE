import { Router, type IRouter } from "express";
import { db, applicationsTable, microprojectsTable, usersTable, skillsTable, projectsTable, sarExperiencesTable, validationsTable, activityTable } from "@workspace/db";
import { eq, inArray, and, count } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth-middleware";

const router: IRouter = Router();

router.get("/recruiter/applications", authMiddleware, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const myMicroprojects = await db.select().from(microprojectsTable)
    .where(eq(microprojectsTable.recruiterId, userId));

  if (myMicroprojects.length === 0) {
    res.json([]);
    return;
  }

  const mpIds = myMicroprojects.map(m => m.id);
  const applications = await db.select().from(applicationsTable)
    .where(inArray(applicationsTable.microprojectId, mpIds));

  const result = await Promise.all(applications.map(async (app) => {
    const mp = myMicroprojects.find(m => m.id === app.microprojectId);
    const [student] = await db.select().from(usersTable).where(eq(usersTable.id, app.userId));
    const skills = await db.select().from(skillsTable).where(eq(skillsTable.userId, app.userId));
    const [projCount] = await db.select({ c: count() }).from(projectsTable).where(eq(projectsTable.userId, app.userId));
    const [sarCount] = await db.select({ c: count() }).from(sarExperiencesTable).where(eq(sarExperiencesTable.userId, app.userId));
    const [valCount] = await db.select({ c: count() }).from(validationsTable).where(eq(validationsTable.validatedUserId, app.userId));

    return {
      id: app.id,
      microprojectId: app.microprojectId,
      microprojectTitle: mp?.title ?? "Sin título",
      companyName: mp?.companyName ?? "",
      studentId: app.userId,
      anonymousAlias: `Candidato-${app.userId.toString().padStart(4, "0")}`,
      proposal: app.proposal,
      deliverableUrl: app.deliverableUrl ?? null,
      feedback: app.feedback ?? null,
      position: app.position ?? null,
      hikePointsAwarded: app.hikePointsAwarded ?? null,
      status: app.status,
      topSkills: skills.slice(0, 5).map(s => s.name),
      projectCount: projCount.c,
      sarCount: sarCount.c,
      validationCount: valCount.c,
      studentName: student?.name ?? "Estudiante",
      createdAt: app.createdAt.toISOString(),
    };
  }));

  res.json(result);
});

router.patch("/applications/:id", authMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const { status, position, feedback } = req.body as {
    status?: string;
    position?: string;
    feedback?: string;
  };

  if (!status || !["accepted", "rejected"].includes(status)) {
    res.status(400).json({ error: "Estado inválido" });
    return;
  }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) {
    res.status(404).json({ error: "Postulación no encontrada" });
    return;
  }

  let hikePointsAwarded: number | null = null;
  if (status === "accepted") {
    const [mp] = await db.select().from(microprojectsTable).where(eq(microprojectsTable.id, app.microprojectId));
    if (mp) {
      if (position === "1") hikePointsAwarded = mp.rewardPoints;
      else if (position === "2") hikePointsAwarded = mp.hp2 > 0 ? mp.hp2 : Math.round(mp.rewardPoints * 0.5);
      else if (position === "3") hikePointsAwarded = mp.hp3 > 0 ? mp.hp3 : Math.round(mp.rewardPoints * 0.2);
      else hikePointsAwarded = mp.hpParticipant;
    }
  }

  const [updated] = await db.update(applicationsTable)
    .set({
      status: status as "pending" | "accepted" | "rejected",
      position: position ?? null,
      feedback: feedback ?? null,
      hikePointsAwarded,
    })
    .where(eq(applicationsTable.id, id))
    .returning();

  if (status === "accepted" && hikePointsAwarded && hikePointsAwarded > 0) {
    await db.insert(activityTable).values({
      userId: app.userId,
      type: "microproject_applied",
      description: `Microproyecto aprobado — ${hikePointsAwarded} HP acreditados`,
    });
  }

  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

export default router;
