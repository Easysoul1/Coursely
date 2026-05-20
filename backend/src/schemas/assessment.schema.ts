import { z } from "zod";

export const submitAssessmentSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        answer: z.string(),
        score: z.number().int().min(0).max(10),
      }),
    )
    .min(1),
});
