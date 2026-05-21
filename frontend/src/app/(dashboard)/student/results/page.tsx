"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRecommendations, generateRecommendations } from "@/hooks/use-recommendations";
import { useSaved } from "@/hooks/use-saved";
import dynamic from "next/dynamic";
import { DepartmentCard } from "@/components/features/department-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, BarChart3, AlertTriangle, RefreshCw, Printer, Share2, Check } from "lucide-react";

const CompatibilityChart = dynamic(
  () => import("@/components/features/compatibility-chart").then((m) => m.CompatibilityChart),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded" /> },
);

const StrengthsRadar = dynamic(
  () => import("@/components/features/strengths-radar").then((m) => m.StrengthsRadar),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded" /> },
);

const factorLabels: Record<string, string> = {
  mathematics_strength: "Mathematics",
  biology_strength: "Biology",
  logical_reasoning: "Reasoning",
  communication_skill: "Communication",
  interest_alignment: "Interest",
  study_tolerance: "Tolerance",
};

export default function ResultsPage() {
  const { user } = useAuth();
  const { recommendations, loading, error } = useRecommendations(user?.id);
  const { isSaved, getSavedId, saveDepartment, removeSaved } = useSaved();
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const chartData = recommendations
    .map((r) => ({
      name: r.department?.name || "Unknown",
      score: r.compatibilityScore,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const topBreakdown =
    recommendations.length > 0 ? JSON.parse(recommendations[0].breakdown || "{}") : {};

  const radarData = Object.entries(topBreakdown).map(([factor, score]) => ({
    factor: factorLabels[factor] || factor.replace(/_/g, " "),
    score: Number(score),
  }));

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateRecommendations();
      window.location.reload();
    } catch {
      // handled
    } finally {
      setGenerating(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const data = {
      recommendations: recommendations.map((r) => ({
        name: r.department?.name,
        score: r.compatibilityScore,
        breakdown: JSON.parse(r.breakdown || "{}"),
      })),
    };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}/share?d=${encoded}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 print:space-y-4" ref={printRef}>
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Your Recommendations</h1>
          <p className="text-muted-foreground">Departments matched to your academic profile</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied!" : "Share"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Generating..." : "Regenerate"}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 pb-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-sm">No recommendations yet</p>
              <p className="text-xs text-muted-foreground">
                Complete the assessment first to get personalized recommendations.
              </p>
            </div>
            <Button size="sm" className="ml-auto" asChild>
              <Link href="/dashboard/student/assessment">Take Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Compatibility Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompatibilityChart data={chartData} />
          </CardContent>
        </Card>
      )}

      {radarData.length > 0 && (
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="text-lg">Your Strengths Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <StrengthsRadar data={radarData} />
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Department Details</h2>
          {recommendations
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
            .map((rec, i) => {
              const breakdown = JSON.parse(rec.breakdown || "{}");
              const isExpanded = expandedId === rec.id;

              return (
                <div
                  key={rec.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <DepartmentCard
                    department={{
                      id: rec.department?.id || rec.departmentId,
                      name: rec.department?.name || "Unknown",
                      faculty: rec.department?.faculty || "",
                      cutoffMark: rec.department?.cutoffMark || 0,
                      difficultyLevel: rec.department?.difficultyLevel || "",
                    }}
                    compatibilityScore={rec.compatibilityScore}
                    breakdown={breakdown}
                    isExpanded={isExpanded}
                    isSaved={isSaved(rec.departmentId)}
                    isSaving={savingId === rec.id}
                    onToggleExpand={() => setExpandedId(isExpanded ? null : rec.id)}
                    onToggleSave={async () => {
                      setSavingId(rec.id);
                      try {
                        if (isSaved(rec.departmentId)) {
                          const id = getSavedId(rec.departmentId);
                          if (id) await removeSaved(id);
                        } else {
                          await saveDepartment(rec.departmentId);
                        }
                      } finally {
                        setSavingId(null);
                      }
                    }}
                  />
                </div>
              );
            })}
        </div>
      )}

      {!error && recommendations.length === 0 && !loading && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No recommendations yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete the assessment and generate recommendations to see your results here.
          </p>
          <Button asChild>
            <Link href="/dashboard/student/assessment">Take Assessment</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
