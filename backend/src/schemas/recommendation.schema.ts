import { z } from "zod";

export const generateRecommendationSchema = z.object({
  assessmentId: z.string().optional(),
});
