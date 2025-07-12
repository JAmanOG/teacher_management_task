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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
} from "lucide-react";
import type { Schedule, Teacher } from "@/app/page";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { baseUrl } from "../../constant";
import type { Lesson, Class } from "@/app/page";

interface ScheduleManagementProps {

  lessons?: Lesson[];
  schedules: Schedule[];
  teachers: Teacher[];
  classes: Class[];
  onAddSchedule: (schedule: Omit<Schedule, "id">) => void;
  onUpdateSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  canEdit: boolean;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = [
  "08:00 - 08:45",
  "08:45 - 09:30",
  "09:30 - 10:15",
  "10:30 - 11:15",
  "11:15 - 12:00",
  "12:00 - 12:45",
  "13:30 - 14:15",
  "14:15 - 15:00",
  "15:00 - 15:45",
];

export function ScheduleManagement({
  schedules,
  classes,
  teachers,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  canEdit,
}: ScheduleManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    teacherId: "",
    subject: "",
    classId: "",
    dayOfWeek: "",
    timeSlot: "",
    room: "",
  });
  const { user, accesstoken, refreshAccessToken } = useAuth();
  const currentUser = user || null;
  const resetForm = () => {
    setFormData({
      teacherId: "",
      subject: "",
      classId: "",
      dayOfWeek: "",
      timeSlot: "",
      room: "",
    });
  };

  const hasPermission = (permission: string) => {
    return currentUser?.permissions?.includes(permission) || false;
  };

  const availableSubjects = [...new Set(teachers.map((t) => t.subject))];

  const handleAddSchedule = async () => {
    if (
      !formData.teacherId ||
      !formData.subject ||
      !formData.dayOfWeek ||
      !formData.timeSlot
    )
      return;

    if (!hasPermission("add_schedules")) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to add schedules.",
        variant: "destructive",
      });
      return;
    }

    if (editingSchedule) {
      handleEditSchedule();
      return;
    }

    if (!accesstoken) {
      refreshAccessToken();
      return;
    }

    if (!teachers.some((t) => t.id === formData.teacherId)) {
      toast({
        title: "Invalid Teacher",
        description: "Selected teacher does not exist.",
        variant: "destructive",
      });
      return;
    }

    if (
      schedules.some(
        (s) =>
          s.teacherId === formData.teacherId &&
          s.dayOfWeek === formData.dayOfWeek &&
          s.timeSlot === formData.timeSlot
      )
    ) {
      toast({
        title: "Schedule Conflict",
        description: "This teacher already has a schedule at this time.",
        variant: "destructive",
      });
      return;
    }

    if (
      schedules.some(
        (s) =>
          s.classId === formData.classId &&
          s.dayOfWeek === formData.dayOfWeek &&
          s.timeSlot === formData.timeSlot
      )
    ) {
      toast({
        title: "Class Conflict",
        description: "This class already has a schedule at this time.",
        variant: "destructive",
      });
      return;
    }

    if (
      schedules.some(
        (s) =>
          s.room === formData.room &&
          s.dayOfWeek === formData.dayOfWeek &&
          s.timeSlot === formData.timeSlot
      )
    ) {
      toast({
        title: "Room Conflict",
        description: "This room is already booked at this time.",
        variant: "destructive",
      });
      return;
    }

    const requiredFields = [
      { field: "teacherId", label: "Teacher" },
      { field: "subject", label: "Subject" },
      { field: "classId", label: "Class" },
      { field: "dayOfWeek", label: "Day" },
      { field: "timeSlot", label: "Time Slot" },
      { field: "room", label: "Room" },
    ];

    const missingFields = requiredFields.filter(
      (item) => !formData[item.field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please provide ${missingFields
          .map((f) => f.label)
          .join(", ")} for the schedule.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/schedule/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accesstoken}`,
        },
        body: JSON.stringify({
          teacherId: formData.teacherId,
          subject: formData.subject,
          classId: formData.classId,
          dayOfWeek: formData.dayOfWeek,
          timeSlot: formData.timeSlot,
          room: formData.room,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error Adding Schedule",
          description: errorData.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        return;
      }

      // const newSchedule: Schedule = await response.json();

      toast({
        title: "Schedule Added",
        description: "The schedule has been successfully added.",
        variant: "success",
      });

      onAddSchedule({
        teacherId: formData.teacherId,
        subject: formData.subject,
        classId: formData.classId,
        dayOfWeek: formData.dayOfWeek,
        timeSlot: formData.timeSlot,
        room: formData.room,
      });

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding schedule:", error);
      toast({
        title: "Error",
        description: "Failed to add schedule. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleEditSchedule = async () => {
    if (!editingSchedule || !formData.teacherId || !formData.subject) return;
    if (!hasPermission("edit_schedules")) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to edit schedules.",
        variant: "destructive",
      });
      return;
    }

    if (!accesstoken) {
      refreshAccessToken();
      return;
    }

    if (!teachers.some((t) => t.id === formData.teacherId)) {
      toast({
        title: "Invalid Teacher",
        description: "Selected teacher does not exist.",
        variant: "destructive",
      });
      return;
    }
    if (
      schedules.some(
        (s) =>
          s.teacherId === formData.teacherId &&
          s.dayOfWeek === formData.dayOfWeek &&
          s.timeSlot === formData.timeSlot &&
          s.id !== editingSchedule.id
      )
    ) {
      toast({
        title: "Schedule Conflict",
        description: "This teacher already has a schedule at this time.",
        variant: "destructive",
      });
      return;
    }
    if (
      schedules.some(
        (s) =>
          s.classId === formData.classId &&
          s.dayOfWeek === formData.dayOfWeek &&
          s.timeSlot === formData.timeSlot &&
          s.id !== editingSchedule.id
      )
    ) {
      toast({
        title: "Class Conflict",
        description: "This class already has a schedule at this time.",
        variant: "destructive",
      });
      return;
    }

    if (
      schedules.some(
        (s) =>
          s.room === formData.room &&
          s.dayOfWeek === formData.dayOfWeek &&
          s.timeSlot === formData.timeSlot &&
          s.id !== editingSchedule.id
      )
    ) {
      toast({
        title: "Room Conflict",
        description: "This room is already booked at this time.",
        variant: "destructive",
      });
      return;
    }

    const requiredFields = [
      { field: "teacherId", label: "Teacher" },
      { field: "subject", label: "Subject" },
      { field: "classId", label: "Class" },
      { field: "dayOfWeek", label: "Day" },
      { field: "timeSlot", label: "Time Slot" },
      { field: "room", label: "Room" },
    ];
    const missingFields = requiredFields.filter(
      (item) => !formData[item.field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please provide ${missingFields
          .map((f) => f.label)
          .join(", ")} for the schedule.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/schedule/schedules/${editingSchedule.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accesstoken}`,
          },
          body: JSON.stringify({
            teacherId: formData.teacherId,
            subject: formData.subject,
            classId: formData.classId,
            dayOfWeek: formData.dayOfWeek,
            timeSlot: formData.timeSlot,
            room: formData.room,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error Updating Schedule",
          description: errorData.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        return;
      }

      // const updatedSchedule: Schedule = await response.json();

      toast({
        title: "Schedule Updated",
        description: "The schedule has been successfully updated.",
        variant: "success",
      });

      onUpdateSchedule({
        ...editingSchedule,
        teacherId: formData.teacherId,
        subject: formData.subject,
        classId: formData.classId,
        dayOfWeek: formData.dayOfWeek,
        timeSlot: formData.timeSlot,
        room: formData.room,
      });

      resetForm();
      setEditingSchedule(null);
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      teacherId: schedule.teacherId,
      subject: schedule.subject,
      classId: schedule.classId,
      dayOfWeek: schedule.dayOfWeek,
      timeSlot: schedule.timeSlot,
      room: schedule.room,
    });
  };

  const getSchedulesByDay = (day: string) => {
    return schedules
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Schedule Management</h2>
          <p className="text-muted-foreground">
            Manage class schedules and timetables
          </p>
        </div>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Schedule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Label>Class</Label>
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
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      placeholder="Enter room"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Day *</Label>
                    <Select
                      value={formData.dayOfWeek}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, dayOfWeek: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Slot *</Label>
                    <Select
                      value={formData.timeSlot}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, timeSlot: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddSchedule}>Add Schedule</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.map((day) => (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getSchedulesByDay(day).map((schedule) => {
                    const teacher = teachers.find(
                      (t) => t.id === schedule.teacherId
                    );
                    return (
                      <div
                        key={schedule.id}
                        className="p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{schedule.timeSlot}</Badge>
                          {canEdit && (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(schedule)}
                                className="h-6 w-6"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteSchedule(schedule.id)}
                                className="h-6 w-6 text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {schedule.subject}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {teacher?.fullName}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            {schedule.classId}
                            {schedule.room && (
                              <>
                                <span className="mx-1">•</span>
                                Room {schedule.room}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {getSchedulesByDay(day).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No classes scheduled
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-2">
            {schedules.map((schedule) => {
              const teacher = teachers.find((t) => t.id === schedule.teacherId);
              return (
                <Card key={schedule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {schedule.dayOfWeek}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{schedule.timeSlot}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span>{schedule.subject}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{schedule.classId}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {teacher?.fullName}
                        </span>
                        {canEdit && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(schedule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteSchedule(schedule.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingSchedule}
        onOpenChange={() => setEditingSchedule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label>Class</Label>
                {/* <Input
                  value={formData.classId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      classId: e.target.value,
                    }))
                  }
                  placeholder="Enter class"
                /> */}
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
                    {classes.map((ch) => (
                      <SelectItem key={ch.id} value={ch.id}>
                        {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Input
                  value={formData.room}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, room: e.target.value }))
                  }
                  placeholder="Enter room"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day *</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, dayOfWeek: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time Slot *</Label>
                <Select
                  value={formData.timeSlot}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, timeSlot: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingSchedule(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditSchedule}>Update Schedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
