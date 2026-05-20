import { PrismaClient } from "@prisma/client";
import { generateRecommendations } from "../services/recommendation.service";
import {
  createTestUser,
  createTestDepartment,
  createTestQuestion,
  createTestAnswer,
  createTestScoringRule,
  cleanupDatabase,
} from "./factories";

const prisma = new PrismaClient();

describe("RecommendationEngine", () => {
  let userId: string;
  let deptId: string;

  beforeEach(async () => {
    await cleanupDatabase();

    const user = await createTestUser();
    userId = user.id;

    const dept = await createTestDepartment();
    deptId = dept.id;

    await createTestScoringRule(deptId, { factor: "mathematics_strength", weight: 30 });
    await createTestScoringRule(deptId, { factor: "logical_reasoning", weight: 25 });
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  it("returns empty array when user has no answers", async () => {
    const results = await generateRecommendations(userId);
    expect(results).toEqual([]);
  });

  it("returns scored recommendations after assessment", async () => {
    const q1 = await createTestQuestion({
      question: "How do you rate your mathematics ability?",
      category: "ACADEMIC",
      weight: 3,
    });
    const q2 = await createTestQuestion({
      question: "How do you rate your logical reasoning?",
      category: "PERSONALITY",
      weight: 2,
    });

    await createTestAnswer(userId, q1.id, { score: 9 });
    await createTestAnswer(userId, q2.id, { score: 8 });

    const results = await generateRecommendations(userId);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].departmentId).toBe(deptId);
    expect(results[0].compatibilityScore).toBeGreaterThan(0);
    expect(results[0].compatibilityScore).toBeLessThanOrEqual(100);

    expect(results[0].breakdown).toHaveProperty("mathematics_strength");
    expect(results[0].breakdown).toHaveProperty("logical_reasoning");
  });

  it("uses department-specific scoring rules", async () => {
    const q1 = await createTestQuestion({
      question: "How do you rate your mathematics ability?",
      category: "ACADEMIC",
      weight: 3,
    });
    await createTestAnswer(userId, q1.id, { score: 10 });

    const dept2 = await createTestDepartment({
      name: "Biology Department",
      faculty: "Science",
    });
    await createTestScoringRule(dept2.id, { factor: "mathematics_strength", weight: 50 });
    await createTestScoringRule(dept2.id, { factor: "logical_reasoning", weight: 10 });

    const results = await generateRecommendations(userId);

    const dept = results.find((r) => r.departmentId === deptId)!;
    const dept2Result = results.find((r) => r.departmentId === dept2.id)!;

    expect(dept.compatibilityScore).not.toBe(dept2Result.compatibilityScore);
  });

  it("max scores produce near-100 compatibility", async () => {
    const q1 = await createTestQuestion({
      question: "How do you rate your mathematics ability?",
      category: "ACADEMIC",
      weight: 3,
    });
    const q2 = await createTestQuestion({
      question: "How do you rate your logical reasoning?",
      category: "PERSONALITY",
      weight: 2,
    });

    await createTestAnswer(userId, q1.id, { score: 10 });
    await createTestAnswer(userId, q2.id, { score: 10 });

    const results = await generateRecommendations(userId);
    expect(results[0].compatibilityScore).toBeGreaterThan(70);
    expect(results[0].compatibilityScore).toBeLessThanOrEqual(100);
  });

  it("returns explainable breakdown per factor", async () => {
    const q1 = await createTestQuestion({
      question: "How do you rate your mathematics ability?",
      category: "ACADEMIC",
      weight: 3,
    });
    await createTestAnswer(userId, q1.id, { score: 8 });

    const results = await generateRecommendations(userId);

    const breakdown = results[0].breakdown;
    expect(typeof breakdown).toBe("object");
    expect(Object.keys(breakdown).length).toBeGreaterThan(0);

    for (const [, score] of Object.entries(breakdown)) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(10);
    }
  });

  it("handles departments with no scoring rules gracefully", async () => {
    const deptNoRules = await createTestDepartment({ name: "No Rules Dept" });

    const q1 = await createTestQuestion({
      question: "How do you rate your mathematics ability?",
      category: "ACADEMIC",
      weight: 3,
    });
    await createTestAnswer(userId, q1.id, { score: 7 });

    const results = await generateRecommendations(userId);
    const noRulesResult = results.find((r) => r.departmentId === deptNoRules.id);

    expect(noRulesResult).toBeDefined();
    expect(noRulesResult!.compatibilityScore).toBeGreaterThanOrEqual(0);
  });
});
