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
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  studentId: string;
  points: number;
  reason: string;
  date: string;
}

export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  category: 'general' | 'question' | 'concern' | 'suggestion';
  message: string;
  status: 'new' | 'reviewed';
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
}

export interface InsertFeedback {
  studentId: string;
  studentName: string;
  category: 'general' | 'question' | 'concern' | 'suggestion';
  message: string;
}

export interface UpdatePoints {
  studentId: string;
  points: number;
  reason: string;
}
