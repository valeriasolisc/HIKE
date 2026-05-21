import { Request, Response, NextFunction } from "express";
import { parseToken } from "../lib/auth";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = parseToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  (req as Request & { userId: number; userRole: string }).userId = payload.userId;
  (req as Request & { userId: number; userRole: string }).userRole = payload.role;
  next();
}
