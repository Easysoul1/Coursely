import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(200),
  faculty: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  cutoffMark: z.number().int().min(0).max(400),
  requiredSubjects: z.string(),
  difficultyLevel: z.string(),
  careerPaths: z.string(),
  studyDuration: z.string(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const departmentQuerySchema = z.object({
  faculty: z.string().optional(),
  difficulty: z.string().optional(),
});
