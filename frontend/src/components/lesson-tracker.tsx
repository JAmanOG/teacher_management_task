"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, BookOpen, Search } from "lucide-react"
import type { Chapter, Teacher } from "@/app/page"

interface LessonTrackerProps {
  chapters: Chapter[]
  teachers: Teacher[]
  onUpdateChapter: (chapter: Chapter) => void
  onViewChapter: (chapter: Chapter) => void
  canEdit?: boolean
}

export function LessonTracker({ chapters, teachers, onUpdateChapter, onViewChapter }: LessonTrackerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [subjectFilter, setSubjectFilter] = useState<string>("all")
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [completedLessons, setCompletedLessons] = useState("")
  const [notes, setNotes] = useState("")

  const filteredChapters = chapters.filter((chapter) => {
    const teacher = teachers.find((t) => t.id === chapter.teacherId)
    const matchesSearch =
      chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || chapter.status === statusFilter
    const matchesSubject = subjectFilter === "all" || chapter.subject === subjectFilter

    return matchesSearch && matchesStatus && matchesSubject
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500"
      case "In Progress":
        return "bg-blue-500"
      case "Overdue":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "Completed":
        return "default"
      case "In Progress":
        return "secondary"
      case "Overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const handleUpdateProgress = () => {
    if (!selectedChapter) return

    const completed = Number.parseInt(completedLessons)
    if (completed < 0 || completed > selectedChapter.totalLessons) return

    let newStatus: Chapter["status"] = "Not Started"
    if (completed === 0) {
      newStatus = "Not Started"
    } else if (completed === selectedChapter.totalLessons) {
      newStatus = "Completed"
    } else {
      const dueDate = selectedChapter.dueDate ? new Date(selectedChapter.dueDate) : null
      const today = new Date()
      newStatus = dueDate && today > dueDate ? "Overdue" : "In Progress"
    }

    const updatedChapter: Chapter = {
      ...selectedChapter,
      completedLessons: completed,
      status: newStatus,
    }

    onUpdateChapter(updatedChapter)
    setIsUpdateDialogOpen(false)
    setSelectedChapter(null)
    setCompletedLessons("")
    setNotes("")
  }

  const subjects = [...new Set(chapters.map((c) => c.subject))]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[160px]">
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

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChapters.map((chapter) => {
          const teacher = teachers.find((t) => t.id === chapter.teacherId)
          const progressPercentage = (chapter.completedLessons / chapter.totalLessons) * 100

          return (
            <Card key={chapter.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-none mb-2">{chapter.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{chapter.subject}</p>
                    <p className="text-sm text-muted-foreground">Teacher: {teacher?.fullName || "Unknown"}</p>
                  </div>
                  <Badge variant={getStatusVariant(chapter.status)} className={getStatusColor(chapter.status)}>
                    {chapter.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {chapter.completedLessons}/{chapter.totalLessons} lessons
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">{Math.round(progressPercentage)}% complete</p>
                </div>

                {/* Class and Due Date */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="h-3 w-3 mr-2" />
                    <span>Class: {chapter.classId}</span>
                  </div>
                  {chapter.dueDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>Due: {new Date(chapter.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}

                <Button onClick={() => onViewChapter(chapter)} size="sm" className="w-full" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredChapters.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No chapters found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" || subjectFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No chapters available to track"}
          </p>
        </div>
      )}

      {/* Update Progress Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Chapter Progress</DialogTitle>
          </DialogHeader>
          {selectedChapter && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedChapter.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedChapter.subject}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="completed-lessons">Completed Lessons</Label>
                <Input
                  id="completed-lessons"
                  type="number"
                  min="0"
                  max={selectedChapter.totalLessons}
                  value={completedLessons}
                  onChange={(e) => setCompletedLessons(e.target.value)}
                  placeholder={`0 - ${selectedChapter.totalLessons}`}
                />
                <p className="text-xs text-muted-foreground">Total lessons: {selectedChapter.totalLessons}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about the progress..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProgress}>Update Progress</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
