"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Users,
  Grid,
  List,
  Shield,
  BarChart3,
  Sun,
  Moon,
} from "lucide-react";
import { TeacherForm } from "../components/teacher-form";
import { TeacherCard } from "../components/teacher-card";
import { TeacherTable } from "../components/teacher-table";
import { TeacherDetailsModal } from "../components/teacher-details-modal";
import { BulkActionsBar } from "../components/bulk-actions-bar";
import { LessonTracker } from "../components/lesson-tracker";
import { RoleManagement } from "../components/role-management";
import { useTheme } from "next-themes";
import { AppSidebar } from "@/components/app-sidebar";
import { ChapterDetailsModal } from "../components/chapter-details-modal";
import { useAuth } from "@/hooks/use-auth";
import { ScheduleManagement } from "../components/schedule-management";
import { StudentManagement } from "../components/student-management";
import { TeacherCheckIn } from "../components/teacher-checkin";
import { CommentsHistory } from "../components/comments-history";
import { DashboardCharts } from "../components/dashboard-charts";
import { ClassManagement } from "../components/class-management";
import { ChapterCreation } from "../components/chapter-creation";
import { StudentCreation } from "@/components/student-creation";
import { baseUrl } from "../../constant";
import { useRouter } from "next/navigation";

// import type { Teacher } from "../types/teacher" // Import Teacher type
export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  subject: string;
  status: "Active" | "Inactive";
  role: "Teacher" | "Head Teacher" | "Admin" | "Principal";
  assignedClasses?: string[];
  avatar?: string;
  joinDate?: string;
  permissions?: string[];
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  capacity: number;
  studentCount: number;
  classTeacherId?: string;
  room?: string;
  description?: string;
  subjects?: string[];
  isActive: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  subject: string;
  totalLessons: number;
  completedLessons: number;
  teacherId: string;
  classId: string;
  dueDate?: string;
  status: "Not Started" | "In Progress" | "Completed" | "Overdue";
  description?: string;
  objectives?: string[];
  resources?: string[];
  difficulty?: "easy" | "medium" | "hard";
}

export interface Lesson {
  id: string;
  title: string;
  chapterId: string;
  isCompleted: boolean;
  completedDate?: string;
  notes?: string;
  duration?: number;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface Schedule {
  id: string;
  teacherId: string;
  subject: string;
  classId: string;
  dayOfWeek: string;
  timeSlot: string;
  room: string;
}

export interface Student {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  classId: string;
  avatar?: string;
  overallGrade: string;
  attendanceRate: number;
  subjects: {
    name: string;
    grade: string;
    teacher: string;
  }[];
  parentContact: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface CheckInRecord {
  id: string;
  teacherId: string;
  checkInTime: string;
  checkOutTime?: string;
  location: string;
  status: "Present" | "Absent" | "Late";
}


export interface Comment {
  id: string;
  type: "general" | "chapter" | "student";
  chapterId?: string;
  content: string;
  priority: "low" | "medium" | "high";
  authorId: string;
  createdAt: string;
}

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
  "Foreign Language",
];

const ROLES = ["Teacher", "Head Teacher", "Admin", "Principal"];

const PERMISSIONS = [
  "view_teachers",
  "add_teachers",
  "edit_teachers",
  "delete_teachers",
  "manage_roles",
  "view_lessons",
  "edit_lessons",
  "view_reports",
  "export_data",
  "manage_system",
];

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "1",
    fullName: "Sarah Johnson",
    email: "sarah.johnson@school.edu",
    phoneNumber: "+1 (555) 123-4567",
    subject: "Mathematics",
    status: "Active",
    role: "Teacher",
    assignedClasses: ["Grade 10A", "Grade 11B"],
    joinDate: "2023-08-15",
    permissions: ["view_teachers", "view_lessons", "edit_lessons"],
  },
  {
    id: "2",
    fullName: "Michael Chen",
    email: "michael.chen@school.edu",
    phoneNumber: "+1 (555) 234-5678",
    subject: "Computer Science",
    status: "Active",
    role: "Head Teacher",
    assignedClasses: ["Grade 12A", "Grade 11C"],
    joinDate: "2022-09-01",
    permissions: [
      "view_teachers",
      "add_teachers",
      "edit_teachers",
      "view_lessons",
      "edit_lessons",
      "view_reports",
    ],
  },
  {
    id: "3",
    fullName: "Emily Rodriguez",
    email: "emily.rodriguez@school.edu",
    phoneNumber: "+1 (555) 345-6789",
    subject: "English",
    status: "Active",
    role: "Admin",
    assignedClasses: ["Grade 9A"],
    joinDate: "2021-08-20",
    permissions: [
      "view_teachers",
      "add_teachers",
      "edit_teachers",
      "delete_teachers",
      "manage_roles",
      "view_lessons",
      "edit_lessons",
      "view_reports",
      "export_data",
    ],
  },
  {
    id: "4",
    fullName: "David Thompson",
    email: "david.thompson@school.edu",
    phoneNumber: "+1 (555) 456-7890",
    subject: "Physics",
    status: "Active",
    role: "Principal",
    assignedClasses: ["Grade 11A", "Grade 12B"],
    joinDate: "2020-08-10",
    permissions: PERMISSIONS,
  },
  {
    id: "5",
    fullName: "Lisa Wang",
    email: "lisa.wang@school.edu",
    phoneNumber: "+1 (555) 567-8901",
    subject: "Biology",
    status: "Active",
    role: "Teacher",
    assignedClasses: ["Grade 10B", "Grade 11A"],
    joinDate: "2023-01-15",
    permissions: ["view_teachers", "view_lessons", "edit_lessons"],
  },
];

