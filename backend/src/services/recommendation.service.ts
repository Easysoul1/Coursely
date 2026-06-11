import { prisma } from "../lib/prisma";

interface FactorResolver {
  factor: string;
  weight: number;
  resolve: (answers: FactorAnswer[]) => number;
}

interface FactorAnswer {
  questionId: string;
  question: string;
  category: string;
  score: number;
  weight: number;
}

interface RecommendationResult {
  departmentId: string;
  departmentName: string;
  compatibilityScore: number;
  breakdown: Record<string, number>;
}

const factorResolvers: FactorResolver[] = [
  {
    factor: "mathematics_strength",
    weight: 25,
    resolve: (answers) =>
      averageScoreByKeywords(answers, ["mathematics", "math", "calculation", "logic", "physics"]),
  },
  {
    factor: "biology_strength",
    weight: 20,
    resolve: (answers) =>
      averageScoreByKeywords(answers, ["biology", "life science", "living", "chemistry"]),
  },
  {
    factor: "logical_reasoning",
    weight: 15,
    resolve: (answers) =>
      averageScoreByKeywords(answers, [
        "logic", "reasoning", "problem", "puzzle", "complex",
        "detail", "careful", "critical", "solve",
      ]),
  },
  {
    factor: "communication_skill",
    weight: 10,
    resolve: (answers) =>
      averageScoreByKeywords(answers, [
        "communication", "writing", "verbal", "expression",
        "team", "patient", "health",
      ]),
  },
  {
    factor: "interest_alignment",
    weight: 20,
    resolve: (answers) =>
      averageScoreByKeywords(answers, [
        "career", "interest", "goal", "ambition",
        "engineer", "technology", "software", "professional",
      ]),
  },
  {
    factor: "study_tolerance",
    weight: 10,
    resolve: (answers) =>
      averageScoreByKeywords(answers, [
        "study", "tolerance", "discipline", "dedication",
        "practical", "concentrat", "memoriz", "stress", "challenge",
      ]),
  },
];

function averageScoreByKeywords(answers: FactorAnswer[], keywords: string[]): number {
  const matching = answers.filter((a) =>
    keywords.some((kw) => a.question.toLowerCase().includes(kw)),
  );

  if (matching.length === 0) return 5;

  const total = matching.reduce((sum, a) => sum + a.score * a.weight, 0);
  const max = matching.reduce((sum, a) => sum + 10 * a.weight, 0);

  return Math.round((total / max) * 10);
}

export async function generateRecommendations(userId: string): Promise<RecommendationResult[]> {
  const answers = await prisma.answer.findMany({
    where: { userId },
    include: { question: true },
  });

  if (answers.length === 0) {
    return [];
  }

  const factorAnswers: FactorAnswer[] = answers.map((a) => ({
    questionId: a.questionId,
    question: a.question.question,
    category: a.question.category,
    score: a.score,
    weight: a.question.weight,
  }));

  const departments = await prisma.department.findMany({
    include: { scoringRules: true },
  });

  const results: RecommendationResult[] = [];

  for (const dept of departments) {
    const breakdown: Record<string, number> = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const resolver of factorResolvers) {
      const rule = dept.scoringRules.find((r) => r.factor === resolver.factor);
      const factorWeight = rule?.weight ?? resolver.weight;
      const factorScore = resolver.resolve(factorAnswers);

      breakdown[resolver.factor] = factorScore;
      totalWeightedScore += factorScore * factorWeight;
      totalWeight += factorWeight;
    }

    const compatibilityScore =
      totalWeight > 0 ? Math.round((totalWeightedScore / (totalWeight * 10)) * 100) : 0;

    results.push({
      departmentId: dept.id,
      departmentName: dept.name,
      compatibilityScore,
      breakdown,
    });
  }

  results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  for (const result of results) {
    await prisma.recommendation.upsert({
      where: {
        userId_departmentId: { userId, departmentId: result.departmentId },
      },
      update: {
        compatibilityScore: result.compatibilityScore,
        breakdown: JSON.stringify(result.breakdown),
      },
      create: {
        userId,
        departmentId: result.departmentId,
        compatibilityScore: result.compatibilityScore,
        breakdown: JSON.stringify(result.breakdown),
      },
    });
  }

  return results;
}
