import { Response } from "express";
import prisma from "../../core/db";
import { AuthRequest } from "../../core/middleware";

export const getDocuments = async (req: AuthRequest, res: Response) => {
  const docs = await prisma.document.findMany({
    where: {
      OR: [
        { ownerId: req.userId },
        { shares: { some: { userId: req.userId } } }
      ]
    }
  });
  res.json(docs);
};

export const createDocument = async (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  const doc = await prisma.document.create({
    data: {
      title: title || "Untitled Document",
      ownerId: req.userId!
    }
  });
  res.json(doc);
};

export const getDocumentShares = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { shares: { include: { user: { select: { id: true, email: true, name: true } } } } }
  });
  if (!doc) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ shares: doc.shares });
};

export const shareDocument = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { email, role } = req.body;
  
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.ownerId !== req.userId) {
    res.status(403).json({ error: "Not owner" });
    return;
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const share = await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: id, userId: targetUser.id } },
    update: { role },
    create: { documentId: id, userId: targetUser.id, role }
  });
  res.json(share);
};

export const removeShare = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const email = req.query.email as string;
  
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.ownerId !== req.userId) {
    res.status(403).json({ error: "Not owner" });
    return;
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await prisma.documentShare.delete({
    where: { documentId_userId: { documentId: id, userId: targetUser.id } }
  }).catch(() => null);

  res.json({ success: true });
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.ownerId !== req.userId) {
    res.status(403).json({ error: "Not owner" });
    return;
  }
  await prisma.document.delete({ where: { id } });
  res.json({ success: true });
};
