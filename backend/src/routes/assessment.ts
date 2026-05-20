import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncWrap } from "../middleware/async-wrap";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { submitAssessmentSchema } from "../schemas/assessment.schema";
import { NotFoundError, ValidationError } from "../lib/errors";

const router = Router();

router.get(
  "/questions",
  asyncWrap(async (_req: Request, res: Response) => {
    const questions = await prisma.question.findMany({
      orderBy: [{ category: "asc" }, { weight: "desc" }],
      select: { id: true, question: true, category: true, type: true, weight: true },
    });
    res.json({ questions });
  }),
);

router.post(
  "/submit",
  authenticate,
  validate({ body: submitAssessmentSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { answers } = req.body;

    const existingAnswers = await prisma.answer.findMany({ where: { userId } });
    if (existingAnswers.length > 0) {
      throw new ValidationError("Assessment already submitted. Use retake endpoint to resubmit.");
    }

    type AnswerInput = { questionId: string; answer: string; score: number };
    const questions = await prisma.question.findMany({
      where: { id: { in: (answers as AnswerInput[]).map((item) => item.questionId) } },
    });

    const questionMap = new Map(questions.map((item) => [item.id, item]));

    for (const answer of answers as AnswerInput[]) {
      if (!questionMap.has(answer.questionId)) {
        throw new ValidationError(`Question ${answer.questionId} not found`);
      }
    }

    await prisma.answer.createMany({
      data: (answers as AnswerInput[]).map((a) => ({
        userId,
        questionId: a.questionId,
        answer: a.answer,
        score: a.score,
      })),
    });

    const categoryScores: Record<string, number[]> = {};
    for (const answer of answers as AnswerInput[]) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;
      const cat = question.category;
      if (!categoryScores[cat]) {
        categoryScores[cat] = [];
      }
      categoryScores[cat].push(answer.score * question.weight);
    }

    const result = Object.entries(categoryScores).map(([category, scores]) => ({
      category,
      totalScore: scores.reduce((a, b) => a + b, 0),
      maxScore: scores.length * 10,
    }));

    res.status(201).json({
      message: "Assessment submitted successfully",
      result: { id: userId, categories: result },
    });
  }),
);

router.get(
  "/result/:id",
  authenticate,
  asyncWrap(async (req: Request, res: Response) => {
    const userId = req.params.id as string;

    const answers = await prisma.answer.findMany({
      where: { userId },
      include: { question: true },
    });

    if (answers.length === 0) {
      throw new NotFoundError("Assessment result");
    }

    const categoryScores: Record<string, { earned: number; max: number }> = {};
    for (const answer of answers) {
      const cat = answer.question.category;
      if (!categoryScores[cat]) {
        categoryScores[cat] = { earned: 0, max: 0 };
      }
      categoryScores[cat].earned += answer.score * answer.question.weight;
      categoryScores[cat].max += 10 * answer.question.weight;
    }

    const categories = Object.entries(categoryScores).map(([category, scores]) => ({
      category,
      score: Math.round((scores.earned / scores.max) * 100),
    }));

    res.json({ result: { userId, categories } });
  }),
);

export default router;
