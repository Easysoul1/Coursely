import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncWrap } from "../middleware/async-wrap";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roles";

const router = Router();

router.get(
  "/analytics",
  authenticate,
  authorize("ADMIN"),
  asyncWrap(async (_req: Request, res: Response) => {
    const [totalStudents, totalDepartments, totalAssessments, totalRecommendations] =
      (await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.department.count(),
        prisma.answer.groupBy({ by: ["userId"] }).then((result) => result.length),
        prisma.recommendation.count(),
      ])) as [number, number, number, number];

    const popularDepartments = await prisma.recommendation.groupBy({
      by: ["departmentId"],
      _count: { departmentId: true },
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

    const registrationsByMonth = await prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
      SELECT DATE_TRUNC('month', "created_at") as month, COUNT(*) as count
      FROM "User"
      WHERE "role" = 'STUDENT'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;

    res.json({
      overview: { totalStudents, totalDepartments, totalAssessments, totalRecommendations },
      topDepartments,
      registrationsByMonth,
    });
  }),
);

export default router;
