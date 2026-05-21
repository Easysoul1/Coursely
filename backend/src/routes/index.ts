import { Router } from "express";
import authRoutes from "./auth";
import departmentRoutes from "./departments";
import questionRoutes from "./questions";
import assessmentRoutes from "./assessment";
import recommendationRoutes from "./recommendations";
import adminRoutes from "./admin";
import savedRoutes from "./saved";

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/questions", questionRoutes);
router.use("/assessment", assessmentRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/admin", adminRoutes);
router.use("/saved", savedRoutes);

export default router;
