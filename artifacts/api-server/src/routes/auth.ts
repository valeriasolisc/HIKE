import { Router, type IRouter } from "express";
import { db, usersTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody, GetMeResponse, LoginResponse } from "@workspace/api-zod";
import { hashPassword, verifyPassword, generateToken } from "../lib/auth";
import { authMiddleware } from "../middlewares/auth-middleware";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, role } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, role }).returning();

  await db.insert(profilesTable).values({ userId: user.id });

  const token = generateToken(user.id, user.role);
  const userOut = { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl ?? null, createdAt: user.createdAt.toISOString() };

  res.status(201).json(LoginResponse.parse({ token, user: userOut }));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(user.id, user.role);
  const userOut = { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl ?? null, createdAt: user.createdAt.toISOString() };

  res.json(LoginResponse.parse({ token, user: userOut }));
});

router.get("/auth/me", authMiddleware, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const userOut = { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl ?? null, createdAt: user.createdAt.toISOString() };
  res.json(GetMeResponse.parse(userOut));
});

export default router;
