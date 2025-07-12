"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
  Users,
  Search,
  Filter,
  Copy,
} from "lucide-react";
import type { Chapter, Teacher, Class } from "@/app/page";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "./ui/use-toast";
import { baseUrl } from "../../constant";

interface ChapterCreationProps {
  chapters: Chapter[];
  teachers: Teacher[];
  classes: Class[];
  onAddChapter: (chapterData: Omit<Chapter, "id">) => void;
  onUpdateChapter: (chapterData: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
  onDuplicateChapter: (chapterId: string) => void;
  canEdit: boolean;
}

const CHAPTER_TEMPLATES = [
  {
    id: "basic",
    name: "Basic Chapter",
    description: "Standard chapter with lessons",
    totalLessons: 8,
  },
  {
    id: "advanced",
    name: "Advanced Chapter",
    description: "Comprehensive chapter with projects",
    totalLessons: 12,
  },
  {
    id: "review",
    name: "Review Chapter",
    description: "Quick review and assessment",
    totalLessons: 4,
  },
];

export function ChapterCreation({
  chapters,
  teachers,
  classes,
  onAddChapter,
  onUpdateChapter,
  onDeleteChapter,
  onDuplicateChapter,
  canEdit,
}: ChapterCreationProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    teacherId: "",
    classId: "",
    totalLessons: "",
    dueDate: "",
    description: "",
    objectives: [] as string[],
    resources: [] as string[],
    difficulty: "medium" as "easy" | "medium" | "hard",
  });
  const { user, accesstoken, refreshAccessToken } = useAuth();

  const currentUser = user;

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      teacherId: "",
      classId: "",
      totalLessons: "",
      dueDate: "",
      description: "",
      objectives: [],
      resources: [],
      difficulty: "medium",
    });
    setSelectedTemplate("");
  };

  const hasPermission = (permission: string) => {
    return currentUser?.permissions?.includes(permission) || false;
  };

  const applyTemplate = (templateId: string) => {
    const template = CHAPTER_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        totalLessons: template.totalLessons.toString(),
      }));
    }
  };

  const handleAddChapter = async () => {
    if (
      !formData.title ||
      !formData.subject ||
      !formData.teacherId ||
      !formData.classId
    ) {
      console.warn("Missing required fields:", formData);
      return toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
    }
    if (!hasPermission("create_chapter")) {
      alert("You do not have permission to create chapters.");
      toast({
        title: "Permission Denied",
        description: "You do not have permission to create chapters.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/chapter/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accesstoken}`,
        },
        body: JSON.stringify({
          title: formData.title,
          subject: formData.subject,
          teacherId: formData.teacherId,
          classId: formData.classId,
          status: "Not Started",
          totalLessons: Number.parseInt(formData.totalLessons) || 8,
          completedLessons: 0,
          dueDate: formData.dueDate || undefined,
          description: formData.description,
          objectives: formData.objectives,
          resources: formData.resources,
          difficulty: formData.difficulty,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await refreshAccessToken();
          return;
        }
        toast({
          title: "Error",
          description: "Failed to create chapter. Please try again.",
          variant: "destructive",
        });
        return;
      }
      const newChapter = await response.json();

      toast({
        title: "Chapter Created",
        description: `Chapter "${newChapter.title}" created successfully.`,
        variant: "success",
      });

      // Call the parent function to update the chapter list

      onAddChapter({
        title: formData.title,
        subject: formData.subject,
        teacherId: formData.teacherId,
        classId: formData.classId,
        totalLessons: Number.parseInt(formData.totalLessons) || 8,
        completedLessons: 0,
        dueDate: formData.dueDate || undefined,
        status: "Not Started",
        description: formData.description,
        objectives: formData.objectives,
        resources: formData.resources,
        difficulty: formData.difficulty,
      });

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error creating chapter:", error);
      toast({
        title: "Error",
        description: "Failed to create chapter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditChapter = async () => {
    if (!editingChapter || !formData.title || !formData.subject) return;
    if (!hasPermission("edit_chapter")) {
      alert("You do not have permission to edit chapters.");
      toast({
        title: "Permission Denied",
        description: "You do not have permission to edit chapters.",
        variant: "destructive",
      });
      return;
    }

    if (
      editingChapter.teacherId &&
      editingChapter.teacherId.toString() !== currentUser?.id &&
      currentUser?.role !== "Admin" &&
      currentUser?.role !== "Principal" &&
      currentUser?.role !== "Head Teacher"
    ) {
      // alert("You can only edit chapters assigned to you.");
      toast({
        title: "Permission Denied",
        description: "You can only edit chapters assigned to you.",
        variant: "destructive",
      });
      return;
    }

    if (!editingChapter.id) {
      console.warn("Editing chapter does not have an ID:", editingChapter);
      return toast({
        title: "Error",
        description: "Chapter ID is missing.",
        variant: "destructive",
      });
    }

    if (!formData.teacherId) {
      console.warn("Teacher ID is required for editing chapter.");
      return toast({
        title: "Missing Required Fields",
        description: "Please select a teacher.",
        variant: "destructive",
      });
    }

    try {
      const response = await fetch(
        `${baseUrl}/chapter/chapters/${editingChapter.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accesstoken}`,
          },
          body: JSON.stringify({
            title: formData.title,
            subject: formData.subject,
            teacherId: formData.teacherId,
            classId: formData.classId,
            totalLessons: Number.parseInt(formData.totalLessons) || 8,
            dueDate: formData.dueDate || undefined,
            description: formData.description,
            objectives: formData.objectives,
            resources: formData.resources,
            difficulty: formData.difficulty,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await refreshAccessToken();
          return;
        }
        toast({
          title: "Error",
          description: "Failed to update chapter. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const updatedChapter = await response.json();

      toast({
        title: "Chapter Updated",
        description: `Chapter "${updatedChapter.title}" updated successfully.`,
        variant: "success",
      });

      onUpdateChapter({
        ...editingChapter,
        title: formData.title,
        subject: formData.subject,
        teacherId: formData.teacherId,
        classId: formData.classId,
        totalLessons: Number.parseInt(formData.totalLessons) || 8,
        dueDate: formData.dueDate || undefined,
        description: formData.description,
        objectives: formData.objectives,
        resources: formData.resources,
        difficulty: formData.difficulty,
      });

      resetForm();
      setEditingChapter(null);
    } catch (error) {
      console.error("Error updating chapter:", error);
      toast({
        title: "Error",
        description: "Failed to update chapter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      subject: chapter.subject,
      teacherId: chapter.teacherId,
      classId: chapter.classId,
      totalLessons: chapter.totalLessons.toString(),
      dueDate: chapter.dueDate || "",
      description: chapter.description || "",
      objectives: chapter.objectives || [],
      resources: chapter.resources || [],
      difficulty: chapter.difficulty || "medium",
    });
  };

  const handleDeleteChapter = async() => {
    if (!deletingChapter) return;
    if (!hasPermission("delete_chapter")) {
      alert("You do not have permission to delete chapters.");
      toast({
        title: "Permission Denied",
        description: "You do not have permission to delete chapters.",
        variant: "destructive",
      });
      return;
    }

    if (
      deletingChapter.teacherId &&
      deletingChapter.teacherId.toString() !== currentUser?.id &&
      currentUser?.role !== "Admin" &&
      currentUser?.role !== "Principal" &&
      currentUser?.role !== "Head Teacher"
    ) {
      // alert("You can only delete chapters assigned to you.");
      toast({
        title: "Permission Denied",
        description: "You can only delete chapters assigned to you.",
        variant: "destructive",
      });
      return;
    }

    if (!deletingChapter.id) {
      console.warn("Deleting chapter does not have an ID:", deletingChapter);
      return toast({
        title: "Error",
        description: "Chapter ID is missing.",
        variant: "destructive",
      });
    }

    try {
      const response = await fetch(
        `${baseUrl}/chapter/chapters/${deletingChapter.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          refreshAccessToken();
          return;
        }
        toast({
          title: "Error",
          description: "Failed to delete chapter. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Chapter Deleted",
        description: `Chapter "${deletingChapter.title}" deleted successfully.`,
        variant: "success",
      });

      onDeleteChapter(deletingChapter.id);

      setDeletingChapter(null);
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast({
        title: "Error",
        description: "Failed to delete chapter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addObjective = () => {
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, ""],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => (i === index ? value : obj)),
    }));
  };

  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, ""],
    }));
  };

  const updateResource = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.map((res, i) => (i === index ? value : res)),
    }));
  };

  const removeResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const filteredChapters = chapters.filter((chapter) => {
    const matchesSearch =
      chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      subjectFilter === "all" || chapter.subject === subjectFilter;
    const matchesStatus =
      statusFilter === "all" || chapter.status === statusFilter;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const getTeacher = (teacherId: string) => {
    return teachers.find((t) => t.id === teacherId);
  };

  const getClass = (classId: string) => {
    return classes.find((c) => c.name === classId);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const availableSubjects = [...new Set(teachers.map((t) => t.subject))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chapter Creation</h2>
          <p className="text-muted-foreground">
            Create and manage course chapters
          </p>
        </div>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Chapter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Chapter</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="template">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Chapter Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="e.g., Introduction to Algebra"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject *</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, subject: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Teacher *</Label>
                      <Select
                        value={formData.teacherId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, teacherId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers
                            .filter(
                              (t) =>
                                !formData.subject ||
                                t.subject === formData.subject
                            )
                            .map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.fullName} - {teacher.subject}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Class *</Label>
                      <Select
                        value={formData.classId}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, classId: value }));
                          console.log("Value oka", value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Total Lessons</Label>
                      <Input
                        type="number"
                        value={formData.totalLessons}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            totalLessons: e.target.value,
                          }))
                        }
                        placeholder="8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value: "easy" | "medium" | "hard") =>
                          setFormData((prev) => ({
                            ...prev,
                            difficulty: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Chapter description and overview..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Learning Objectives</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addObjective}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Objective
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.objectives.map((objective, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              value={objective}
                              onChange={(e) =>
                                updateObjective(index, e.target.value)
                              }
                              placeholder="Learning objective..."
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeObjective(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Resources & Materials</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addResource}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Resource
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.resources.map((resource, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              value={resource}
                              onChange={(e) =>
                                updateResource(index, e.target.value)
                              }
                              placeholder="Resource name or URL..."
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeResource(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="template" className="space-y-4">
                  <div>
                    <Label className="text-base">Choose a Template</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a pre-configured template to get started quickly
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {CHAPTER_TEMPLATES.map((template) => (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-colors ${
                            selectedTemplate === template.id
                              ? "ring-2 ring-primary"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedTemplate(template.id);
                            applyTemplate(template.id);
                          }}
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">
                              {template.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground mb-2">
                              {template.description}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {template.totalLessons} lessons
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddChapter}>Create Chapter</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {availableSubjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChapters.map((chapter) => {
          const teacher = getTeacher(chapter.teacherId);
          const classItem = getClass(chapter.classId);
          const progressPercentage =
            (chapter.completedLessons / chapter.totalLessons) * 100;

          return (
            <Card
              key={chapter.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-none mb-2">
                      {chapter.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{chapter.subject}</Badge>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(chapter.status)}
                      >
                        {chapter.status}
                      </Badge>
                      {chapter.difficulty && (
                        <Badge
                          variant="outline"
                          className={getDifficultyColor(chapter.difficulty)}
                        >
                          {chapter.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDuplicateChapter(chapter.id)}
                        className="h-8 w-8"
                        title="Duplicate Chapter"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(chapter)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingChapter(chapter)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {chapter.completedLessons}/{chapter.totalLessons} lessons
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher?.fullName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{classItem?.name}</span>
                  </div>
                </div>

                {chapter.dueDate && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Due: {new Date(chapter.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {chapter.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {chapter.description}
                  </p>
                )}

                {chapter.objectives && chapter.objectives.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Objectives:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {chapter.objectives
                        .slice(0, 2)
                        .map((objective, index) => (
                          <li key={index} className="line-clamp-1">
                            • {objective}
                          </li>
                        ))}
                      {chapter.objectives.length > 2 && (
                        <li className="text-xs">
                          +{chapter.objectives.length - 2} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredChapters.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No chapters found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || subjectFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first chapter"}
          </p>
          {canEdit &&
            !searchTerm &&
            subjectFilter === "all" &&
            statusFilter === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Chapter
              </Button>
            )}
        </div>
      )}

      {/* Edit Dialog - Similar structure to Add Dialog */}
      <Dialog
        open={!!editingChapter}
        onOpenChange={() => setEditingChapter(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chapter Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g., Introduction to Algebra"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, subject: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teacher *</Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, teacherId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers
                        .filter(
                          (t) =>
                            !formData.subject || t.subject === formData.subject
                        )
                        .map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.fullName} - {teacher.subject}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, classId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.name}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Total Lessons</Label>
                  <Input
                    type="number"
                    value={formData.totalLessons}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        totalLessons: e.target.value,
                      }))
                    }
                    placeholder="8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") =>
                      setFormData((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Chapter description and overview..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Learning Objectives</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addObjective}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Objective
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={objective}
                          onChange={(e) =>
                            updateObjective(index, e.target.value)
                          }
                          placeholder="Learning objective..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeObjective(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Resources & Materials</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addResource}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Resource
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.resources.map((resource, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={resource}
                          onChange={(e) =>
                            updateResource(index, e.target.value)
                          }
                          placeholder="Resource name or URL..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeResource(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditingChapter(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditChapter}>Update Chapter</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingChapter}
        onOpenChange={() => setDeletingChapter(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              chapter <strong>{deletingChapter?.title}</strong> and all
              associated lessons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapter}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
