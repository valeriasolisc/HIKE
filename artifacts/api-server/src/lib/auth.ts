import crypto from "crypto";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashBuffer = crypto.scryptSync(password, salt, 64);
  return hashBuffer.toString("hex") === hash;
}

export function generateToken(userId: number, role: string): string {
  const payload = JSON.stringify({ userId, role, iat: Date.now() });
  return Buffer.from(payload).toString("base64url");
}

export function parseToken(token: string): { userId: number; role: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}