// const INITIAL_CHAPTERS: Chapter[] = [
//   {
//     id: "1",
//     title: "Algebra Fundamentals",
//     subject: "Mathematics",
//     totalLessons: 12,
//     completedLessons: 8,
//     teacherId: "1",
//     classId: "Grade 10A",
//     dueDate: "2024-02-15",
//     status: "In Progress",
//   },
//   {
//     id: "2",
//     title: "Calculus Introduction",
//     subject: "Mathematics",
//     totalLessons: 15,
//     completedLessons: 15,
//     teacherId: "1",
//     classId: "Grade 11B",
//     dueDate: "2024-01-30",
//     status: "Completed",
//   },
//   {
//     id: "3",
//     title: "Data Structures",
//     subject: "Computer Science",
//     totalLessons: 10,
//     completedLessons: 6,
//     teacherId: "2",
//     classId: "Grade 12A",
//     dueDate: "2024-03-01",
//     status: "In Progress",
//   },
//   {
//     id: "4",
//     title: "Shakespeare Studies",
//     subject: "English",
//     totalLessons: 8,
//     completedLessons: 0,
//     teacherId: "3",
//     classId: "Grade 9A",
//     dueDate: "2024-02-20",
//     status: "Not Started",
//   },
//   {
//     id: "5",
//     title: "Quantum Physics",
//     subject: "Physics",
//     totalLessons: 20,
//     completedLessons: 5,
//     teacherId: "4",
//     classId: "Grade 12B",
//     dueDate: "2024-01-25",
//     status: "Overdue",
//   },
// ];

const INITIAL_LESSONS: Lesson[] = [
  {
    id: "1",
    title: "Introduction to Variables",
    chapterId: "1",
    isCompleted: true,
    completedDate: "2024-01-10",
    duration: 45,
  },
  {
    id: "2",
    title: "Basic Operations",
    chapterId: "1",
    isCompleted: true,
    completedDate: "2024-01-12",
    duration: 50,
  },
  {
    id: "3",
    title: "Solving Linear Equations",
    chapterId: "1",
    isCompleted: false,
    duration: 45,
  },
  // Add more lessons for other chapters...
];

const INITIAL_USER_ROLES: UserRole[] = [
  {
    id: "1",
    name: "Teacher",
    permissions: ["view_teachers", "view_lessons", "edit_lessons"],
    description: "Basic teacher permissions for viewing and managing lessons",
  },
  {
    id: "2",
    name: "Head Teacher",
    permissions: [
      "view_teachers",
      "add_teachers",
      "edit_teachers",
      "view_lessons",
      "edit_lessons",
      "view_reports",
    ],
    description:
      "Department head with additional teacher management capabilities",
  },
  {
    id: "3",
    name: "Admin",
    permissions: [
      "view_teachers",
      "add_teachers",
      "edit_teachers",
      "delete_teachers",
      "manage_roles",
      "view_lessons",
      "edit_lessons",
      "view_reports",
      "export_data",
    ],
    description: "Administrative role with extensive management permissions",
  },
  {
    id: "4",
    name: "Principal",
    permissions: PERMISSIONS,
    description: "Full system access with all permissions",
  },
];

