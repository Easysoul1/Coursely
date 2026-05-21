"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Clock, Layers, ArrowRight, BarChart } from "lucide-react";
import { useAssessmentStore } from "@/stores/assessment-store";

export default function AssessmentIntroPage() {
  const { isComplete } = useAssessmentStore();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ClipboardCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Academic Assessment</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Discover which University of Ibadan departments align with your unique academic profile.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Clock, title: "Duration", desc: "~10 minutes" },
          { icon: Layers, title: "Sections", desc: "5 categories" },
          { icon: BarChart, title: "Questions", desc: "20 total" },
        ].map((item) => (
          <Card key={item.title}>
            <CardContent className="pt-6 pb-6 text-center">
              <item.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What to Expect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The assessment covers five areas: <strong>Academic Performance</strong>,{" "}
            <strong>Career Interests</strong>, <strong>Personality</strong>,{" "}
            <strong>Learning Style</strong>, and <strong>Goals</strong>.
          </p>
          <p>
            Questions are scale-based (1-10), multiple choice, or true/false. Answer honestly for
            the most accurate recommendations.
          </p>
          <p>Your progress is saved automatically, so you can leave and come back anytime.</p>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {isComplete ? (
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/student/results">
                View Results <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/student/assessment/questionnaire">Retake Assessment</Link>
            </Button>
          </>
        ) : (
          <Button size="lg" asChild>
            <Link href="/dashboard/student/assessment/questionnaire">
              Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
