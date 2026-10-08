import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  const token = req.cookies?.token || bearerToken;
  if (!token) {
    console.warn(`Unauthorized request: no auth cookie or bearer token (${req.method} ${req.path})`);
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (error) {
    console.warn(
      `Unauthorized request: invalid token (${req.method} ${req.path})`,
      error instanceof Error ? error.message : error
    );
    res.status(401).json({ error: "Invalid token" });
  }
};
