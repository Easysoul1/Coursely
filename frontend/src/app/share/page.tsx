"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompatibilityBreakdown } from "@/components/features/compatibility-breakdown";
import { Suspense } from "react";

function SharedResults() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("d");

  let data: {
    recommendations: { name: string; score: number; breakdown: Record<string, number> }[];
  } | null = null;
  try {
    if (dataParam) {
      data = JSON.parse(atob(dataParam));
    }
  } catch {
    // invalid data
  }

  if (!data || !data.recommendations?.length) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-12">
        <h1 className="text-xl font-bold mb-2">Shared Recommendations</h1>
        <p className="text-muted-foreground">
          No recommendation data found. The link may be invalid or expired.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold">Shared Recommendations</h1>
        <p className="text-muted-foreground text-sm">
          Someone shared their Coursely results with you
        </p>
      </div>

      {data.recommendations.map((rec, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span>
                {i + 1}. {rec.name}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  rec.score >= 70
                    ? "bg-green-100 text-green-800"
                    : rec.score >= 50
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {rec.score}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompatibilityBreakdown breakdown={rec.breakdown} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <SharedResults />
    </Suspense>
  );
}