// const INITIAL_SCHEDULES: Schedule[] = [
//   {
//     id: "1",
//     teacherId: "1",
//     subject: "Mathematics",
//     classId: "Grade 10A",
//     dayOfWeek: "Monday",
//     timeSlot: "08:00 - 08:45",
//     room: "101",
//   },
//   {
//     id: "2",
//     teacherId: "1",
//     subject: "Mathematics",
//     classId: "Grade 11B",
//     dayOfWeek: "Monday",
//     timeSlot: "09:30 - 10:15",
//     room: "101",
//   },
//   {
//     id: "3",
//     teacherId: "2",
//     subject: "Computer Science",
//     classId: "Grade 12A",
//     dayOfWeek: "Tuesday",
//     timeSlot: "10:30 - 11:15",
//     room: "205",
//   },
//   {
//     id: "4",
//     teacherId: "3",
//     subject: "English",
//     classId: "Grade 9A",
//     dayOfWeek: "Wednesday",
//     timeSlot: "08:00 - 08:45",
//     room: "102",
//   },
//   {
//     id: "5",
//     teacherId: "4",
//     subject: "Physics",
//     classId: "Grade 11A",
//     dayOfWeek: "Thursday",
//     timeSlot: "11:15 - 12:00",
//     room: "301",
//   },
// ];

const INITIAL_STUDENTS: Student[] = [
  {
    id: "1",
    studentId: "STU001",
    fullName: "Alice Johnson",
    email: "alice.johnson@student.edu",
    classId: "Grade 10A",
    overallGrade: "A",
    attendanceRate: 95,
    subjects: [
      { name: "Mathematics", grade: "A", teacher: "Sarah Johnson" },
      { name: "English", grade: "B", teacher: "Emily Rodriguez" },
      { name: "Science", grade: "A", teacher: "Lisa Wang" },
    ],
    parentContact: {
      name: "Robert Johnson",
      phone: "+1 (555) 123-0001",
      email: "robert.johnson@email.com",
    },
  },
  {
    id: "2",
    studentId: "STU002",
    fullName: "Bob Smith",
    email: "bob.smith@student.edu",
    classId: "Grade 11B",
    overallGrade: "B",
    attendanceRate: 88,
    subjects: [
      { name: "Mathematics", grade: "B", teacher: "Sarah Johnson" },
      { name: "Physics", grade: "B", teacher: "David Thompson" },
      { name: "Computer Science", grade: "A", teacher: "Michael Chen" },
    ],
    parentContact: {
      name: "Mary Smith",
      phone: "+1 (555) 123-0002",
      email: "mary.smith@email.com",
    },
  },
  {
    id: "3",
    studentId: "STU003",
    fullName: "Carol Davis",
    email: "carol.davis@student.edu",
    classId: "Grade 9A",
    overallGrade: "A",
    attendanceRate: 97,
    subjects: [
      { name: "English", grade: "A", teacher: "Emily Rodriguez" },
      { name: "History", grade: "A", teacher: "David Thompson" },
      { name: "Art", grade: "B", teacher: "Lisa Wang" },
    ],
    parentContact: {
      name: "James Davis",
      phone: "+1 (555) 123-0003",
      email: "james.davis@email.com",
    },
  },
];

const INITIAL_CHECKIN_RECORDS: CheckInRecord[] = [
  {
    id: "1",
    teacherId: "1",
    checkInTime: "2024-01-15T08:00:00Z",
    checkOutTime: "2024-01-15T16:30:00Z",
    location: "Main Campus",
    status: "Present",
  },
  {
    id: "2",
    teacherId: "2",
    checkInTime: "2024-01-15T07:45:00Z",
    checkOutTime: "2024-01-15T17:00:00Z",
    location: "Main Campus",
    status: "Present",
  },
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "1",
    type: "chapter",
    chapterId: "1",
    content:
      "Students are struggling with quadratic equations. Need to spend more time on this topic.",
    priority: "high",
    authorId: "1",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    type: "general",
    content:
      "Parent-teacher meeting scheduled for next week. Need to prepare progress reports.",
    priority: "medium",
    authorId: "2",
    createdAt: "2024-01-14T14:20:00Z",
  },
];

const INITIAL_CLASSES: Class[] = [
  {
    id: "1",
    name: "Grade 10A",
    grade: "Grade 10",
    section: "A",
    capacity: 30,
    studentCount: 28,
    classTeacherId: "1",
    room: "Room 101",
    description: "Advanced Mathematics class",
    subjects: ["Mathematics", "Physics", "Chemistry"],
    isActive: true,
  },
  {
    id: "2",
    name: "Grade 11B",
    grade: "Grade 11",
    section: "B",
    capacity: 32,
    studentCount: 30,
    classTeacherId: "2",
    room: "Room 205",
    description: "Computer Science focus class",
    subjects: ["Computer Science", "Mathematics", "English"],
    isActive: true,
  },
  {
    id: "3",
    name: "Grade 9A",
    grade: "Grade 9",
    section: "A",
    capacity: 28,
    studentCount: 25,
    classTeacherId: "3",
    room: "Room 102",
    description: "General studies class",
    subjects: ["English", "History", "Geography"],
    isActive: true,
  },
];

