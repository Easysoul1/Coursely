"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRecommendations } from "@/hooks/use-recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardCheck, BarChart3, Bookmark, ArrowRight } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { recommendations } = useRecommendations(user?.id);

  const hasRecommendations = recommendations.length > 0;

  const stats = [
    {
      label: "Assessments",
      value: hasRecommendations ? "1" : "0",
      icon: ClipboardCheck,
      href: "/dashboard/student/assessment",
    },
    {
      label: "Recommendations",
      value: recommendations.length.toString(),
      icon: BarChart3,
      href: "/dashboard/student/results",
    },
    {
      label: "Saved",
      value: "0",
      icon: Bookmark,
      href: "/dashboard/student/saved",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-muted-foreground">Here&apos;s your academic guidance overview</p>
      </div>

      {!hasRecommendations ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h2 className="font-semibold text-lg mb-1">Ready to find your path?</h2>
              <p className="text-sm text-muted-foreground">
                Take our assessment to discover which UI departments match your strengths and
                interests.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/student/assessment">
                Take Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {recommendations[0].department?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {recommendations[0].compatibilityScore}% match
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/student/results">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
