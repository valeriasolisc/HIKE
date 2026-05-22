import { Router, type IRouter } from "express";
import { db, messagesTable, usersTable } from "@workspace/db";
import { eq, or, and, desc } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth-middleware";

const router: IRouter = Router();

router.get("/messages", authMiddleware, async (req, res): Promise<void> => {
  const userId = (req as typeof req & { userId: number }).userId;

  const msgs = await db.select().from(messagesTable)
    .where(or(
      eq(messagesTable.senderId, userId),
      eq(messagesTable.receiverId, userId)
    ))
    .orderBy(desc(messagesTable.createdAt));

  const conversationMap = new Map<number, {
    otherUserId: number;
    otherUserName: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
  }>();

  for (const msg of msgs) {
    const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!conversationMap.has(otherUserId)) {
      const [other] = await db.select().from(usersTable).where(eq(usersTable.id, otherUserId));
      conversationMap.set(otherUserId, {
        otherUserId,
        otherUserName: other?.name ?? `Usuario ${otherUserId}`,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt.toISOString(),
        unreadCount: !msg.isRead && msg.receiverId === userId ? 1 : 0,
      });
    } else if (!msg.isRead && msg.receiverId === userId) {
      const conv = conversationMap.get(otherUserId)!;
      conv.unreadCount += 1;
    }
  }

  res.json(Array.from(conversationMap.values()));
});

router.get("/messages/conversation/:userId", authMiddleware, async (req, res): Promise<void> => {
  const meId = (req as typeof req & { userId: number }).userId;
  const otherId = parseInt(req.params.userId);
  if (isNaN(otherId)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const msgs = await db.select().from(messagesTable)
    .where(or(
      and(eq(messagesTable.senderId, meId), eq(messagesTable.receiverId, otherId)),
      and(eq(messagesTable.senderId, otherId), eq(messagesTable.receiverId, meId))
    ))
    .orderBy(desc(messagesTable.createdAt));

  await db.update(messagesTable)
    .set({ isRead: true })
    .where(and(eq(messagesTable.receiverId, meId), eq(messagesTable.senderId, otherId)));

  res.json(msgs.reverse().map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  })));
});

router.post("/messages", authMiddleware, async (req, res): Promise<void> => {
  const senderId = (req as typeof req & { userId: number }).userId;
  const { receiverId, content } = req.body as { receiverId?: number; content?: string };

  if (!receiverId || typeof receiverId !== "number") {
    res.status(400).json({ error: "receiverId requerido" });
    return;
  }
  if (!content || typeof content !== "string" || content.trim() === "") {
    res.status(400).json({ error: "content requerido" });
    return;
  }

  const [msg] = await db.insert(messagesTable).values({
    senderId,
    receiverId,
    content: content.trim(),
    isRead: false,
  }).returning();

  res.status(201).json({ ...msg, createdAt: msg.createdAt.toISOString() });
});

export default router;
