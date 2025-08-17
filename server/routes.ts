import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertStudentSchema, insertAdminSchema, insertCheckinSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// Middleware to verify JWT token
async function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// Middleware to check admin role
function requireAdmin(req: any, res: any, next: any) {
  if (!req.user || !['professor', 'administrative', 'coordinator'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default coordinator if not exists
  async function initializeDefaultCoordinator() {
    const existingUser = await storage.getUserByEmail("jiujitsuibbadm@gmail.com");
    if (!existingUser) {
      const coordinatorUser = await storage.createUser({
        email: "jiujitsuibbadm@gmail.com",
        password: "25@jiu",
        role: "coordinator"
      });

      await storage.createAdmin({
        userId: coordinatorUser.id,
        fullName: "Hayanny Câmara",
        whatsapp: "(41) 98460-8282",
        role: "coordinator",
        isApproved: true
      });

      // Initialize default settings
      await storage.setSetting("pixKey", "jiujitsuibbadm@gmail.com");
      await storage.setSetting("aboutText", "O Jiu-Jitsu IBB nasceu da parceria da Igreja Batista do Bacacheri (IBB) com o projeto Jiu-Jitsu Para Todos da Gracie Barra Curitiba. Nossa missão é oferecer apoio a crianças e jovens em situação de vulnerabilidade social, promovendo inclusão, disciplina e oportunidades por meio do Jiu-Jitsu.");
      await storage.setSetting("academyLatitude", "-25.4284");
      await storage.setSetting("academyLongitude", "-49.2733");
    }
  }

  await initializeDefaultCoordinator();

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || !(await storage.validatePassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      // Get additional user data based on role
      let userData = { ...user, password: undefined };
      if (user.role === 'student') {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          userData = { ...userData, student };
        }
      } else if (['professor', 'administrative', 'coordinator'].includes(user.role)) {
        const admin = await storage.getAdminByUserId(user.id);
        if (admin) {
          userData = { ...userData, admin };
        }
      }

      res.json({ token, user: userData });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register-student", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body.user);
      const studentData = insertStudentSchema.parse(req.body.student);

      const user = await storage.createUser({ ...userData, role: "student" });
      const student = await storage.createStudent({ ...studentData, userId: user.id });

      res.json({ user: { ...user, password: undefined }, student });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/request-admin-access", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body.user);
      const adminData = insertAdminSchema.parse(req.body.admin);

      const user = await storage.createUser({ ...userData, role: adminData.role });
      const admin = await storage.createAdmin({ ...adminData, userId: user.id, isApproved: false });

      res.json({ message: "Admin access request submitted for approval" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Student routes
  app.get("/api/student/profile", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Student access only" });
      }

      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/student/checkin", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Student access only" });
      }

      const { latitude, longitude, studentId } = req.body;
      const student = await storage.getStudentByUserId(req.user.id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Check if student already checked in today
      const hasCheckedIn = await storage.hasCheckedInToday(studentId || student.id);
      if (hasCheckedIn) {
        return res.status(400).json({ message: "Already checked in today" });
      }

      // Validate geolocation (within 10 meters of academy)
      const academyLatSetting = await storage.getSetting("academyLatitude");
      const academyLonSetting = await storage.getSetting("academyLongitude");
      
      if (academyLatSetting && academyLonSetting) {
        const academyLat = parseFloat(academyLatSetting.value);
        const academyLon = parseFloat(academyLonSetting.value);
        
        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          academyLat,
          academyLon
        );

        if (distance > 10) { // 10 meters
          return res.status(400).json({ message: "You must be within 10 meters of the academy to check in" });
        }
      }

      const checkin = await storage.createCheckin({
        studentId: studentId || student.id,
        checkedInById: req.user.id,
        latitude,
        longitude
      });

      res.json({ message: "Check-in successful", checkin });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/student/attendance", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Student access only" });
      }

      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const attendance = await storage.getCheckinsByStudent(student.id);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/student/family", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Student access only" });
      }

      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Check if student is 18+ (can manage family)
      const birthDate = new Date(student.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        return res.status(403).json({ message: "Must be 18+ to manage family group" });
      }

      const familyMembers = await storage.getFamilyMembers(student.id);
      res.json(familyMembers);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/student/schedules", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Student access only" });
      }

      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const schedules = await storage.getClassSchedulesByType(student.classType);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/dashboard", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const studentCounts = await storage.getStudentCountByClass();
      const kidsCheckins = await storage.getCheckinsByClassToday("KIDS");
      const femaleCheckins = await storage.getCheckinsByClassToday("FEMININA");
      const mixedCheckins = await storage.getCheckinsByClassToday("MISTA");
      
      const currentMonth = new Date().getMonth() + 1;
      const birthdayStudents = await storage.getBirthdayStudentsByMonth(currentMonth);

      res.json({
        studentCounts,
        checkins: {
          kids: kidsCheckins,
          female: femaleCheckins,
          mixed: mixedCheckins
        },
        birthdayStudents
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/students", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { classType } = req.query;
      let students;
      
      if (classType) {
        students = await storage.getStudentsByClass(classType as string);
      } else {
        students = await storage.getAllStudents();
      }

      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/students", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { user: userData, student: studentData } = req.body;
      
      const user = await storage.createUser({
        ...userData,
        role: "student",
        password: studentData.password || "Aluno123"
      });

      const student = await storage.createStudent({
        ...studentData,
        userId: user.id
      });

      res.json({ user: { ...user, password: undefined }, student });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/students/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const studentData = req.body;
      
      const student = await storage.updateStudent(id, studentData);
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/students/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteStudent(id);
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/pending-admins", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const pendingAdmins = await storage.getPendingAdmins();
      res.json(pendingAdmins);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/approve/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.approveAdmin(id);
      res.json({ message: "Admin approved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/checkins/today", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const checkins = await storage.getCheckinsToday();
      res.json(checkins);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Events routes
  app.get("/api/events", authenticateToken, async (req: any, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/events", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const eventData = { ...req.body, createdBy: req.user.id };
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const settingsObj = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      res.json(settingsObj);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/settings", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}
