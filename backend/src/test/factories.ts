import { PrismaClient, Role, QuestionCategory, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function createTestUser(
  overrides: Partial<{
    name: string;
    email: string;
    password: string;
    role: Role;
  }> = {},
) {
  const data = {
    name: overrides.name ?? "Test User",
    email: overrides.email ?? `test-${Date.now()}@example.com`,
    password: await bcrypt.hash(overrides.password ?? "password123", 1),
    role: overrides.role ?? "STUDENT",
  };
  return prisma.user.create({ data });
}

export async function createTestDepartment(
  overrides: Partial<{
    name: string;
    faculty: string;
    description: string;
    cutoffMark: number;
    requiredSubjects: string;
    difficultyLevel: string;
    careerPaths: string;
    studyDuration: string;
  }> = {},
) {
  const data = {
    name: overrides.name ?? `Test Dept ${Date.now()}`,
    faculty: overrides.faculty ?? "Science",
    description: overrides.description ?? "A test department description.",
    cutoffMark: overrides.cutoffMark ?? 200,
    requiredSubjects: overrides.requiredSubjects ?? JSON.stringify(["English", "Mathematics"]),
    difficultyLevel: overrides.difficultyLevel ?? "Medium",
    careerPaths: overrides.careerPaths ?? JSON.stringify(["Test Career"]),
    studyDuration: overrides.studyDuration ?? "4 years",
  };
  return prisma.department.create({ data });
}

export async function createTestQuestion(
  overrides: Partial<{
    question: string;
    category: QuestionCategory;
    type: QuestionType;
    weight: number;
  }> = {},
) {
  const data = {
    question: overrides.question ?? "Test question?",
    category: overrides.category ?? "ACADEMIC",
    type: overrides.type ?? "SCALE",
    weight: overrides.weight ?? 1,
  };
  return prisma.question.create({ data });
}

export async function createTestAnswer(
  userId: string,
  questionId: string,
  overrides: Partial<{
    answer: string;
    score: number;
  }> = {},
) {
  return prisma.answer.create({
    data: {
      userId,
      questionId,
      answer: overrides.answer ?? "3",
      score: overrides.score ?? 5,
    },
  });
}

export async function createTestScoringRule(
  departmentId: string,
  overrides: Partial<{
    factor: string;
    weight: number;
  }> = {},
) {
  return prisma.scoringRule.create({
    data: {
      id: `${departmentId}_${overrides.factor ?? "test_factor"}`,
      departmentId,
      factor: overrides.factor ?? "test_factor",
      weight: overrides.weight ?? 10,
    },
  });
}

export async function cleanupDatabase() {
  await prisma.savedRecommendation.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.scoringRule.deleteMany();
  await prisma.question.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
}
