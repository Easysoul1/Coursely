export type Role = "STUDENT" | "ADMIN";

export type QuestionCategory = "ACADEMIC" | "CAREER" | "PERSONALITY" | "LEARNING_STYLE" | "GOAL";

export type QuestionType = "MULTIPLE_CHOICE" | "SCALE" | "TRUE_FALSE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  faculty: string;
  description: string;
  cutoffMark: number;
  requiredSubjects: string;
  difficultyLevel: string;
  careerPaths: string;
  studyDuration: string;
  scoringRules?: ScoringRule[];
}

export interface ScoringRule {
  id: string;
  departmentId: string;
  factor: string;
  weight: number;
}

export interface Question {
  id: string;
  question: string;
  category: QuestionCategory;
  type: QuestionType;
  weight: number;
}

export interface Answer {
  id: string;
  userId: string;
  questionId: string;
  answer: string;
  score: number;
}

export interface Recommendation {
  id: string;
  userId: string;
  departmentId: string;
  compatibilityScore: number;
  breakdown: string;
  createdAt: string;
  department?: Department;
}

export interface AssessmentResult {
  category: string;
  totalScore: number;
  maxScore: number;
}

export interface RecommendationResult {
  departmentId: string;
  departmentName: string;
  compatibilityScore: number;
  breakdown: Record<string, number>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}
