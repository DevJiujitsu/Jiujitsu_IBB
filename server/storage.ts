import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, sql, desc, count, gte, lte } from "drizzle-orm";
import { 
  users, students, admins, checkins, classSchedules, events, gradeRequirements, settings,
  type User, type Student, type Admin, type Checkin, type ClassSchedule, type Event, 
  type GradeRequirement, type Setting,
  type InsertUser, type InsertStudent, type InsertAdmin, type InsertCheckin,
  type InsertClassSchedule, type InsertEvent, type InsertGradeRequirement, type InsertSetting,
  type StudentWithUser, type AdminWithUser, type CheckinWithStudent
} from "@shared/schema";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:25@Jiuadm@db.eliyybfchbdpmksjbtvl.supabase.co:5432/postgres";
const client = postgres(connectionString);
const db = drizzle(client);

export interface IStorage {
  // Auth
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  validatePassword(password: string, hashedPassword: string): Promise<boolean>;
  
  // Students
  createStudent(student: InsertStudent): Promise<Student>;
  getStudentById(id: string): Promise<StudentWithUser | undefined>;
  getStudentByUserId(userId: string): Promise<StudentWithUser | undefined>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  getStudentsByClass(classType: string): Promise<StudentWithUser[]>;
  getAllStudents(): Promise<StudentWithUser[]>;
  getFamilyMembers(parentId: string): Promise<StudentWithUser[]>;
  
  // Admins
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminByUserId(userId: string): Promise<AdminWithUser | undefined>;
  updateAdmin(id: string, admin: Partial<InsertAdmin>): Promise<Admin>;
  getPendingAdmins(): Promise<AdminWithUser[]>;
  approveAdmin(id: string): Promise<void>;
  
  // Check-ins
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  getCheckinsByStudent(studentId: string): Promise<Checkin[]>;
  getCheckinsToday(): Promise<CheckinWithStudent[]>;
  getCheckinsByClassToday(classType: string): Promise<number>;
  hasCheckedInToday(studentId: string): Promise<boolean>;
  
  // Class schedules
  createClassSchedule(schedule: InsertClassSchedule): Promise<ClassSchedule>;
  getClassSchedules(): Promise<ClassSchedule[]>;
  getClassSchedulesByType(classType: string): Promise<ClassSchedule[]>;
  updateClassSchedule(id: string, schedule: Partial<InsertClassSchedule>): Promise<ClassSchedule>;
  deleteClassSchedule(id: string): Promise<void>;
  
  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(): Promise<Event[]>;
  getEventsByDate(date: string): Promise<Event[]>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  
  // Grade requirements
  createGradeRequirement(requirement: InsertGradeRequirement): Promise<GradeRequirement>;
  getGradeRequirements(): Promise<GradeRequirement[]>;
  updateGradeRequirement(id: string, requirement: Partial<InsertGradeRequirement>): Promise<GradeRequirement>;
  
  // Settings
  setSetting(key: string, value: string): Promise<Setting>;
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(): Promise<Setting[]>;
  
  // Statistics
  getStudentCountByClass(): Promise<{ classType: string; count: number }[]>;
  getBirthdayStudentsByMonth(month: number): Promise<{ classType: string; students: StudentWithUser[] }>;
  getStudentsEligibleForGrade(): Promise<{ classType: string; students: StudentWithUser[] }>;
}

