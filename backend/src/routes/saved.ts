import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncWrap } from "../middleware/async-wrap";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { NotFoundError, ConflictError } from "../lib/errors";

const router = Router();

const createSavedSchema = z.object({
  departmentId: z.string(),
  notes: z.string().optional().default(""),
  folder: z.string().optional().default(""),
});

const updateSavedSchema = z.object({
  notes: z.string().optional(),
  folder: z.string().optional(),
});

router.use(authenticate);

router.get(
  "/",
  asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const saved = await prisma.savedRecommendation.findMany({
      where: { userId },
      include: {
        department: {
          select: { id: true, name: true, faculty: true, difficultyLevel: true },
        },
      },
      orderBy: { savedAt: "desc" },
    });

    const items = saved.map((s) => ({
      id: s.id,
      departmentId: s.departmentId,
      department: s.department,
      savedAt: s.savedAt,
      notes: s.notes,
      folder: s.folder,
    }));

    res.json({ saved: items });
  }),
);

router.post(
  "/",
  validate({ body: createSavedSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { departmentId, notes, folder } = req.body;

    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) throw new NotFoundError("Department");

    const existing = await prisma.savedRecommendation.findUnique({
      where: { userId_departmentId: { userId, departmentId } },
    });
    if (existing) throw new ConflictError("Department already saved");

    const saved = await prisma.savedRecommendation.create({
      data: { userId, departmentId, notes, folder },
      include: {
        department: {
          select: { id: true, name: true, faculty: true, difficultyLevel: true },
        },
      },
    });

    res.status(201).json({
      saved: {
        id: saved.id,
        departmentId: saved.departmentId,
        department: saved.department,
        savedAt: saved.savedAt,
        notes: saved.notes,
        folder: saved.folder,
      },
    });
  }),
);

router.patch(
  "/:id",
  validate({ body: updateSavedSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const existing = await prisma.savedRecommendation.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Saved recommendation");
    }

    const updated = await prisma.savedRecommendation.update({
      where: { id },
      data: req.body,
      include: {
        department: {
          select: { id: true, name: true, faculty: true, difficultyLevel: true },
        },
      },
    });

    res.json({
      saved: {
        id: updated.id,
        departmentId: updated.departmentId,
        department: updated.department,
        savedAt: updated.savedAt,
        notes: updated.notes,
        folder: updated.folder,
      },
    });
  }),
);

router.delete(
  "/:id",
  asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const existing = await prisma.savedRecommendation.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Saved recommendation");
    }

    await prisma.savedRecommendation.delete({ where: { id } });
    res.status(204).send();
  }),
);

export default router;
