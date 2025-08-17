export interface StudentProfile {
  id: string;
  fullName: string;
  whatsapp: string;
  dateOfBirth: string;
  classType: "KIDS" | "FEMININA" | "MISTA";
  belt: string;
  degree: number;
  canReceiveGrade: boolean;
  parentId?: string;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface CheckinData {
  id: string;
  studentId: string;
  checkedInById: string;
  latitude: string;
  longitude: string;
  checkinDate: string;
  checkinTime: string;
}

export interface ClassSchedule {
  id: string;
  classType: "KIDS" | "FEMININA" | "MISTA";
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxStudents?: number;
  isActive: boolean;
}

export interface AdminDashboardData {
  studentCounts: { classType: string; count: number }[];
  checkins: {
    kids: number;
    female: number;
    mixed: number;
  };
  birthdayStudents: {
    classType: string;
    students: StudentProfile[];
  }[];
}

export interface Settings {
  pixKey: string;
  aboutText: string;
  academyLatitude: string;
  academyLongitude: string;
}

export interface User {
  id: string;
  email: string;
  role: "student" | "professor" | "administrative" | "coordinator";
  student?: StudentProfile;
  admin?: {
    id: string;
    fullName: string;
    whatsapp: string;
    role: string;
    isApproved: boolean;
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

export interface CheckinResult {
  success: boolean;
  message: string;
  checkin?: CheckinData;
}
