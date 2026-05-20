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
      await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.department.count(),
        prisma.answer.groupBy({ by: ["userId"] }).then((r) => r.length),
        prisma.recommendation.count(),
      ]);

    const popularDepartments = await prisma.recommendation.groupBy({
      by: ["departmentId"],
      _count: { departmentId: true },
      orderBy: { _count: { departmentId: "desc" } },
      take: 10,
    });

    const deptIds = popularDepartments.map((d) => d.departmentId);
    const depts = await prisma.department.findMany({
      where: { id: { in: deptIds } },
      select: { id: true, name: true, faculty: true },
    });
    const deptMap = new Map(depts.map((d) => [d.id, d]));

    const topDepartments = popularDepartments.map((d) => ({
      department: deptMap.get(d.departmentId) || {
        id: d.departmentId,
        name: "Unknown",
        faculty: "",
      },
      recommendationCount: d._count.departmentId,
    }));

    const registrationsByMonth = await prisma.$queryRaw`
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
