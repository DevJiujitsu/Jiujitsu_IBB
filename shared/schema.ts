import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["student", "professor", "administrative", "coordinator"]);
export const classTypeEnum = pgEnum("class_type", ["KIDS", "FEMININA", "MISTA"]);
export const beltEnum = pgEnum("belt", ["branca", "cinza", "amarela", "laranja", "verde", "azul", "roxa", "marrom", "preta"]);

// Users table (for authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  fullName: text("full_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  classType: classTypeEnum("class_type").notNull(),
  belt: beltEnum("belt").notNull().default("branca"),
  degree: integer("degree").notNull().default(1),
  canReceiveGrade: boolean("can_receive_grade").notNull().default(true),
  parentId: varchar("parent_id").references(() => students.id), // For family groups
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admins table
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  fullName: text("full_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  role: userRoleEnum("role").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Check-ins table
export const checkins = pgTable("checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  checkedInById: varchar("checked_in_by_id").references(() => users.id).notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  checkinDate: date("checkin_date").notNull().default(sql`CURRENT_DATE`),
  checkinTime: timestamp("checkin_time").defaultNow().notNull(),
});

// Class schedules table
export const classSchedules = pgTable("class_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classType: classTypeEnum("class_type").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  maxStudents: integer("max_students"),
  isActive: boolean("is_active").notNull().default(true),
});

// Events/Agenda table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: date("event_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  classType: classTypeEnum("class_type"), // null for all classes
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Grade requirements table
export const gradeRequirements = pgTable("grade_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  belt: beltEnum("belt").notNull(),
  degree: integer("degree").notNull(),
  requiredClasses: integer("required_classes").notNull(),
});

// Settings table
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true });
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true, createdAt: true });
export const insertCheckinSchema = createInsertSchema(checkins).omit({ id: true, checkinTime: true, checkinDate: true });
export const insertClassScheduleSchema = createInsertSchema(classSchedules).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertGradeRequirementSchema = createInsertSchema(gradeRequirements).omit({ id: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type Checkin = typeof checkins.$inferSelect;
export type ClassSchedule = typeof classSchedules.$inferSelect;
export type Event = typeof events.$inferSelect;
export type GradeRequirement = typeof gradeRequirements.$inferSelect;
export type Setting = typeof settings.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type InsertClassSchedule = z.infer<typeof insertClassScheduleSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertGradeRequirement = z.infer<typeof insertGradeRequirementSchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Additional types for API responses
export type StudentWithUser = Student & { user: User };
export type AdminWithUser = Admin & { user: User };
export type CheckinWithStudent = Checkin & { student: StudentWithUser };
