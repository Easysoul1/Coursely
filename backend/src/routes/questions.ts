import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncWrap } from "../middleware/async-wrap";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roles";
import { createQuestionSchema, updateQuestionSchema } from "../schemas/question.schema";
import { NotFoundError } from "../lib/errors";

const router = Router();

router.get(
  "/",
  asyncWrap(async (_req: Request, res: Response) => {
    const questions = await prisma.question.findMany({
      orderBy: [{ category: "asc" }, { weight: "desc" }],
    });
    res.json({ questions });
  }),
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createQuestionSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const question = await prisma.question.create({ data: req.body });
    res.status(201).json({ question });
  }),
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ body: updateQuestionSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const existing = await prisma.question.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError("Question");

    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ question });
  }),
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  asyncWrap(async (req: Request, res: Response) => {
    const existing = await prisma.question.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError("Question");

    await prisma.question.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
