"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, Upload, Download, FileText, Users, AlertCircle, CheckCircle } from "lucide-react"
import type { Student, Class } from "@/app/page"

interface StudentCreationProps {
  students: Student[]
  classes: Class[]
  onAddStudent: (studentData: Omit<Student, "id">) => void
  onBulkAddStudents: (studentsData: Omit<Student, "id">[]) => void
  canEdit: boolean
}

export function StudentCreation({ students, classes, onAddStudent, onBulkAddStudents, canEdit }: StudentCreationProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    email: "",
    classId: "",
    overallGrade: "B",
    attendanceRate: 85,
    parentContact: {
      name: "",
      phone: "",
      email: "",
    },
    subjects: [] as { name: string; grade: string; teacher: string }[],
  })

  console.log("Students : ", students)
  const { toast } = useToast()

  const GRADES = ["A", "B", "C", "D", "F"]
  const SUBJECTS = [
    "Mathematics",
    "English",
    "Science",
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Art",
    "Music",
    "Physical Education",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.studentId || !formData.fullName || !formData.email || !formData.classId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Check if student ID already exists
    if (students.some((s) => s.studentId === formData.studentId)) {
      toast({
        title: "Error",
        description: "Student ID already exists.",
        variant: "destructive",
      })
      return
    }

    onAddStudent(formData)
    setIsAddDialogOpen(false)
    resetForm()

    toast({
      title: "Success",
      description: "Student added successfully!",
    })
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      fullName: "",
      email: "",
      classId: "",
      overallGrade: "B",
      attendanceRate: 85,
      parentContact: {
        name: "",
        phone: "",
        email: "",
      },
      subjects: [],
    })
  }

  const generateStudentId = () => {
    const prefix = "STU"
    const existingIds = students.map((s) => s.studentId)
    let counter = 1
    let newId = `${prefix}${counter.toString().padStart(3, "0")}`

    while (existingIds.includes(newId)) {
      counter++
      newId = `${prefix}${counter.toString().padStart(3, "0")}`
    }

    setFormData((prev) => ({ ...prev, studentId: newId }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({
        title: "Error",
        description: "Please upload a CSV file.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const parseCSV = (csvText: string) => {
    setIsProcessing(true)
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    const requiredHeaders = ["studentid", "fullname", "email", "classid"]
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

    if (missingHeaders.length > 0) {
      setCsvErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
      setIsProcessing(false)
      return
    }

    const data: any[] = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`)
        continue
      }

      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })

      // Validate required fields
      if (!row.studentid || !row.fullname || !row.email || !row.classid) {
        errors.push(`Row ${i + 1}: Missing required fields`)
        continue
      }

      // Check if student ID already exists
      if (students.some((s) => s.studentId === row.studentid) || data.some((d) => d.studentid === row.studentid)) {
        errors.push(`Row ${i + 1}: Student ID ${row.studentid} already exists`)
        continue
      }

      // Check if class exists
      if (!classes.some((c) => c.name === row.classid)) {
        errors.push(`Row ${i + 1}: Class ${row.classid} does not exist`)
        continue
      }

      data.push(row)
    }

    setCsvData(data)
    setCsvErrors(errors)
    setIsProcessing(false)
  }

  const processBulkImport = () => {
    if (csvData.length === 0) return

    const studentsToAdd: Omit<Student, "id">[] = csvData.map((row) => ({
      studentId: row.studentid,
      fullName: row.fullname,
      email: row.email,
      classId: row.classid,
      overallGrade: row.overallgrade || "B",
      attendanceRate: Number.parseInt(row.attendancerate) || 85,
      subjects: [],
      parentContact: {
        name: row.parentname || "",
        phone: row.parentphone || "",
        email: row.parentemail || "",
      },
    }))

    onBulkAddStudents(studentsToAdd)
    setCsvData([])
    setCsvErrors([])

    toast({
      title: "Success",
      description: `${studentsToAdd.length} students imported successfully!`,
    })
  }

  const downloadTemplate = () => {
    const headers = [
      "studentid",
      "fullname",
      "email",
      "classid",
      "overallgrade",
      "attendancerate",
      "parentname",
      "parentphone",
      "parentemail",
    ]

    const sampleData = [
      "STU001,John Doe,john.doe@student.edu,Grade 10A,A,95,Jane Doe,+1234567890,jane.doe@email.com",
      "STU002,Jane Smith,jane.smith@student.edu,Grade 11B,B,88,Bob Smith,+1234567891,bob.smith@email.com",
    ]

    const csvContent = [headers.join(","), ...sampleData].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "student_import_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const addSubject = () => {
    setFormData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { name: "", grade: "B", teacher: "" }],
    }))
  }

  const updateSubject = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) => (i === index ? { ...subject, [field]: value } : subject)),
    }))
  }

  const removeSubject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Student Management</h2>
        <p className="text-muted-foreground">Add individual students or import from CSV</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {canEdit && (
          <>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentId">Student ID *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="studentId"
                          value={formData.studentId}
                          onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value }))}
                          placeholder="e.g., STU001"
                          required
                        />
                        <Button type="button" variant="outline" onClick={generateStudentId}>
                          Generate
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Student's full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="student@school.edu"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="classId">Class *</Label>
                      <Select
                        value={formData.classId}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, classId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes
                            .map((cls) => (
                              <SelectItem key={cls.id} value={cls.name}>
                                {cls.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="overallGrade">Overall Grade</Label>
                      <Select
                        value={formData.overallGrade}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, overallGrade: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="attendanceRate">Attendance Rate (%)</Label>
                      <Input
                        id="attendanceRate"
                        type="number"
                        value={formData.attendanceRate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, attendanceRate: Number.parseInt(e.target.value) || 85 }))
                        }
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Parent Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Parent/Guardian Contact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="parentName">Parent Name</Label>
                        <Input
                          id="parentName"
                          value={formData.parentContact.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              parentContact: { ...prev.parentContact, name: e.target.value },
                            }))
                          }
                          placeholder="Parent's full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentPhone">Parent Phone</Label>
                        <Input
                          id="parentPhone"
                          value={formData.parentContact.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              parentContact: { ...prev.parentContact, phone: e.target.value },
                            }))
                          }
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="parentEmail">Parent Email</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={formData.parentContact.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            parentContact: { ...prev.parentContact, email: e.target.value },
                          }))
                        }
                        placeholder="parent@email.com"
                      />
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Subjects</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subject
                      </Button>
                    </div>
                    {formData.subjects.map((subject, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-end">
                        <div>
                          <Label>Subject</Label>
                          <Select value={subject.name} onValueChange={(value) => updateSubject(index, "name", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {SUBJECTS.map((subj) => (
                                <SelectItem key={subj} value={subj}>
                                  {subj}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Grade</Label>
                          <Select value={subject.grade} onValueChange={(value) => updateSubject(index, "grade", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {GRADES.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Teacher</Label>
                          <Input
                            value={subject.teacher}
                            onChange={(e) => updateSubject(index, "teacher", e.target.value)}
                            placeholder="Teacher name"
                          />
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => removeSubject(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false)
                        resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Student</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import Students from CSV</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                    <TabsTrigger value="preview">Preview & Import</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">CSV Format Requirements</h3>
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                          <p className="text-sm">
                            <strong>Required columns:</strong> studentid, fullname, email, classid
                          </p>
                          <p className="text-sm">
                            <strong>Optional columns:</strong> overallgrade, attendancerate, parentname, parentphone,
                            parentemail
                          </p>
                          <p className="text-sm text-muted-foreground">Column names are case-insensitive</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={downloadTemplate}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                      </div>

                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Upload CSV File</p>
                        <p className="text-sm text-muted-foreground mb-4">Select a CSV file containing student data</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button onClick={() => fileInputRef.current?.click()}>Choose File</Button>
                      </div>

                      {isProcessing && (
                        <div className="text-center py-4">
                          <p>Processing CSV file...</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    {csvErrors.length > 0 && (
                      <Card className="border-red-200">
                        <CardHeader>
                          <CardTitle className="text-red-600 flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Import Errors
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {csvErrors.map((error, index) => (
                              <li key={index} className="text-sm text-red-600">
                                • {error}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {csvData.length > 0 && (
                      <Card className="border-green-200">
                        <CardHeader>
                          <CardTitle className="text-green-600 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Ready to Import ({csvData.length} students)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2">Student ID</th>
                                  <th className="text-left p-2">Name</th>
                                  <th className="text-left p-2">Email</th>
                                  <th className="text-left p-2">Class</th>
                                  <th className="text-left p-2">Grade</th>
                                </tr>
                              </thead>
                              <tbody>
                                {csvData.slice(0, 10).map((row, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="p-2">{row.studentid}</td>
                                    <td className="p-2">{row.fullname}</td>
                                    <td className="p-2">{row.email}</td>
                                    <td className="p-2">{row.classid}</td>
                                    <td className="p-2">{row.overallgrade || "B"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {csvData.length > 10 && (
                              <p className="text-center text-muted-foreground mt-2">
                                ... and {csvData.length - 10} more students
                              </p>
                            )}
                          </div>
                          <div className="flex justify-end mt-4">
                            <Button onClick={processBulkImport} disabled={csvData.length === 0}>
                              <Users className="h-4 w-4 mr-2" />
                              Import {csvData.length} Students
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {csvData.length === 0 && csvErrors.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4" />
                        <p>No file uploaded yet. Go to the Upload tab to select a CSV file.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <Badge variant="default">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.filter((c) => c.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <Badge variant="secondary">%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.length > 0
                ? Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / students.length)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Grade Students</CardTitle>
            <Badge variant="default" className="bg-green-500">
              A
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.filter((s) => s.overallGrade === "A").length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
