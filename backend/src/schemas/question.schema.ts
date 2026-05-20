import { z } from "zod";

export const createQuestionSchema = z.object({
  question: z.string().min(5).max(500),
  category: z.enum(["ACADEMIC", "CAREER", "PERSONALITY", "LEARNING_STYLE", "GOAL"]),
  type: z.enum(["MULTIPLE_CHOICE", "SCALE", "TRUE_FALSE"]),
  weight: z.number().int().min(1).max(10).default(1),
});

export const updateQuestionSchema = createQuestionSchema.partial();
