"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"

const attendanceData = [
  { month: "Jan", attendance: 92 },
  { month: "Feb", attendance: 88 },
  { month: "Mar", attendance: 94 },
  { month: "Apr", attendance: 89 },
  { month: "May", attendance: 96 },
  { month: "Jun", attendance: 91 },
]

const gradeDistribution = [
  { grade: "A", count: 45, color: "#22c55e" },
  { grade: "B", count: 67, color: "#3b82f6" },
  { grade: "C", count: 38, color: "#f59e0b" },
  { grade: "D", count: 15, color: "#f97316" },
  { grade: "F", count: 8, color: "#ef4444" },
]

const subjectPerformance = [
  { subject: "Math", average: 85, students: 120 },
  { subject: "English", average: 78, students: 115 },
  { subject: "Science", average: 82, students: 108 },
  { subject: "History", average: 76, students: 95 },
  { subject: "Geography", average: 80, students: 88 },
]

const weeklyProgress = [
  { day: "Mon", completed: 12, total: 15 },
  { day: "Tue", completed: 14, total: 16 },
  { day: "Wed", completed: 10, total: 14 },
  { day: "Thu", completed: 16, total: 18 },
  { day: "Fri", completed: 13, total: 15 },
  { day: "Sat", completed: 8, total: 10 },
  { day: "Sun", completed: 5, total: 8 },
]

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Attendance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend</CardTitle>
          <CardDescription>Monthly attendance rates</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              attendance: {
                label: "Attendance %",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="var(--color-attendance)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-attendance)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>Current semester grades</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Students",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ grade, count }) => `${grade}: ${count}`}
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>Average scores by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              average: {
                label: "Average Score",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="average" fill="var(--color-average)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Lesson Progress</CardTitle>
          <CardDescription>Completed vs total lessons this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              completed: {
                label: "Completed",
                color: "hsl(var(--chart-4))",
              },
              total: {
                label: "Total",
                color: "hsl(var(--chart-5))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="var(--color-completed)" />
                <Bar dataKey="total" fill="var(--color-total)" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
