"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Recommendation {
  id: string;
  userId: string;
  departmentId: string;
  compatibilityScore: number;
  breakdown: string;
  createdAt: string;
  department: {
    id: string;
    name: string;
    faculty: string;
    difficultyLevel: string;
    cutoffMark: number;
    careerPaths: string;
  };
}

interface RecommendationResult {
  departmentId: string;
  departmentName: string;
  compatibilityScore: number;
  breakdown: Record<string, number>;
}

export function useRecommendations(userId: string | undefined) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    api
      .get<{ recommendations: Recommendation[] }>(`/api/recommendations/${userId}`)
      .then((res) => setRecommendations(res.recommendations))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return { recommendations, loading, error };
}

export async function generateRecommendations() {
  const res = await api.post<{ recommendations: RecommendationResult[] }>(
    "/api/recommendations/generate",
  );
  return res;
}
