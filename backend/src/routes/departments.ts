import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncWrap } from "../middleware/async-wrap";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roles";
import { createDepartmentSchema, updateDepartmentSchema } from "../schemas/department.schema";
import { NotFoundError } from "../lib/errors";

const router = Router();

router.get(
  "/",
  asyncWrap(async (req: Request, res: Response) => {
    const faculty = req.query.faculty as string | undefined;
    const difficulty = req.query.difficulty as string | undefined;
    const where: Record<string, string> = {};

    if (faculty) where.faculty = faculty;
    if (difficulty) where.difficultyLevel = difficulty;

    const departments = await prisma.department.findMany({ where, orderBy: { name: "asc" } });
    res.json({ departments });
  }),
);

router.get(
  "/:id",
  asyncWrap(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const department = await prisma.department.findUnique({
      where: { id },
      include: { scoringRules: true },
    });

    if (!department) {
      throw new NotFoundError("Department");
    }

    res.json({ department });
  }),
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createDepartmentSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const department = await prisma.department.create({ data: req.body });
    res.status(201).json({ department });
  }),
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ body: updateDepartmentSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Department");

    const department = await prisma.department.update({
      where: { id },
      data: req.body,
    });

    res.json({ department });
  }),
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  asyncWrap(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Department");

    await prisma.department.delete({ where: { id } });
    res.status(204).send();
  }),
);

export default router;
