// Shared types for the StudentSpark application

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'student' | 'master';
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  points: number;
  section?: string;
  batch?: string;
  gitLink?: string;
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  studentId: string;
  points: number;
  reason: string;
  date: string;
}

// Attendance
export type AttendanceStatus = 'present' | 'absent' | 'on-duty';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  status: AttendanceStatus;
  adminId?: string;
}

export interface InsertAttendanceRecord {
  studentId: string;
  date: string; // ISO date (YYYY-MM-DD)
  status: AttendanceStatus;
  adminId?: string;
}

export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  category: 'general' | 'question' | 'concern' | 'suggestion';
  message: string;
  status: 'new' | 'reviewed';
  read: boolean;
  adminId?: string;
  date: string;
}

export interface InsertUser {
  username: string;
  password: string;
  role: 'admin' | 'student' | 'master';
}

export interface InsertStudent {
  name: string;
  studentId: string;
  points: number;
  section?: string;
  batch?: string;
  gitLink?: string;
}

export interface InsertFeedback {
  studentId: string;
  studentName: string;
  category: 'general' | 'question' | 'concern' | 'suggestion';
  message: string;
  adminId?: string;
}

export interface UpdatePoints {
  studentId: string;
  points: number;
  reason: string;
}
