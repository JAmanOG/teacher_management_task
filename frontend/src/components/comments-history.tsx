"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MessageSquare, Plus, Clock, Filter } from "lucide-react"
import type { Comment, Teacher, Chapter } from "@/app/page"

interface CommentsHistoryProps {
  comments: Comment[]
  teachers: Teacher[]
  chapters: Chapter[]
  currentUser: Teacher
  onAddComment: (comment: Omit<Comment, "id" | "createdAt">) => void
  canComment: boolean
}

export function CommentsHistory({
  comments,
  teachers,
  chapters,
  currentUser,
  onAddComment,
  canComment,
}: CommentsHistoryProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterChapter, setFilterChapter] = useState<string>("all")
  const [formData, setFormData] = useState({
    type: "general" as Comment["type"],
    chapterId: "",
    content: "",
    priority: "medium" as Comment["priority"],
  })

  const resetForm = () => {
    setFormData({
      type: "general",
      chapterId: "",
      content: "",
      priority: "medium",
    })
  }

  const handleAddComment = () => {
    if (!formData.content.trim()) return

    onAddComment({
      type: formData.type,
      chapterId: formData.type === "chapter" ? formData.chapterId : undefined,
      content: formData.content,
      priority: formData.priority,
      authorId: currentUser.id,
    })

    resetForm()
    setIsAddDialogOpen(false)
  }

  const filteredComments = comments.filter((comment) => {
    const matchesType = filterType === "all" || comment.type === filterType
    const matchesChapter = filterChapter === "all" || comment.chapterId === filterChapter
    return matchesType && matchesChapter
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getPriorityColor = (priority: Comment["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeColor = (type: Comment["type"]) => {
    switch (type) {
      case "chapter":
        return "bg-blue-500"
      case "student":
        return "bg-purple-500"
      case "general":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Comments & History</h2>
          <p className="text-muted-foreground">Track comments and important notes</p>
        </div>
        {canComment && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Comment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: Comment["type"]) => setFormData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="chapter">Chapter</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: Comment["priority"]) =>
                        setFormData((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.type === "chapter" && (
                  <div className="space-y-2">
                    <Label>Chapter</Label>
                    <Select
                      value={formData.chapterId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, chapterId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Comment *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your comment..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddComment} disabled={!formData.content.trim()}>
                    Add Comment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="chapter">Chapter</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterChapter} onValueChange={setFilterChapter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Chapter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chapters</SelectItem>
            {chapters.map((chapter) => (
              <SelectItem key={chapter.id} value={chapter.id}>
                {chapter.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map((comment) => {
          const author = teachers.find((t) => t.id === comment.authorId)
          const chapter = comment.chapterId ? chapters.find((c) => c.id === comment.chapterId) : null

          return (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={author?.avatar || "/placeholder.svg"} alt={author?.fullName} />
                    <AvatarFallback className="text-xs">{getInitials(author?.fullName || "")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{author?.fullName}</span>
                        <Badge variant="outline" className={`text-xs ${getTypeColor(comment.type)}`}>
                          {comment.type}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(comment.priority)}`}>
                          {comment.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(comment.createdAt).toLocaleDateString()}{" "}
                        {new Date(comment.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    {chapter && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chapter: {chapter.title}
                      </div>
                    )}

                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredComments.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No comments found</h3>
            <p className="text-muted-foreground mb-4">
              {filterType !== "all" || filterChapter !== "all"
                ? "Try adjusting your filters"
                : "Start by adding your first comment"}
            </p>
            {canComment && filterType === "all" && filterChapter === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
