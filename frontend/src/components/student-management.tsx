"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, GraduationCap, TrendingUp, Award } from "lucide-react"
import type { Student, Teacher } from "@/app/page"

interface StudentManagementProps {
  students: Student[]
  teachers?: Teacher[]
  currentUser: Teacher
}

export function StudentManagement({ students, currentUser }: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState<string>("all")
  const [subjectFilter, setSubjectFilter] = useState<string>("all")

  // Filter students based on teacher's subjects and classes
  // const teacherStudents = students.filter((student) => {
  //   if (currentUser.role === "Teacher") {
  //     return (
  //       currentUser.assignedClasses?.includes(student.classId) &&
  //       student.subjects.some((subject) => subject.name === currentUser.subject)
  //     )
  //   }
  //   return true // Admin/Principal can see all students
  // })

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = classFilter === "all" || student.classId === classFilter
    const matchesSubject = subjectFilter === "all" || student.subjects.some((s) => s.name === subjectFilter)

    return matchesSearch && matchesClass && matchesSubject
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-500"
      case "B":
        return "bg-blue-500"
      case "C":
        return "bg-yellow-500"
      case "D":
        return "bg-orange-500"
      case "F":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const classes = [...new Set(students.map((s) => s.classId))]
  const subjects = [...new Set(students.flatMap((s) => s.subjects.map((sub) => sub.name)))]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Student Management</h2>
        <p className="text-muted-foreground">
          {currentUser.role === "Teacher"
            ? `Manage your ${currentUser.subject} students`
            : "Manage all students in the system"}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((classId) => (
                <SelectItem key={classId} value={classId}>
                  {classId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.fullName} />
                      <AvatarFallback>{getInitials(student.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{student.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{student.studentId}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {student.classId}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Performance</span>
                      <span>{student.overallGrade}</span>
                    </div>
                    <Progress value={student.attendanceRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">Attendance: {student.attendanceRate}%</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Subject Grades:</p>
                    <div className="flex flex-wrap gap-1">
                      {student.subjects.slice(0, 3).map((subject, index) => (
                        <Badge key={index} variant="outline" className={`text-xs ${getGradeColor(subject.grade)}`}>
                          {subject.name}: {subject.grade}
                        </Badge>
                      ))}
                      {student.subjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.subjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Parent: {student.parentContact.name} • {student.parentContact.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredStudents.filter((s) => s.overallGrade === "A").length}
                </div>
                <p className="text-xs text-muted-foreground">Students with A grade</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">B+</div>
                <p className="text-xs text-muted-foreground">Class average</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(filteredStudents.reduce((acc, s) => acc + s.attendanceRate, 0) / filteredStudents.length)}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Average attendance</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredStudents.length}</div>
                <p className="text-xs text-muted-foreground">In your classes</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            {filteredStudents
              .sort((a, b) => b.attendanceRate - a.attendanceRate)
              .slice(0, 10)
              .map((student) => (
                <Card key={student.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.fullName} />
                          <AvatarFallback className="text-xs">{getInitials(student.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.fullName}</p>
                          <p className="text-sm text-muted-foreground">{student.classId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{student.overallGrade}</p>
                          <p className="text-sm text-muted-foreground">Grade</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{student.attendanceRate}%</p>
                          <p className="text-sm text-muted-foreground">Attendance</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="space-y-2">
            {filteredStudents.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.fullName} />
                        <AvatarFallback>{getInitials(student.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.studentId} • {student.classId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right min-w-[100px]">
                        <Progress value={student.attendanceRate} className="h-2 mb-1" />
                        <p className="text-sm font-medium">{student.attendanceRate}%</p>
                      </div>
                      <Badge
                        variant={
                          student.attendanceRate >= 90
                            ? "default"
                            : student.attendanceRate >= 75
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {student.attendanceRate >= 90 ? "Excellent" : student.attendanceRate >= 75 ? "Good" : "Poor"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
