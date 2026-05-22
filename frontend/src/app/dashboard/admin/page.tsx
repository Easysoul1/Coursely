"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Users,
  ClipboardCheck,
  Building2,
  Lightbulb,
  ArrowRight,
  UserPlus,
  RefreshCw,
} from "lucide-react";

interface AdminStats {
  totalStudents: number;
  totalAssessments: number;
  totalDepartments: number;
  totalRecommendations: number;
}

interface MonthlyRegistration {
  month: string;
  count: number;
}

interface AnalyticsData {
  overview: AdminStats;
  registrationsByMonth: MonthlyRegistration[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [registrations, setRegistrations] = useState<MonthlyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<AnalyticsData>("/api/admin/analytics");
      setStats(data.overview);
      setRegistrations(data.registrationsByMonth || []);
    } catch {
      setStats({
        totalStudents: 0,
        totalAssessments: 0,
        totalDepartments: 0,
        totalRecommendations: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Total Assessments",
      value: stats?.totalAssessments ?? 0,
      icon: ClipboardCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Total Departments",
      value: stats?.totalDepartments ?? 0,
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Recommendations",
      value: stats?.totalRecommendations ?? 0,
      icon: Lightbulb,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  const quickLinks = [
    { label: "Manage Departments", href: "/dashboard/admin/departments" },
    { label: "Manage Questions", href: "/dashboard/admin/questions" },
    { label: "Scoring Rules", href: "/dashboard/admin/rules" },
    { label: "View Analytics", href: "/dashboard/admin/analytics" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of the Coursely platform</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-3xl font-bold">{stat.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Registrations</CardTitle>
            <Badge variant="secondary">
              <UserPlus className="mr-1 h-3 w-3" />
              Latest
            </Badge>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No recent registrations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.slice(0, 6).map((reg) => {
                  const date = new Date(reg.month);
                  const label = date.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <div key={reg.month} className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <Badge variant="secondary">{Number(reg.count)} new</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickLinks.map((link) => (
              <Button key={link.href} variant="outline" className="w-full justify-between" asChild>
                <Link href={link.href}>
                  {link.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
