import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  uniqueIndex,
  foreignKey,
  doublePrecision,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/relations";
import pkg from 'pg/lib/defaults.js';

const { password } = pkg;

export const userStatus = pgEnum("user_status", [
  "Active",
  "Inactive",
  "Pending",
]);

export const userRole = pgEnum("user_role", [
  "Teacher",
  "Head Teacher",
  "Admin",
  "Principal",
]);

export const checkinStatusEnum = pgEnum("checkin_status", ["Present", "Absent", "Late"]);

export const ChapterStatus = pgEnum("chapter_status", [
    "Not Started",
    "In Progress",
    "Completed",
    "Overdue",
  ]);
  
  export const daysOfWeek = pgEnum("days_of_week", [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);
  
  export const commentType = pgEnum("comment_type", [
    "general",
    "chapter",
    "student",
  ]);
  export const commentPriority = pgEnum("comment_priority", [
    "low",
    "medium",
    "high",
  ]);  

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  subject: varchar("subject", { length: 100 }),
  status: userStatus("status").default("Active"),
  role: userRole("role").notNull(),
  avatar: varchar("avatar", { length: 500 }),
  joinDate: timestamp("join_date"),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  refreshToken: text("refreshToken"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRolePermissions = pgTable(
  "user_role_permissions",
  {
    id: uuid("id").primaryKey(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => userRoles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => ({
    uniqueRolePermission: uniqueIndex("unique_role_permission").on(
      table.roleId,
      table.permissionId
    ),
  })
);

export const userPermissions = pgTable(
  "user_permissions",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => ({
    uniqueUserPermission: uniqueIndex("unique_user_permission").on(
      table.userId,
      table.permissionId
    ),
  })
);

export const classes = pgTable("classes", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  gradeLevel: varchar("grade_level", { length: 20 }),
  academicYear: varchar("academic_year", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(),
});

export const userClasses = pgTable(
  "user_classes",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
  },
  (table) => ({
    uniqueUserClass: uniqueIndex("unique_user_class").on(
      table.userId,
      table.classId
    ),
  })
);


export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  totalLessons: integer("total_lessons").default(0),
  completedLessons: integer("completed_lessons").default(0),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  dueDate: timestamp("due_date"),
  status: ChapterStatus("status").default("Not Started"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  chapterId: uuid("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  isCompleted: boolean("is_completed").default(false),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  duration: integer("duration"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(),
});


export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 100 }).notNull(),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  dayOfWeek: daysOfWeek("day_of_week").notNull(),
  timeSlot: varchar("time_slot", { length: 50 }).notNull(), // e.g., "08:00 - 08:45"
  room: varchar("room", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(),
});

export const students = pgTable("students", {
  id: uuid("id").primaryKey(),
  studentId: varchar("student_id", { length: 50 }).unique().notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  avatar: varchar("avatar", { length: 500 }),
  overallGrade: varchar("overall_grade", { length: 5 }),
  attendanceRate: doublePrecision("attendance_rate").default(0.0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(),
});

export const studentSubjects = pgTable("student_subjects", {
  id: uuid("id").primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  subjectName: varchar("subject_name", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 5 }),
  teacherName: varchar("teacher_name", { length: 255 }),
});

export const parentContacts = pgTable("parent_contacts", {
  id: uuid("id").primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  relationship: varchar("relationship", { length: 50 }).default("Parent"),
});


export const checkinRecords = pgTable("checkin_records", {
  id: uuid("id").primaryKey().notNull(),
  teacherId: uuid("teacher_id").notNull(),
  checkInTime: timestamp("check_in_time").notNull(),
  checkOutTime: timestamp("check_out_time"),
  location: varchar("location", { length: 255 }).default("Main Campus"),
  status: checkinStatusEnum("status").default("Present"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey(),
  type: commentType("type").notNull(),
  chapterId: uuid("chapter_id").references(() => chapters.id, {
    onDelete: "cascade",
  }),
  // HODId: uuid("HOD_id").references(() => students.id, {
  //   onDelete: "cascade",
  // }),
  content: text("content").notNull(),
  priority: commentPriority("priority").default("medium"),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  userClasses: many(userClasses),
  userPermissions: many(userPermissions),
  chapters: many(chapters),
  comments: many(comments),
  checkinRecords: many(checkinRecords),
}));

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  userRolePermissions: many(userRolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  userRolePermissions: many(userRolePermissions),
  userPermissions: many(userPermissions),
}));
export const userRolePermissionsRelations = relations(
  userRolePermissions,
  ({ one }) => ({
    role: one(userRoles, {
      fields: [userRolePermissions.roleId],
      references: [userRoles.id],
    }),
    permission: one(permissions, {
      fields: [userRolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);
export const userPermissionsRelations = relations(
  userPermissions,
  ({ one }) => ({
    user: one(users, {
      fields: [userPermissions.userId],
      references: [users.id],
    }),
    permission: one(permissions, {
      fields: [userPermissions.permissionId],
      references: [permissions.id],
    }),
  })
);
export const classesRelations = relations(classes, ({ many }) => ({
  userClasses: many(userClasses),
  chapters: many(chapters),
  schedules: many(schedules),
  students: many(students),
}));
export const userClassesRelations = relations(userClasses, ({ one }) => ({
  user: one(users, {
    fields: [userClasses.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [userClasses.classId],
    references: [classes.id],
  }),
}));
export const chaptersRelations = relations(chapters, ({ many, one }) => ({
  lessons: many(lessons),
  teacher: one(users, {
    fields: [chapters.teacherId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [chapters.classId],
    references: [classes.id],
  }),
  comments: many(comments),
}));
export const lessonsRelations = relations(lessons, ({ one }) => ({
  chapter: one(chapters, {
    fields: [lessons.chapterId],
    references: [chapters.id],
  }),
}));
export const schedulesRelations = relations(schedules, ({ one }) => ({
  teacher: one(users, {
    fields: [schedules.teacherId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [schedules.classId],
    references: [classes.id],
  }),
}));
export const studentsRelations = relations(students, ({ many, one }) => ({
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  studentSubjects: many(studentSubjects),
  parentContacts: many(parentContacts),
  comments: many(comments),
}));
export const studentSubjectsRelations = relations(
  studentSubjects,
  ({ one }) => ({
    student: one(students, {
      fields: [studentSubjects.studentId],
      references: [students.id],
    }),
  })
);
export const parentContactsRelations = relations(parentContacts, ({ one }) => ({
  student: one(students, {
    fields: [parentContacts.studentId],
    references: [students.id],
  }),
}));
export const checkinRecordsRelations = relations(checkinRecords, ({ one }) => ({
  teacher: one(users, {
    fields: [checkinRecords.teacherId],
    references: [users.id],
  })
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  chapter: one(chapters, {
    fields: [comments.chapterId],
    references: [chapters.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));
