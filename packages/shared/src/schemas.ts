import { z } from "zod";

export const roleSchema = z.enum(["STUDENT", "ADMIN"]);

export const questionCategorySchema = z.enum([
  "ACADEMIC",
  "CAREER",
  "PERSONALITY",
  "LEARNING_STYLE",
  "GOAL",
]);

export const questionTypeSchema = z.enum(["MULTIPLE_CHOICE", "SCALE", "TRUE_FALSE"]);
