import { Response } from "express";
import prisma from "../../core/db";
import { AuthRequest } from "../../core/middleware";

export const searchUsers = async (req: AuthRequest, res: Response) => {
  const emailQuery = req.query.email as string;
  if (!emailQuery) {
    res.json([]);
    return;
  }
  const users = await prisma.user.findMany({
    where: { email: { contains: emailQuery, mode: 'insensitive' } },
    select: { id: true, email: true, name: true },
    take: 10,
  });
  res.json(users);
};
