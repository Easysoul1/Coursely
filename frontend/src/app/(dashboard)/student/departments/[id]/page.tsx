"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { ArrowLeft, GraduationCap, Briefcase, Clock, Target } from "lucide-react";

interface Department {
  id: string;
  name: string;
  faculty: string;
  description: string;
  cutoffMark: number;
  requiredSubjects: string;
  difficultyLevel: string;
  careerPaths: string;
  studyDuration: string;
  scoringRules?: { factor: string; weight: number }[];
}

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dept, setDept] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get<{ department: Department }>(`/api/departments/${id}`)
      .then((res) => setDept(res.department))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!dept) {
    return (
      <div className="p-6 text-center">
        <h2 className="font-semibold">Department not found</h2>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/student/results">Back to Results</Link>
        </Button>
      </div>
    );
  }

  const careerList = JSON.parse(dept.careerPaths || "[]") as string[];
  const subjects = JSON.parse(dept.requiredSubjects || "[]") as string[];

  const difficultyColor: Record<string, string> = {
    "Very High": "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/student/results">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
        </Link>
      </Button>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{dept.name}</h1>
          <Badge className={difficultyColor[dept.difficultyLevel] || ""}>
            {dept.difficultyLevel}
          </Badge>
        </div>
        <p className="text-muted-foreground">{dept.faculty} Faculty</p>
      </div>

      <p className="text-muted-foreground leading-relaxed">{dept.description}</p>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 pb-6 flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Cutoff Mark</p>
              <p className="font-bold text-lg">{dept.cutoffMark}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-6 flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-bold text-lg">{dept.studyDuration}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-6 flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Faculty</p>
              <p className="font-bold text-lg">{dept.faculty}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admission Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium mb-2">Required O&apos;level Subjects:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {subjects.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Minimum JAMB cutoff: <strong>{dept.cutoffMark}</strong>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Career Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {careerList.map((career) => (
              <li key={career} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {career}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {dept.scoringRules && dept.scoringRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scoring Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dept.scoringRules.map((rule) => (
              <div key={rule.factor} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{rule.factor.replace(/_/g, " ")}</span>
                  <span className="font-medium">{rule.weight}%</span>
                </div>
                <Progress value={rule.weight} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
