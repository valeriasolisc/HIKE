import { Router, type IRouter } from "express";
import { db, projectsTable, activityTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListProjectsQueryParams, ListProjectsResponse,
  CreateProjectBody, GetProjectParams, GetProjectResponse,
  UpdateProjectParams, UpdateProjectBody, UpdateProjectResponse,
  DeleteProjectParams,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth-middleware";

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

router.get("/projects", async (req, res): Promise<void> => {
  const qp = ListProjectsQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }
  const { userId, limit = 20, offset = 0 } = qp.data;

  let query = db.select().from(projectsTable);
  if (userId) {
    const results = await db.select().from(projectsTable).where(eq(projectsTable.userId, userId)).limit(limit).offset(offset);
    res.json(ListProjectsResponse.parse(results.map(mapProject)));
    return;
  }
  const results = await query.limit(limit).offset(offset);
  res.json(ListProjectsResponse.parse(results.map(mapProject)));
});

router.post("/projects", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = (req as typeof req & { userId: number }).userId;

  const [project] = await db.insert(projectsTable).values({ ...parsed.data, userId }).returning();

  await db.insert(activityTable).values({
    userId,
    type: "project_added",
    description: `Added project: ${project.title}`,
  });

  res.status(201).json(GetProjectResponse.parse(mapProject(project)));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetProjectResponse.parse(mapProject(project)));
});

router.patch("/projects/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [project] = await db.update(projectsTable).set(parsed.data).where(eq(projectsTable.id, params.data.id)).returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(UpdateProjectResponse.parse(mapProject(project)));
});

router.delete("/projects/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [project] = await db.delete(projectsTable).where(eq(projectsTable.id, params.data.id)).returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
