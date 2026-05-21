"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface RadarItem {
  factor: string;
  score: number;
}

export function StrengthsRadar({ data }: { data: RadarItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 20, bottom: 20 }}>
        <PolarGrid />
        <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.2}
          isAnimationActive
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
