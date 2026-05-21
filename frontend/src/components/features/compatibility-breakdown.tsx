"use client";

import { Progress } from "@/components/ui/progress";

interface CompatibilityBreakdownProps {
  breakdown: Record<string, number>;
}

const barColor = (score: number) => {
  if (score >= 7) return "bg-green-500";
  if (score >= 5) return "bg-yellow-500";
  return "bg-red-400";
};

export function CompatibilityBreakdown({ breakdown }: CompatibilityBreakdownProps) {
  if (Object.keys(breakdown).length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Why this match?</p>
      {Object.entries(breakdown).map(([factor, score]) => (
        <div key={factor} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="capitalize">{factor.replace(/_/g, " ")}</span>
            <span className="font-medium">{Number(score)}/10</span>
          </div>
          <Progress
            value={Number(score) * 10}
            className="h-1.5"
            indicatorClassName={barColor(Number(score))}
          />
        </div>
      ))}
    </div>
  );
}
