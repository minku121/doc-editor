import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../core/db";
import { AuthRequest } from "../../core/middleware";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }


  //checking why registration get failed 
  console.log("req.body", req.body);
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    if (user) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      setAuthCookie(res, token);
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    }

  } catch {
    res.status(400).json({ error: "Email already exists" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    res.status(400).json({ error: "Invalid password" });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  setAuthCookie(res, token);
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
};
