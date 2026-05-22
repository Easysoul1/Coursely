"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface DeptPopularity {
  department: { id: string; name: string; faculty: string };
  recommendationCount: number;
}

interface DeptAvgScore {
  department: { id: string; name: string; faculty: string };
  averageScore: number;
}

interface MonthlyRegistration {
  month: string;
  count: number;
}

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalDepartments: number;
    totalAssessments: number;
    totalRecommendations: number;
  };
  topDepartments: DeptPopularity[];
  averageCompatibilityScores: DeptAvgScore[];
  registrationsByMonth: MonthlyRegistration[];
  faculties: string[];
}

const COLORS = ["hsl(var(--primary))", "hsl(215 100% 50%)", "hsl(var(--muted-foreground))"];

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const dateRangeValues: Record<string, string | undefined> = {
  "All Time": undefined,
  "Last 7 Days": "7d",
  "Last 30 Days": "30d",
  "Last 90 Days": "90d",
  "This Year": "year",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faculty, setFaculty] = useState("All Faculties");
  const [dateRange, setDateRange] = useState("All Time");

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (faculty !== "All Faculties") params.faculty = faculty;
      const dateValue = dateRangeValues[dateRange];
      if (dateValue) params.dateRange = dateValue;

      const res = await api.get<AnalyticsData>("/api/admin/analytics", { params });
      setData(res);
    } catch {
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [faculty, dateRange]);

  const popularDepartments = (data?.topDepartments || []).map((d) => ({
    name: d.department.name,
    students: d.recommendationCount,
  }));

  const avgCompatibilityScores = (data?.averageCompatibilityScores || []).map((d) => ({
    name: d.department.name,
    score: d.averageScore,
  }));

  const allFaculties = data?.faculties || [];

  const totalStudents = data?.overview.totalStudents || 0;
  const totalAssessments = data?.overview.totalAssessments || 0;
  const notStarted = Math.max(0, totalStudents - totalAssessments);
  const completionData = [
    { name: "Completed", value: totalAssessments },
    { name: "Not Started", value: notStarted },
  ];

  const registrationTrend = (data?.registrationsByMonth || [])
    .map((r) => {
      const date = new Date(r.month);
      return {
        month: monthNames[date.getMonth()] || r.month,
        students: Number(r.count),
      };
    })
    .reverse();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform insights and trends</p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform insights and trends</p>
        </div>
        <div className="flex gap-3">
          <div className="w-44">
            <Select value={faculty} onValueChange={setFaculty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Faculties">All Faculties</SelectItem>
                {allFaculties.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Time">All Time</SelectItem>
                <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                <SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
                <SelectItem value="This Year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Departments</CardTitle>
                <CardDescription>Top departments by recommendation count</CardDescription>
              </CardHeader>
              <CardContent>
                {popularDepartments.length === 0 ? (
                  <div className="flex items-center justify-center h-80 text-muted-foreground">
                    No data yet
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={popularDepartments}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                        />
                        <YAxis className="text-muted-foreground" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Completion</CardTitle>
                <CardDescription>Students who have completed the assessment</CardDescription>
              </CardHeader>
              <CardContent>
                {completionData.every((d) => d.value === 0) ? (
                  <div className="flex items-center justify-center h-80 text-muted-foreground">
                    No data yet
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={completionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {completionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Compatibility Scores</CardTitle>
              <CardDescription>
                Average recommendation compatibility score per department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {avgCompatibilityScores.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No data yet
                </div>
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={avgCompatibilityScores}
                      layout="vertical"
                      margin={{ left: 120, right: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                        width={110}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, "Avg Score"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Registrations</CardTitle>
              <CardDescription>New student sign-ups by month</CardDescription>
            </CardHeader>
            <CardContent>
              {registrationTrend.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  No data yet
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={registrationTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
