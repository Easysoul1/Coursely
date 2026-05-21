"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { CompatibilityBreakdown } from "./compatibility-breakdown";

interface DepartmentInfo {
  id: string;
  name: string;
  faculty: string;
  cutoffMark: number;
  difficultyLevel: string;
}

interface DepartmentCardProps {
  department: DepartmentInfo;
  compatibilityScore: number;
  breakdown: Record<string, number>;
  isExpanded: boolean;
  isSaved: boolean;
  isSaving: boolean;
  onToggleExpand: () => void;
  onToggleSave: () => void;
}

function scoreColor(score: number) {
  if (score >= 70) return "bg-green-100 text-green-800";
  if (score >= 50) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function DepartmentCard({
  department,
  compatibilityScore,
  breakdown,
  isExpanded,
  isSaved: saved,
  isSaving,
  onToggleExpand,
  onToggleSave,
}: DepartmentCardProps) {
  return (
    <Card>
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-lg">{department.name}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreColor(compatibilityScore)}`}
              >
                {compatibilityScore}%
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{department.faculty}</span>
              <span>Cutoff: {department.cutoffMark}</span>
              <span>{department.difficultyLevel}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onToggleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleExpand}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <CompatibilityBreakdown breakdown={breakdown} />
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/student/departments/${department.id}`}>
                  View Department Details
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
