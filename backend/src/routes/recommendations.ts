import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncWrap } from "../middleware/async-wrap";
import { authenticate } from "../middleware/auth";
import { generateRecommendations } from "../services/recommendation.service";
import { NotFoundError } from "../lib/errors";

const router = Router();

router.post(
  "/generate",
  authenticate,
  asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const results = await generateRecommendations(userId);

    if (results.length === 0) {
      throw new NotFoundError("Assessment data. Submit an assessment first");
    }

    res.json({ recommendations: results });
  }),
);

router.get(
  "/:userId",
  authenticate,
  asyncWrap(async (req: Request, res: Response) => {
    const recommendations = await prisma.recommendation.findMany({
      where: { userId: req.params.userId },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            faculty: true,
            difficultyLevel: true,
            cutoffMark: true,
            careerPaths: true,
          },
        },
      },
      orderBy: { compatibilityScore: "desc" },
    });

    res.json({ recommendations });
  }),
);

router.get(
  "/:userId/history",
  authenticate,
  asyncWrap(async (req: Request, res: Response) => {
    const recommendations = await prisma.recommendation.findMany({
      where: { userId: req.params.userId },
      include: { department: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({ recommendations });
  }),
);

export default router;