export class PostgresStorage implements IStorage {
  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
    }).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(studentData).returning();
    return student;
  }

  async getStudentById(id: string): Promise<StudentWithUser | undefined> {
    const [result] = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.id, id));
    
    if (!result) return undefined;
    return { ...result.students, user: result.users };
  }

  async getStudentByUserId(userId: string): Promise<StudentWithUser | undefined> {
    const [result] = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.userId, userId));
    
    if (!result) return undefined;
    return { ...result.students, user: result.users };
  }

  async updateStudent(id: string, studentData: Partial<InsertStudent>): Promise<Student> {
    const [student] = await db
      .update(students)
      .set(studentData)
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async getStudentsByClass(classType: string): Promise<StudentWithUser[]> {
    const results = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(and(eq(students.classType, classType as any), eq(students.isActive, true)));
    
    return results.map(result => ({ ...result.students, user: result.users }));
  }

  async getAllStudents(): Promise<StudentWithUser[]> {
    const results = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.isActive, true));
    
    return results.map(result => ({ ...result.students, user: result.users }));
  }

  async getFamilyMembers(parentId: string): Promise<StudentWithUser[]> {
    const results = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.parentId, parentId));
    
    return results.map(result => ({ ...result.students, user: result.users }));
  }

  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(adminData).returning();
    return admin;
  }

  async getAdminByUserId(userId: string): Promise<AdminWithUser | undefined> {
    const [result] = await db
      .select()
      .from(admins)
      .innerJoin(users, eq(admins.userId, users.id))
      .where(eq(admins.userId, userId));
    
    if (!result) return undefined;
    return { ...result.admins, user: result.users };
  }

  async updateAdmin(id: string, adminData: Partial<InsertAdmin>): Promise<Admin> {
    const [admin] = await db
      .update(admins)
      .set(adminData)
      .where(eq(admins.id, id))
      .returning();
    return admin;
  }

  async getPendingAdmins(): Promise<AdminWithUser[]> {
    const results = await db
      .select()
      .from(admins)
      .innerJoin(users, eq(admins.userId, users.id))
      .where(eq(admins.isApproved, false));
    
    return results.map(result => ({ ...result.admins, user: result.users }));
  }

  async approveAdmin(id: string): Promise<void> {
    await db
      .update(admins)
      .set({ isApproved: true })
      .where(eq(admins.id, id));
  }

  async createCheckin(checkinData: InsertCheckin): Promise<Checkin> {
    const [checkin] = await db.insert(checkins).values(checkinData).returning();
    return checkin;
  }

  async getCheckinsByStudent(studentId: string): Promise<Checkin[]> {
    return db
      .select()
      .from(checkins)
      .where(eq(checkins.studentId, studentId))
      .orderBy(desc(checkins.checkinTime));
  }

  async getCheckinsToday(): Promise<CheckinWithStudent[]> {
    const today = new Date().toISOString().split('T')[0];
    const results = await db
      .select()
      .from(checkins)
      .innerJoin(students, eq(checkins.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(checkins.checkinDate, today))
      .orderBy(desc(checkins.checkinTime));
    
    return results.map(result => ({
      ...result.checkins,
      student: { ...result.students, user: result.users }
    }));
  }

  async getCheckinsByClassToday(classType: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db
      .select({ count: count() })
      .from(checkins)
      .innerJoin(students, eq(checkins.studentId, students.id))
      .where(and(
        eq(checkins.checkinDate, today),
        eq(students.classType, classType as any)
      ));
    
    return result.count;
  }

  async hasCheckedInToday(studentId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db
      .select({ count: count() })
      .from(checkins)
      .where(and(
        eq(checkins.studentId, studentId),
        eq(checkins.checkinDate, today)
      ));
    
    return result.count > 0;
  }

  async createClassSchedule(scheduleData: InsertClassSchedule): Promise<ClassSchedule> {
    const [schedule] = await db.insert(classSchedules).values(scheduleData).returning();
    return schedule;
  }

  async getClassSchedules(): Promise<ClassSchedule[]> {
    return db.select().from(classSchedules).where(eq(classSchedules.isActive, true));
  }

  async getClassSchedulesByType(classType: string): Promise<ClassSchedule[]> {
    return db
      .select()
      .from(classSchedules)
      .where(and(eq(classSchedules.classType, classType as any), eq(classSchedules.isActive, true)));
  }

  async updateClassSchedule(id: string, scheduleData: Partial<InsertClassSchedule>): Promise<ClassSchedule> {
    const [schedule] = await db
      .update(classSchedules)
      .set(scheduleData)
      .where(eq(classSchedules.id, id))
      .returning();
    return schedule;
  }

  async deleteClassSchedule(id: string): Promise<void> {
    await db
      .update(classSchedules)
      .set({ isActive: false })
      .where(eq(classSchedules.id, id));
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }

  async getEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.eventDate));
  }

  async getEventsByDate(date: string): Promise<Event[]> {
    return db.select().from(events).where(eq(events.eventDate, date));
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async createGradeRequirement(requirementData: InsertGradeRequirement): Promise<GradeRequirement> {
    const [requirement] = await db.insert(gradeRequirements).values(requirementData).returning();
    return requirement;
  }

  async getGradeRequirements(): Promise<GradeRequirement[]> {
    return db.select().from(gradeRequirements);
  }

  async updateGradeRequirement(id: string, requirementData: Partial<InsertGradeRequirement>): Promise<GradeRequirement> {
    const [requirement] = await db
      .update(gradeRequirements)
      .set(requirementData)
      .where(eq(gradeRequirements.id, id))
      .returning();
    return requirement;
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const [setting] = await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: sql`NOW()` }
      })
      .returning();
    return setting;
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async getSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }

  async getStudentCountByClass(): Promise<{ classType: string; count: number }[]> {
    const results = await db
      .select({
        classType: students.classType,
        count: count()
      })
      .from(students)
      .where(eq(students.isActive, true))
      .groupBy(students.classType);
    
    return results;
  }

  async getBirthdayStudentsByMonth(month: number): Promise<{ classType: string; students: StudentWithUser[] }> {
    const results = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(and(
        eq(students.isActive, true),
        sql`EXTRACT(MONTH FROM ${students.dateOfBirth}) = ${month}`
      ));
    
    const studentsByClass = results.reduce((acc, result) => {
      const student = { ...result.students, user: result.users };
      if (!acc[student.classType]) {
        acc[student.classType] = [];
      }
      acc[student.classType].push(student);
      return acc;
    }, {} as Record<string, StudentWithUser[]>);

    return Object.entries(studentsByClass).map(([classType, students]) => ({
      classType,
      students
    }));
  }

  async getStudentsEligibleForGrade(): Promise<{ classType: string; students: StudentWithUser[] }> {
    // This would require complex logic to count attendance and check against grade requirements
    // For now, returning empty array - would need to implement attendance counting logic
    return { classType: "", students: [] };
  }
}

export const storage = new PostgresStorage();
