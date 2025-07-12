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
  Users,
  BookOpen,
  Search,
  Filter,
} from "lucide-react";
import type { Class, Teacher, Student } from "@/app/page";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { baseUrl } from "../../constant";

interface ClassManagementProps {
  classes: Class[];
  teachers: Teacher[];
  students: Student[];
  onAddClass: (classData: Omit<Class, "id">) => void;
  onUpdateClass: (classData: Class) => void;
  onDeleteClass: (classId: string) => void;
  canEdit: boolean;
}

const GRADE_LEVELS = [
  "JKG",
  "SKG",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "higherEducation",
];

const SECTIONS = ["A", "B", "C", "D", "E"];

export function ClassManagement({
  classes,
  teachers,
  students,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  canEdit,
}: ClassManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    section: "",
    capacity: "",
    classTeacherId: "",
    room: "",
    description: "",
    subjects: [] as string[],
  });
  const {
    user,

    accesstoken,
    refreshAccessToken,
  } = useAuth();

  const { toast } = useToast();
  const currentUser = user;

  const resetForm = () => {
    setFormData({
      name: "",
      grade: "",
      section: "",
      capacity: "",
      classTeacherId: "",
      room: "",
      description: "",
      subjects: [],
    });
  };

  const hasPermission = (permission: string) => {
    return currentUser?.permissions?.includes(permission) || false;
  };

  const handleAddClass = async () => {
    if (!hasPermission("add_classes")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to add classes.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.grade || !formData.section) return;
    try {
      const response = await fetch(`${baseUrl}/class/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accesstoken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          gradeLevel: formData.grade,
          section: formData.section,
          capacity: Number.parseInt(formData.capacity) || 30,
          classTeacherId: formData.classTeacherId,
          room: formData.room,
          description: formData.description,
          subjects: formData.subjects,
          academicYear: new Date().getFullYear().toString(),
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized access
          refreshAccessToken();
          return;
        }
        throw new Error("Failed to add class");
      }

      const newClass: Class = await response.json();

      onAddClass({
        name: formData.name,
        grade: formData.grade,
        section: formData.section,
        capacity: Number.parseInt(formData.capacity) || 30,
        classTeacherId: formData.classTeacherId,
        room: formData.room,
        description: formData.description,
        subjects: formData.subjects,
        studentCount: 0,
        isActive: true,
      });
      resetForm();
      setIsAddDialogOpen(false);

      toast({
        title: "Class Added",
        description: `Class ${newClass.name} has been successfully added.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error adding class:", error);
      toast({
        title: "Error",
        description: "Failed to add class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditClass = async () => {
    // if (!editingClass || !formData.name || !formData.grade) return
    if (!hasPermission("edit_classes")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit classes.",
        variant: "destructive",
      });
      return;
    }

    if (!editingClass || !formData.name || !formData.grade || !formData.section)
      return;

    if (
      editingClass.name === formData.name &&
      editingClass.grade === formData.grade &&
      editingClass.section === formData.section
    ) {
      toast({
        title: "No Changes",
        description: "No changes were made to the class.",
        variant: "info",
      });
      setEditingClass(null);
      return;
    }

    if (formData.capacity && isNaN(Number(formData.capacity))) {
      toast({
        title: "Invalid Capacity",
        description: "Capacity must be a valid number.",
        variant: "destructive",
      });
      return;
    }

    if (formData.capacity && Number(formData.capacity) <= 0) {
      toast({
        title: "Invalid Capacity",
        description: "Capacity must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    // Update class data
    // const updatedClass: Class = {
    //   ...editingClass,
    //   name: formData.name,
    //   grade: formData.grade,
    //   section: formData.section,
    //   capacity: Number.parseInt(formData.capacity) || 30,
    //   classTeacherId: formData.classTeacherId,
    //   room: formData.room,
    //   description: formData.description,
    //   subjects: formData.subjects,
    // }

    // Call the update function with the updated class data
    try {
      const response = await fetch(
        `${baseUrl}/class/classes/${editingClass.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accesstoken}`,
          },
          body: JSON.stringify({
            name: formData.name,
            gradeLevel: formData.grade,
            section: formData.section,
            capacity: Number.parseInt(formData.capacity) || 30,
            classTeacherId: formData.classTeacherId,
            room: formData.room,
            description: formData.description,
            subjects: formData.subjects,
            academicYear: new Date().getFullYear().toString(),
          }),
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized access
          refreshAccessToken();
          return;
        }
        throw new Error("Failed to update class");
      }
      const updatedClassData: Class = await response.json();

      // Call the onUpdateClass callback with the updated class data
      onUpdateClass(updatedClassData);

      resetForm();
      setEditingClass(null);
    } catch (error) {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description: "Failed to update class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      grade: classItem.grade,
      section: classItem.section,
      capacity: classItem.capacity.toString(),
      classTeacherId: classItem.classTeacherId || "",
      room: classItem.room || "",
      description: classItem.description || "",
      subjects: classItem.subjects || [],
    });
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    if (!hasPermission("delete_classes")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete classes.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the delete function with the class ID
      const response = await fetch(
        `${baseUrl}/class/classes/${deletingClass.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized access
          refreshAccessToken();
          return;
        }
        toast({
          title: "Error",
          description: "Failed to delete class. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Call the onDeleteClass callback with the class ID
      toast({
        title: "Class Deleted",
        description: `Class ${deletingClass.name} has been successfully deleted.`,
        variant: "success",
      });

      onDeleteClass(deletingClass.id);
      setDeletingClass(null);
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.grade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade =
      gradeFilter === "all" || classItem.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const getClassTeacher = (teacherId?: string) => {
    return teachers.find((t) => t.id === teacherId);
  };

  const getClassStudents = (className: string) => {
    return students.filter((s) => s.classId === className);
  };

  const availableSubjects = [...new Set(teachers.map((t) => t.subject))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Class Management</h2>
          <p className="text-muted-foreground">
            Manage classes, sections, and assignments
          </p>
        </div>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Grade 10A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade Level *</Label>
                    <Select
                      value={formData.grade}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, grade: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_LEVELS.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Section *</Label>
                    <Select
                      value={formData.section}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, section: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTIONS.map((section) => (
                          <SelectItem key={section} value={section}>
                            {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          capacity: e.target.value,
                        }))
                      }
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Room</Label>
                    <Input
                      value={formData.room}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          room: e.target.value,
                        }))
                      }
                      placeholder="Room 101"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Class Teacher</Label>
                  <Select
                    value={formData.classTeacherId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        classTeacherId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(
                        (teacher) => (
                          (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.fullName} - {teacher.subject}
                            </SelectItem>
                          )
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subjects</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSubjects.map((subject) => (
                      <label
                        key={subject}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                subjects: [...prev.subjects, subject],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                subjects: prev.subjects.filter(
                                  (s) => s !== subject
                                ),
                              }));
                            }
                          }}
                        />
                        <span className="text-sm">{subject}</span>
                      </label>
                    ))}
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
                    placeholder="Class description..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddClass}>Add Class</Button>
                </div>
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
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {GRADE_LEVELS.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((classItem) => {
          const classTeacher = getClassTeacher(classItem.classTeacherId);
          const classStudents = getClassStudents(classItem.name);

          return (
            <Card
              key={classItem.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-none mb-2">
                      {classItem.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{classItem.grade}</Badge>
                      <Badge variant="secondary">
                        Section {classItem.section}
                      </Badge>
                      <Badge
                        variant={classItem.isActive ? "default" : "secondary"}
                      >
                        {classItem.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(classItem)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingClass(classItem)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {classStudents.length}/{classItem.capacity} students
                    </span>
                  </div>
                  {classItem.room && (
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{classItem.room}</span>
                    </div>
                  )}
                </div>

                {classTeacher && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Class Teacher</p>
                    <p className="text-sm text-muted-foreground">
                      {classTeacher.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {classTeacher.subject}
                    </p>
                  </div>
                )}

                {classItem.subjects && classItem.subjects.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Subjects</p>
                    <div className="flex flex-wrap gap-1">
                      {classItem.subjects.slice(0, 3).map((subject) => (
                        <Badge
                          key={subject}
                          variant="outline"
                          className="text-xs"
                        >
                          {subject}
                        </Badge>
                      ))}
                      {classItem.subjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{classItem.subjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {classItem.description && (
                  <p className="text-sm text-muted-foreground">
                    {classItem.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No classes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || gradeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first class"}
          </p>
          {canEdit && !searchTerm && gradeFilter === "all" && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Grade 10A"
                />
              </div>
              <div className="space-y-2">
                <Label>Grade Level *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, grade: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Section *</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, section: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      capacity: e.target.value,
                    }))
                  }
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Input
                  value={formData.room}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, room: e.target.value }))
                  }
                  placeholder="Room 101"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Class Teacher</Label>
              <Select
                value={formData.classTeacherId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, classTeacherId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.fullName} - {teacher.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subjects</Label>
              <div className="grid grid-cols-3 gap-2">
                {availableSubjects.map((subject) => (
                  <label key={subject} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            subjects: [...prev.subjects, subject],
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            subjects: prev.subjects.filter(
                              (s) => s !== subject
                            ),
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
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
                placeholder="Class description..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingClass(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditClass}>Update Class</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingClass}
        onOpenChange={() => setDeletingClass(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              class <strong>{deletingClass?.name}</strong> and all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
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
