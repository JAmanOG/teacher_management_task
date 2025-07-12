"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Circle,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import type { Chapter, Teacher, Lesson } from "@/app/page";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { baseUrl } from "../../constant";
interface ChapterDetailsModalProps {
  chapter: Chapter | null;
  teacher: Teacher | null;
  lessons: Lesson[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateChapter: (chapter: Chapter) => void;
  onUpdateLesson: (lesson: Lesson) => void;
  onAddLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  canEdit: boolean;
}

export function ChapterDetailsModal({
  chapter,
  teacher,
  lessons,
  isOpen,
  onClose,
  onUpdateChapter,
  onUpdateLesson,
  onAddLesson,
  onDeleteLesson,
  canEdit,
}: ChapterDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { user, accesstoken } = useAuth();
  const [editData, setEditData] = useState({
    title: "",
    dueDate: "",
    notes: "",
  });
  const [newLesson, setNewLesson] = useState({
    title: "",
    duration: "",
    notes: "",
  });
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [localChapter, setLocalChapter] = useState(chapter);

  const currentUser = user || null;

  if (!chapter) return null;

  const progressPercentage = localChapter 
    ? (localChapter.completedLessons / localChapter.totalLessons) * 100
    : 0;
  const completedLessons = lessons.filter((l) => l.isCompleted).length;
  const pendingLessons = lessons.filter((l) => !l.isCompleted).length;

  const hasPermission = (permission: string) => {
    return currentUser?.permissions?.includes(permission) || false;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "In Progress":
        return "bg-blue-500";
      case "Overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Overdue":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleEditChapter = () => {
    setEditData({
      title: chapter.title,
      dueDate: chapter.dueDate || "",
      notes: "", // You might want to add notes field to Chapter interface
    });
    setIsEditing(true);
  };

  const handleSaveChapter = async () => {
    const updatedChapter: Chapter = {
      ...chapter,
      title: editData.title,
      dueDate: editData.dueDate || undefined,
    };
    if (!hasPermission("edit_chapter")) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to edit chapters.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/chapter/chapters/${chapter.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accesstoken}`,
          },
          body: JSON.stringify(updatedChapter),
        }
      );

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to update chapter.",
          variant: "destructive",
        });
        return;
      }

      const updatedChapterData: Chapter = await response.json();
      toast({
        title: "Chapter Updated",
        description: `Chapter "${updatedChapterData.title}" has been updated successfully.`,
        variant: "success",
      });

      onUpdateChapter(updatedChapter);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update chapter:", error);
      toast({
        title: "Error",
        description: "Failed to update chapter. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleToggleLesson = async (lesson: Lesson) => {
    if (!hasPermission("edit_lessons")) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to edit lessons.",
        variant: "destructive",
      });
      return;
    }

    const updatedLesson: Lesson = {
      ...lesson,
      isCompleted: !lesson.isCompleted,
      completedDate: !lesson.isCompleted ? new Date().toISOString() : undefined,
    };
    console.log()
    try {
      const response = await fetch(`${baseUrl}/lesson/lessons/${lesson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accesstoken}`,
        },
        body: JSON.stringify(updatedLesson),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to update lesson status.",
          variant: "destructive",
        });
        return;
      }

      // Update the UI only after successful API call
      onUpdateLesson(updatedLesson);

      try {
        const chapterRes = await fetch(`${baseUrl}/chapter/chapters/${chapter.id}`, {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        });
        if (chapterRes.ok) {
          const updatedChapterData: Chapter = await chapterRes.json();
          onUpdateChapter(updatedChapterData);
        }
      } catch (err) {
        console.error("Failed to refresh chapter data:", err);
      }

      // Update chapter progress
      const newCompletedCount = lessons.filter((l) =>
        l.id === lesson.id ? !lesson.isCompleted : l.isCompleted
      ).length;

      const updatedChapter: Chapter = {
        ...chapter,
        completedLessons: newCompletedCount,
        status:
          newCompletedCount === 0
            ? "Not Started"
            : newCompletedCount === lessons.length
            ? "Completed"
            : "In Progress",
      };

      onUpdateChapter(updatedChapter);
      setLocalChapter(updatedChapter);

      toast({
        title: "Lesson Updated",
        description: `Lesson "${lesson.title}" has been ${
          updatedLesson.isCompleted ? "completed" : "marked as pending"
        }.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating lesson:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddNewLesson = async () => {
    if (!newLesson.title.trim()) return;

    if (!hasPermission("view_lessons")) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to add lessons.",
        variant: "destructive",
      });
      return;
    }

    if (!chapter) {
      toast({
        title: "Error",
        description: "Chapter not found.",
        variant: "destructive",
      });
      return;
    }
    // Validate the new lesson before adding
    if (!newLesson.title.trim()) {
      toast({
        title: "Error",
        description: "Lesson title is required.",
        variant: "destructive",
      });
      return;
    }

    if (
      newLesson.duration &&
      (isNaN(Number(newLesson.duration)) || Number(newLesson.duration) <= 0)
    ) {
      toast({
        title: "Error",
        description: "Duration must be a valid number greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (newLesson.notes && newLesson.notes.length > 500) {
      toast({
        title: "Error",
        description: "Notes cannot exceed 500 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/lesson/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accesstoken}`,
        },
        body: JSON.stringify({
          title: newLesson.title,
          chapterId: chapter.id,
          isCompleted: false,
          duration: newLesson.duration
            ? Number.parseInt(newLesson.duration)
            : undefined,
          notes: newLesson.notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to add lesson.",
          variant: "destructive",
        });
        return;
      }

      const lessonData: Lesson = await response.json();
      toast({
        title: "Lesson Added",
        description: `Lesson "${lessonData.title}" has been added successfully.`,
        variant: "success",
      });

      onAddLesson(lessonData);
      
      setNewLesson({ title: "", duration: "", notes: "" });
      setShowAddLesson(false);

      const updatedChapter: Chapter = {
        ...chapter,
        totalLessons: chapter.totalLessons + 1,
      };
      onUpdateChapter(updatedChapter);
    } catch (error) {
      console.error("Failed to add lesson:", error);
      toast({
        title: "Error",
        description: "Failed to add lesson. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!hasPermission("delete_lessons")) {
      alert("You do not have permission to delete lessons.");
      toast({
        title: "Permission Denied",
        description: "You do not have permission to delete lessons.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/lesson/lessons/${lessonId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete lesson.",
          variant: "destructive",
        });
        return;
      }

      onDeleteLesson(lessonId);
      toast({
        title: "Lesson Deleted",
        description: "The lesson has been deleted successfully.",
        variant: "success",
      });

      // Update chapter total lessons
      const updatedChapter: Chapter = {
        ...chapter,
        totalLessons: chapter.totalLessons - 1,
      };
      onUpdateChapter(updatedChapter);
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      toast({
        title: "Error",
        description: "Failed to delete lesson. Please try again later.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Chapter Details</span>
            </DialogTitle>
            {canEdit && !isEditing && (
              <Button variant="outline" size="sm" onClick={handleEditChapter}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chapter Header */}
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chapter-title">Chapter Title</Label>
                  <Input
                    id="chapter-title"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={editData.dueDate}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSaveChapter} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{chapter.title}</h2>
                    <p className="text-muted-foreground">{chapter.subject}</p>
                  </div>
                  <Badge
                    variant={getStatusVariant(chapter.status)}
                    className={getStatusColor(chapter.status)}
                  >
                    {chapter.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Teacher: {teacher?.fullName || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Class: {chapter.classId}</span>
                  </div>
                  {chapter.dueDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Due: {new Date(chapter.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {completedLessons}/{lessons.length} lessons completed (
                    {Math.round(progressPercentage)}%)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {completedLessons}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {pendingLessons}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for detailed view */}
          <Tabs defaultValue="lessons" className="w-full">
            <TabsList>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="progress">Progress Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes & Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Lesson List</h3>
                {canEdit && (
                  <Button onClick={() => setShowAddLesson(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                )}
              </div>

              {showAddLesson && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Add New Lesson</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lesson-title">Lesson Title *</Label>
                        <Input
                          id="lesson-title"
                          value={newLesson.title}
                          onChange={(e) =>
                            setNewLesson((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Enter lesson title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lesson-duration">
                          Duration (minutes)
                        </Label>
                        <Input
                          id="lesson-duration"
                          type="number"
                          value={newLesson.duration}
                          onChange={(e) =>
                            setNewLesson((prev) => ({
                              ...prev,
                              duration: e.target.value,
                            }))
                          }
                          placeholder="45"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lesson-notes">Notes</Label>
                      <Textarea
                        id="lesson-notes"
                        value={newLesson.notes}
                        onChange={(e) =>
                          setNewLesson((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Add lesson notes or resources..."
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAddNewLesson}
                        size="sm"
                        disabled={!newLesson.title.trim()}
                      >
                        Add Lesson
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddLesson(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <Card
                    key={lesson.id}
                    className={
                      lesson.isCompleted
                        ? "bg-green-50 dark:bg-green-950/20"
                        : ""
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              console.log(lesson);
                              handleToggleLesson(lesson);
                            }}
                            disabled={!canEdit}
                            className="h-8 w-8"
                          >
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <h4
                              className={`font-medium ${
                                lesson.isCompleted
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              Lesson {index + 1}: {lesson.title}
                            </h4>
                            {lesson.duration && (
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {lesson.duration} minutes
                              </div>
                            )}
                            {lesson.completedDate && (
                              <p className="text-xs text-green-600 mt-1">
                                Completed:{" "}
                                {new Date(
                                  lesson.completedDate
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {lesson.notes && (
                        <div className="mt-2 pl-11">
                          <p className="text-sm text-muted-foreground">
                            {lesson.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {lessons.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first lesson to this chapter
                  </p>
                  {canEdit && (
                    <Button onClick={() => setShowAddLesson(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Lesson
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <h3 className="text-lg font-semibold">Progress Timeline</h3>
              <div className="space-y-4">
                {lessons
                  .filter((l) => l.isCompleted && l.completedDate)
                  .sort(
                    (a, b) =>
                      new Date(b.completedDate!).getTime() -
                      new Date(a.completedDate!).getTime()
                  )
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center space-x-4 p-3 bg-muted rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed on{" "}
                          {new Date(lesson.completedDate!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                {lessons.filter((l) => l.isCompleted).length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No completed lessons yet
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <h3 className="text-lg font-semibold">Notes & Resources</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Chapter Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add chapter notes, resources, or important information..."
                    rows={6}
                    disabled={!canEdit}
                  />
                  {canEdit && (
                    <Button className="mt-2" size="sm">
                      Save Notes
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
