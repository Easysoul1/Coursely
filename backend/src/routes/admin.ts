import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncWrap } from "../middleware/async-wrap";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roles";
import { validate } from "../middleware/validate";
import { NotFoundError, ConflictError } from "../lib/errors";

const router = Router();

const createRuleSchema = z.object({
  departmentId: z.string(),
  factor: z.string().min(1),
  weight: z.number().int().min(1).max(100),
});

const updateRuleSchema = z.object({
  factor: z.string().min(1).optional(),
  weight: z.number().int().min(1).max(100).optional(),
});

router.get(
  "/analytics",
  authenticate,
  authorize("ADMIN"),
  asyncWrap(async (req: Request, res: Response) => {
    const faculty = req.query.faculty as string | undefined;
    const dateRange = req.query.dateRange as string | undefined;

    const dateCutoff = dateRange
      ? (() => {
          const now = new Date();
          switch (dateRange) {
            case "7d":
              return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case "30d":
              return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case "90d":
              return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            case "year":
              return new Date(now.getFullYear(), 0, 1);
            default:
              return undefined;
          }
        })()
      : undefined;

    const deptFilter = faculty && faculty !== "All Faculties" ? { faculty } : {};
    const dateFilter = dateCutoff ? { createdAt: { gte: dateCutoff } } : {};

    const [totalStudents, totalDepartments, totalAssessments, totalRecommendations] =
      (await Promise.all([
        prisma.user.count({ where: { role: "STUDENT", ...dateFilter } }),
        prisma.department.count({ where: deptFilter }),
        prisma.recommendation
          .groupBy({ by: ["userId"], where: dateFilter })
          .then((result) => result.length),
        prisma.recommendation.count({
          where: {
            ...dateFilter,
            department: faculty && faculty !== "All Faculties" ? { faculty } : undefined,
          },
        }),
      ])) as [number, number, number, number];

    const recommendationWhere = {
      ...(dateCutoff ? { createdAt: { gte: dateCutoff } } : {}),
      department: faculty && faculty !== "All Faculties" ? { faculty } : undefined,
    };

    const popularDepartments = await prisma.recommendation.groupBy({
      by: ["departmentId"],
      _count: { departmentId: true },
      where: recommendationWhere,
      orderBy: { _count: { departmentId: "desc" } },
      take: 10,
    });

    const deptIds = popularDepartments.map((entry) => entry.departmentId);
    const depts = await prisma.department.findMany({
      where: { id: { in: deptIds } },
      select: { id: true, name: true, faculty: true },
    });
    const deptMap = new Map(depts.map((entry) => [entry.id, entry]));

    const topDepartments = popularDepartments.map((entry) => ({
      department: deptMap.get(entry.departmentId) || {
        id: entry.departmentId,
        name: "Unknown",
        faculty: "",
      },
      recommendationCount: entry._count.departmentId,
    }));

    const avgCompatibility = await prisma.recommendation.groupBy({
      by: ["departmentId"],
      _avg: { compatibilityScore: true },
      where: recommendationWhere,
    });

    const avgDeptIds = avgCompatibility.map((entry) => entry.departmentId);
    const avgDepts = await prisma.department.findMany({
      where: { id: { in: avgDeptIds } },
      select: { id: true, name: true, faculty: true },
    });
    const avgDeptMap = new Map(avgDepts.map((entry) => [entry.id, entry]));

    const averageCompatibilityScores = avgCompatibility
      .map((entry) => ({
        department: avgDeptMap.get(entry.departmentId) || {
          id: entry.departmentId,
          name: "Unknown",
          faculty: "",
        },
        averageScore: Math.round((entry._avg.compatibilityScore || 0) * 100) / 100,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    const rawRegistrations = await prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
      SELECT DATE_TRUNC('month', "created_at") as month, COUNT(*) as count
      FROM "User"
      WHERE "role" = 'STUDENT'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;
    const registrationsByMonth = rawRegistrations.map((r) => ({
      month: r.month,
      count: Number(r.count),
    }));

    const allFaculties = await prisma.department.findMany({
      select: { faculty: true },
      distinct: ["faculty"],
      orderBy: { faculty: "asc" },
    });

    res.json({
      overview: { totalStudents, totalDepartments, totalAssessments, totalRecommendations },
      topDepartments,
      averageCompatibilityScores,
      registrationsByMonth,
      faculties: allFaculties.map((entry) => entry.faculty),
    });
  }),
);

router.get(
  "/rules",
  authenticate,
  authorize("ADMIN"),
  asyncWrap(async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string | undefined;
    const where = departmentId ? { departmentId } : {};
    const rules = await prisma.scoringRule.findMany({ where, orderBy: { factor: "asc" } });
    res.json({ rules });
  }),
);

router.post(
  "/rules",
  authenticate,
  authorize("ADMIN"),
  validate({ body: createRuleSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const { departmentId, factor, weight } = req.body;

    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) throw new NotFoundError("Department");

    const existing = await prisma.scoringRule.findFirst({
      where: { departmentId, factor },
    });
    if (existing) throw new ConflictError("Scoring rule for this factor already exists");

    const rule = await prisma.scoringRule.create({
      data: { departmentId, factor, weight },
    });

    res.status(201).json({ rule });
  }),
);

router.patch(
  "/rules/:id",
  authenticate,
  authorize("ADMIN"),
  validate({ body: updateRuleSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const existing = await prisma.scoringRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Scoring rule");

    const rule = await prisma.scoringRule.update({
      where: { id },
      data: req.body,
    });

    res.json({ rule });
  }),
);

router.delete(
  "/rules/:id",
  authenticate,
  authorize("ADMIN"),
  asyncWrap(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const existing = await prisma.scoringRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Scoring rule");

    await prisma.scoringRule.delete({ where: { id } });
    res.status(204).send();
  }),
);

export default router;
