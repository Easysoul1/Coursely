import { Router, Request, Response } from "express";
import { z } from "zod";
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
    const id = req.params.id as string;
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Question");

    const question = await prisma.question.update({
      where: { id },
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
    const id = req.params.id as string;
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Question");

    await prisma.question.delete({ where: { id } });
    res.status(204).send();
  }),
);

const reorderSchema = z.object({
  category: z.enum(["ACADEMIC", "CAREER", "PERSONALITY", "LEARNING_STYLE", "GOAL"]),
  questionIds: z.array(z.string()),
});

router.post(
  "/reorder",
  authenticate,
  authorize("ADMIN"),
  validate({ body: reorderSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const { category, questionIds } = req.body;

    await prisma.$transaction(
      questionIds.map((id: string, index: number) =>
        prisma.question.update({
          where: { id },
          data: { weight: questionIds.length - index },
        }),
      ),
    );

    const questions = await prisma.question.findMany({
      where: { category },
      orderBy: { weight: "desc" },
    });

    res.json({ questions });
  }),
);

export default router;
