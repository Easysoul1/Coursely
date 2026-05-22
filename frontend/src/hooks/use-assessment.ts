"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Question {
  id: string;
  question: string;
  category: string;
  type: "SCALE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
  weight: number;
}

interface AssessmentResult {
  id: string;
  categories: {
    category: string;
    totalScore: number;
    maxScore: number;
  }[];
}

export function useAssessmentQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ questions: Question[] }>("/api/assessment/questions")
      .then((res) => setQuestions(res.questions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { questions, loading, error };
}

export function useAssessmentResult(userId: string | undefined) {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .get<{ result: AssessmentResult }>(`/api/assessment/result/${userId}`)
      .then((res) => setResult(res.result))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return { result, loading, error };
}

export async function submitAssessment(
  answers: { questionId: string; answer: string; score: number }[],
) {
  const res = await api.post<{
    message: string;
    result: AssessmentResult;
  }>("/api/assessment/submit", { answers });
  return res;
}