export default function TeacherManagement() {
  const {
    user,
    isLoading: authLoading,
    accesstoken,
    refreshAccessToken,
  } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [viewingChapter, setViewingChapter] = useState<Chapter | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>(INITIAL_USER_ROLES);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>(
    INITIAL_CHECKIN_RECORDS
  );
  const [classes, setClasses] = useState<Class[]>(INITIAL_CLASSES);
  // import type {Teacher}from 
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "teachers"
    | "lessons"
    | "schedule"
    | "students"
    | "classes"
    | "chapters"
    | "checkin"
    | "comments"
    | "reports"
    | "roles"
    | "notifications"
    | "settings"
    | "student-creation"
  >("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const currentUser:Teacher | null = user as Teacher | null


  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Make sure we have a valid access token
        const token = accesstoken || (await refreshAccessToken());
        
        // Create an array of fetch operations
        const fetchOperations = [
          // Fetch Teachers
          fetch(`${baseUrl}/auth/all-users?role=Teacher`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }).then(response => {
            if (!response.ok) throw new Error("Failed to fetch teachers");
            return response.json();
          }).then(result => {
            setTeachers(result.data || []);
            console.log("Teachers fetched successfully:", result.data);
            return "Teachers";
          }),
          
          // Fetch Classes
          fetch(`${baseUrl}/class/classes`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(response => {
            if (!response.ok) throw new Error("Failed to fetch classes");
            return response.json();
          }).then(result => {
            setClasses(result.data || []);
            console.log("Classes fetched successfully:", result.data);
            return "Classes";
          }),
          
          // Fetch Chapters
          fetch(`${baseUrl}/chapter/chapters`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(response => {
            if (!response.ok) throw new Error("Failed to fetch chapters");
            return response.json();
          }).then(result => {
            setChapters(result.data || []);
            console.log("Chapters fetched successfully:", result.data);
            return "Chapters";
          }),
          
          // Fetch Lessons
          fetch(`${baseUrl}/lesson/lessons`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(response => {
            if (!response.ok) throw new Error("Failed to fetch lessons");
            return response.json();
          }).then(result => {
            setLessons(result.data || []);
            console.log("Lessons fetched successfully:", result.data);
            return "Lessons";
          }),
          
          // Fetch Schedules
          fetch(`${baseUrl}/schedule/schedules`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(response => {
            if (!response.ok) throw new Error("Failed to fetch schedules");
            return response.json();
          }).then(result => {
            setSchedules(result.data || []);
            console.log("Schedules fetched successfully:", result.data);
            return "Schedules";
          })
        ];
        
        // Execute all fetch operations in parallel
        const results = await Promise.allSettled(fetchOperations);
        
        // Show toast for successful operations
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            toast({
              title: "Success",
              description: `${result.value} data loaded successfully!`,
              variant: "default",
            });
          } else {
            console.error(`Error fetching data: ${result.reason}`);
          }
        });
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: `Failed to load some data.${(error as Error)?.message ?? ""}  Please refresh the page.`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, accesstoken,refreshAccessToken, toast]);

  // useEffect(() => {
  //   const fetchStudents = async () => {
  //     try {
  //       const response = await fetch(`${baseUrl}/student/students`, {
  //         headers: {
  //           Authorization: `Bearer ${accesstoken}`,
  //         },
  //       });
  //       if (!response.ok) {
  //         if (response.status === 401) {
  //           refreshAccessToken();
  //           return;
  //         }
  //         throw new Error("Failed to fetch students");
  //       }
  //       const result = await response.json();
  //       setStudents(result.data || []);
  //       console.log("Students fetched successfully:", result.data);
  //       toast({
  //         title: "Success",
  //         description: "Students data loaded successfully!",
  //       });
  //     } catch (error) {
  //       console.error("Error fetching students:", error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to load students data",
  //         variant: "destructive",
  //       });
  //     }
  //   };
  //   if (user) {
  //     fetchStudents();
  //   }
  // }, [user, accesstoken, refreshAccessToken]);

  const hasPermission = (permission: string) => {
    return currentUser?.permissions?.includes(permission) || false;
  };

  const filteredAndSortedTeachers = useMemo(() => {
    const filtered = teachers.filter((teacher) => {
      const matchesSearch =
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || teacher.status === statusFilter;
      const matchesSubject =
        subjectFilter === "all" || teacher.subject === subjectFilter;
      const matchesRole = roleFilter === "all" || teacher.role === roleFilter;

      return matchesSearch && matchesStatus && matchesSubject && matchesRole;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.fullName.localeCompare(b.fullName);
        case "subject":
          return a.subject.localeCompare(b.subject);
        case "status":
          return a.status.localeCompare(b.status);
        case "role":
          return a.role.localeCompare(b.role);
        case "joinDate":
          return (
            new Date(b.joinDate || "").getTime() -
            new Date(a.joinDate || "").getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [teachers, searchTerm, statusFilter, subjectFilter, roleFilter, sortBy]);


  // Add authentication check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (!user) {
    router.push("/login");
    return null;
  }


  const handleAddStudent = (studentData: Omit<Student, "id">) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
    };
    setStudents((prev) => [...prev, newStudent]);
    toast({
      title: "Success",
      description: "Student added successfully!",
    });
  };

  const handleBulkAddStudents = (studentsData: Omit<Student, "id">[]) => {
    const newStudents: Student[] = studentsData.map((studentData, index) => ({
      ...studentData,
      id: (Date.now() + index).toString(),
    }));
    setStudents((prev) => [...prev, ...newStudents]);
    toast({
      title: "Success",
      description: `${newStudents.length} students added successfully!`,
    });
  };

  const handleAddTeacher = async (teacherData: Omit<Teacher, "id">) => {
    if (!hasPermission("add_teachers")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to add teachers.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Adding teacher:", teacherData);

      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...teacherData,
          role: teacherData.role || "Teacher",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add teacher");
      }

      const result = await response.json();
      console.log("Teacher added successfully:", result);

      const newTeacher: Teacher = {
        ...result.data,
        id: result.id || null, // Fallback to Date.now() if id is not returned
        joinDate: result.joinDate || new Date().toISOString().split("T")[0],
      };

      setTeachers((prev) => [...prev, newTeacher]);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Teacher added successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add teacher.${(error instanceof Error ? error.message : String(error))}Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTeacher = async (teacherData: Omit<Teacher, "id">) => {
    if (!hasPermission("edit_teachers")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit teachers.",
        variant: "destructive",
      });
      return;
    }

    if (!editingTeacher) return;

    setIsLoading(true);
    try {
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await fetch(
        `${baseUrl}/auth/profile/${editingTeacher.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accesstoken}`,
          },
          body: JSON.stringify({
            ...teacherData,
            role: teacherData.role || editingTeacher.role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update teacher");
      }

      const result = await response.json();
      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === editingTeacher.id
            ? {
                ...result.data,
                id: editingTeacher.id,
                joinDate: editingTeacher.joinDate,
              }
            : teacher
        )
      );
      setEditingTeacher(null);
      toast({
        title: "Success",
        description: "Teacher updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update teacher.${(error instanceof Error ? error.message : String(error))} Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (!hasPermission("delete_teachers")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete teachers.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
      setDeletingTeacher(null);
      toast({
        title: "Success",
        description: "Teacher deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete teacher.${(error instanceof Error ? error.message : String(error))}  Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    if (!hasPermission("edit_teachers")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to modify teacher status.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTeachers((prev) =>
        prev.map((t) =>
          t.id === teacher.id
            ? { ...t, status: t.status === "Active" ? "Inactive" : "Active" }
            : t
        )
      );
      toast({
        title: "Success",
        description: `Teacher status updated to ${
          teacher.status === "Active" ? "Inactive" : "Active"
        }!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update teacher status.${(error instanceof Error ? error.message : String(error))} Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!hasPermission("delete_teachers")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete teachers.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await fetch(`${baseUrl}/auth/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedTeachers }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete teachers");
      }
      const result = await response.json();
      setTeachers((prev) =>
        prev.filter((t) => !selectedTeachers.includes(t.id))
      );
      setSelectedTeachers([]);
      toast({
        title: "Success",
        description: `${result.deletedCount} teachers deleted successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete teachers.${(error instanceof Error ? error.message : String(error))}Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleExportCSV = () => {
  //   if (!hasPermission("export_data")) {
  //     toast({
  //       title: "Access Denied",
  //       description: "You don't have permission to export data.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   const csvContent = [
  //     ["Name", "Email", "Phone", "Subject", "Status", "Role", "Join Date"],
  //     ...filteredAndSortedTeachers.map((teacher) => [
  //       teacher.fullName,
  //       teacher.email,
  //       teacher.phoneNumber,
  //       teacher.subject,
  //       teacher.status,
  //       teacher.role,
  //       teacher.joinDate || "",
  //     ]),
  //   ]
  //     .map((row) => row.join(","))
  //     .join("\n");

  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "teachers.csv";
  //   a.click();
  //   URL.revokeObjectURL(url);

  //   toast({
  //     title: "Success",
  //     description: "Teachers data exported successfully!",
  //   });
  // };

  const activeTeachers = teachers.filter((t) => t.status === "Active").length;
  // const inactiveTeachers = teachers.filter(
  //   (t) => t.status === "Inactive"
  // ).length;

  const completedChapters = chapters.filter(
    (c) => c.status === "Completed"
  ).length;
  const inProgressChapters = chapters.filter(
    (c) => c.status === "In Progress"
  ).length;
  const overdueChapters = chapters.filter((c) => c.status === "Overdue").length;

  // Add lesson management functions
  const handleUpdateLesson = (updatedLesson: Lesson) => {
    console.log("Updating lesson in page:", updatedLesson);
    setLessons((prev) =>
      prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l)) //
    );
  };

  const handleAddLesson = (lesson: Lesson) => {
    setLessons((prev) => [...prev, lesson]);
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  const handleViewChapter = (chapter: Chapter) => {
    setViewingChapter(chapter);
  };

  const handleAddSchedule = (scheduleData: Omit<Schedule, "id">) => {
    const newSchedule: Schedule = {
      ...scheduleData,
      id: Date.now().toString(),
    };
    setSchedules((prev) => [...prev, newSchedule]);
    toast({
      title: "Success",
      description: "Schedule added successfully!",
    });
  };

  const handleUpdateSchedule = (updatedSchedule: Schedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
    toast({
      title: "Success",
      description: "Schedule updated successfully!",
    });
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    toast({
      title: "Success",
      description: "Schedule deleted successfully!",
    });
  };

  const handleCheckIn = (recordData: Omit<CheckInRecord, "id">) => {
    const newRecord: CheckInRecord = {
      ...recordData,
      id: Date.now().toString(),
    };
    setCheckInRecords((prev) => [...prev, newRecord]);
    toast({
      title: "Success",
      description: "Checked in successfully!",
    });
  };

  const handleCheckOut = (recordId: string, checkOutTime: string) => {
    setCheckInRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, checkOutTime } : r))
    );
    toast({
      title: "Success",
      description: "Checked out successfully!",
    });
  };

  const handleAddComment = (commentData: Omit<Comment, "id" | "createdAt">) => {
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [newComment, ...prev]);
    toast({
      title: "Success",
      description: "Comment added successfully!",
    });
  };

  const handleAddClass = (classData: Omit<Class, "id">) => {
    const newClass: Class = {
      ...classData,
      id: Date.now().toString(),
    };
    setClasses((prev) => [...prev, newClass]);
    toast({
      title: "Success",
      description: "Class created successfully!",
    });
  };

  const handleUpdateClass = (updatedClass: Class) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );
    toast({
      title: "Success",
      description: "Class updated successfully!",
    });
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    toast({
      title: "Success",
      description: "Class deleted successfully!",
    });
  };

  const handleAddChapter = (chapterData: Omit<Chapter, "id">) => {
    const newChapter: Chapter = {
      ...chapterData,
      id: Date.now().toString(),
    };
    setChapters((prev) => [...prev, newChapter]);
    toast({
      title: "Success",
      description: "Chapter created successfully!",
    });
  };

  const handleDuplicateChapter = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (chapter) {
      const duplicatedChapter: Chapter = {
        ...chapter,
        id: Date.now().toString(),
        title: `${chapter.title} (Copy)`,
        completedLessons: 0,
        status: "Not Started",
      };
      setChapters((prev) => [...prev, duplicatedChapter]);
      toast({
        title: "Success",
        description: "Chapter duplicated successfully!",
        variant: "success",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar 
        activeTab={activeTab} 
        onTabChange={(tab: typeof activeTab) => setActiveTab(tab)} 
      />

      {/* Good morning Greeting and date and time */}

      <div className="flex-1 lg:ml-0 flex flex-col">
        <div className=" top-0 z-50 w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Good Morning, {currentUser?.fullName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back!
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-6 mt-3 bg-[#f8f8f8] dark:bg-gray-800 rounded-xl">

            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Welcome back, {currentUser?.fullName}
                  </p>
                </div>
                <DashboardCharts />
              </div>
            )}

            {activeTab !== "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Teachers
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teachers.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Teachers
                    </CardTitle>
                    <Badge variant="default" className="bg-green-500">
                      Active
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeTeachers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed Chapters
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {completedChapters}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      In Progress
                    </CardTitle>
                    <Badge variant="secondary">Progress</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {inProgressChapters}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Overdue
                    </CardTitle>
                    <Badge variant="destructive">Overdue</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overdueChapters}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "teachers" && hasPermission("view_teachers") && (
              <>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search teachers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={subjectFilter}
                      onValueChange={setSubjectFilter}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {SUBJECTS.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="subject">Subject</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="role">Role</SelectItem>
                        <SelectItem value="joinDate">Join Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex border rounded-md">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    {hasPermission("add_teachers") && (
                      <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Teacher
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Add New Teacher</DialogTitle>
                          </DialogHeader>
                          <TeacherForm
                            onSubmit={handleAddTeacher}
                            onCancel={() => setIsAddDialogOpen(false)}
                            isLoading={isLoading}
                            subjects={SUBJECTS}
                            roles={ROLES}
                            userRoles={userRoles}
                            canManageRoles={hasPermission("manage_roles")}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {selectedTeachers.length > 0 &&
                  hasPermission("delete_teachers") && (
                    <BulkActionsBar
                      selectedCount={selectedTeachers.length}
                      onBulkDelete={handleBulkDelete}
                      onClearSelection={() => setSelectedTeachers([])}
                      isLoading={isLoading}
                    />
                  )}

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedTeachers.map((teacher) => (
                      <TeacherCard
                        key={teacher.id}
                        teacher={teacher}
                        isSelected={selectedTeachers.includes(teacher.id)}
                        onSelect={(selected) => {
                          if (selected) {
                            setSelectedTeachers((prev) => [
                              ...prev,
                              teacher.id,
                            ]);
                          } else {
                            setSelectedTeachers((prev) =>
                              prev.filter((id) => id !== teacher.id)
                            );
                          }
                        }}
                        onEdit={() => setEditingTeacher(teacher)}
                        onDelete={() => setDeletingTeacher(teacher)}
                        onToggleStatus={() => handleToggleStatus(teacher)}
                        onView={() => setViewingTeacher(teacher)}
                        isLoading={isLoading}
                        canEdit={hasPermission("edit_teachers")}
                        canDelete={hasPermission("delete_teachers")}
                      />
                    ))}
                  </div>
                ) : (
                  <TeacherTable
                    teachers={filteredAndSortedTeachers}
                    selectedTeachers={selectedTeachers}
                    onSelectTeacher={(teacherId, selected) => {
                      if (selected) {
                        setSelectedTeachers((prev) => [...prev, teacherId]);
                      } else {
                        setSelectedTeachers((prev) =>
                          prev.filter((id) => id !== teacherId)
                        );
                      }
                    }}
                    onSelectAll={(selected) => {
                      if (selected) {
                        setSelectedTeachers(
                          filteredAndSortedTeachers.map((t) => t.id)
                        );
                      } else {
                        setSelectedTeachers([]);
                      }
                    }}
                    onEdit={setEditingTeacher}
                    onDelete={setDeletingTeacher}
                    onToggleStatus={handleToggleStatus}
                    onView={setViewingTeacher}
                    isLoading={isLoading}
                    canEdit={hasPermission("edit_teachers")}
                    canDelete={hasPermission("delete_teachers")}
                  />
                )}

                {filteredAndSortedTeachers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No teachers found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      subjectFilter !== "all" ||
                      roleFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Get started by adding your first teacher"}
                    </p>
                    {!searchTerm &&
                      statusFilter === "all" &&
                      subjectFilter === "all" &&
                      roleFilter === "all" &&
                      hasPermission("add_teachers") && (
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Teacher
                        </Button>
                      )}
                  </div>
                )}

                <Dialog
                  open={!!editingTeacher}
                  onOpenChange={() => setEditingTeacher(null)}
                >
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Teacher</DialogTitle>
                    </DialogHeader>
                    {editingTeacher && (
                      <TeacherForm
                        initialData={editingTeacher}
                        onSubmit={handleEditTeacher}
                        onCancel={() => setEditingTeacher(null)}
                        isLoading={isLoading}
                        subjects={SUBJECTS}
                        roles={ROLES}
                        userRoles={userRoles}
                        canManageRoles={hasPermission("manage_roles")}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <AlertDialog
                  open={!!deletingTeacher}
                  onOpenChange={() => setDeletingTeacher(null)}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete <strong>{deletingTeacher?.fullName}</strong> from
                        the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          deletingTeacher &&
                          handleDeleteTeacher(deletingTeacher)
                        }
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isLoading}
                      >
                        {isLoading ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <TeacherDetailsModal
                  teacher={viewingTeacher}
                  isOpen={!!viewingTeacher}
                  onClose={() => setViewingTeacher(null)}
                  onEdit={() => {
                    setEditingTeacher(viewingTeacher);
                    setViewingTeacher(null);
                  }}
                  onDelete={() => {
                    setDeletingTeacher(viewingTeacher);
                    setViewingTeacher(null);
                  }}
                  canEdit={hasPermission("edit_teachers")}
                  canDelete={hasPermission("delete_teachers")}
                />
              </>
            )}

            {activeTab === "lessons" && hasPermission("view_lessons") && (
              <LessonTracker
                chapters={chapters}
                teachers={teachers}
                onUpdateChapter={(updatedChapter) => {
                  setChapters((prev) =>
                    prev.map((c) =>
                      c.id === updatedChapter.id ? updatedChapter : c
                    )
                  );
                }}
                onViewChapter={handleViewChapter}
                canEdit={hasPermission("edit_lessons")}
              />
            )}

            <ChapterDetailsModal
              chapter={viewingChapter}
              teacher={
                viewingChapter
                  ? teachers.find((t) => t.id === viewingChapter.teacherId) ||
                    null
                  : null
              }
              lessons={lessons.filter(
                (l) => l.chapterId === viewingChapter?.id
              )}
              isOpen={!!viewingChapter}
              onClose={() => setViewingChapter(null)}
              onUpdateChapter={(updatedChapter) => {
                setChapters((prev) =>
                  prev.map((c) =>
                    c.id === updatedChapter.id ? updatedChapter : c
                  )
                );
              }}
              onUpdateLesson={handleUpdateLesson}
              onAddLesson={handleAddLesson}
              onDeleteLesson={handleDeleteLesson}
              canEdit={hasPermission("edit_lessons")}
            />

            {activeTab === "roles" && hasPermission("manage_roles") && (
              <RoleManagement
                userRoles={userRoles}
                permissions={PERMISSIONS}
                onUpdateRole={(updatedRole) => {
                  setUserRoles((prev) =>
                    prev.map((r) => (r.id === updatedRole.id ? updatedRole : r))
                  );
                }}
                onAddRole={(newRole) => {
                  setUserRoles((prev) => [
                    ...prev,
                    { ...newRole, id: Date.now().toString() },
                  ]);
                }}
                onDeleteRole={(roleId) => {
                  setUserRoles((prev) => prev.filter((r) => r.id !== roleId));
                }}
              />
            )}

            {activeTab === "schedule" && hasPermission("view_lessons") && (
              <ScheduleManagement
                classes={classes}
                lessons={lessons}
                schedules={schedules}
                teachers={teachers}
                onAddSchedule={handleAddSchedule}
                onUpdateSchedule={handleUpdateSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                canEdit={hasPermission("edit_lessons")}
              />
            )}

            {activeTab === "students" && hasPermission("view_teachers") && currentUser && (
              <StudentManagement
                students={students}
                teachers={teachers}
                currentUser={currentUser}
              />
            )}

            {activeTab === "checkin" && currentUser?.role === "Teacher" && (
              <TeacherCheckIn
                currentUser={currentUser}
                checkInRecords={checkInRecords}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
              />
            )}

            {activeTab === "comments" && hasPermission("view_teachers") && currentUser && (
              <CommentsHistory
                comments={comments}
                teachers={teachers}
                chapters={chapters}
                currentUser={currentUser}
                onAddComment={handleAddComment}
                canComment={hasPermission("edit_lessons")}
              />
            )}

            {/* {activeTab === "classes" && hasPermission("manage_system") && (
            <ClassManagement
              classes={classes}
              teachers={teachers}
              students={students}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
              canEdit={hasPermission("manage_system")}
            />
          )} */}

            {activeTab === "classes" && (
              <ClassManagement
                classes={classes}
                teachers={teachers}
                students={students}
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                canEdit={
                  hasPermission("add_classes") || hasPermission("edit_classes")
                }
              />
            )}

            {activeTab === "chapters" && hasPermission("edit_lessons") && (
              <ChapterCreation
                chapters={chapters}
                teachers={teachers}
                classes={classes}
                onAddChapter={handleAddChapter}
                onUpdateChapter={(updatedChapter) => {
                  setChapters((prev) =>
                    prev.map((c) =>
                      c.id === updatedChapter.id ? updatedChapter : c
                    )
                  );
                }}
                onDeleteChapter={(chapterId) => {
                  setChapters((prev) => prev.filter((c) => c.id !== chapterId));
                }}
                onDuplicateChapter={handleDuplicateChapter}
                canEdit={hasPermission("edit_lessons")}
              />
            )}

            {activeTab === "student-creation" &&
              hasPermission("manage_system") && (
                <StudentCreation
                  students={students}
                  classes={classes}
                  onAddStudent={handleAddStudent}
                  onBulkAddStudents={handleBulkAddStudents}
                  canEdit={hasPermission("manage_system")}
                />
              )}

            {/* Access Denied Message */}
            {((activeTab === "teachers" && !hasPermission("view_teachers")) ||
              (activeTab === "lessons" && !hasPermission("view_lessons")) ||
              (activeTab === "roles" && !hasPermission("manage_roles"))) && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground">
                  You don&apos;t have permission to access this section.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
