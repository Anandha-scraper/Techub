import { 
  type User, 
  type InsertUser, 
  type Student, 
  type InsertStudent, 
  type Feedback, 
  type InsertFeedback, 
  type PointTransaction
} from "@shared/types";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student methods
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudentPoints(studentId: string, points: number, reason: string): Promise<Student>;
  
  // Feedback methods
  getFeedbacks(adminId?: string): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  updateFeedbackStatus(id: string, status: 'new' | 'reviewed'): Promise<Feedback>;
  markFeedbackAsRead(id: string): Promise<Feedback>;
  deleteFeedback(id: string): Promise<boolean>;
  
  // Point transaction methods
  getPointTransactions(studentId?: string): Promise<PointTransaction[]>;

  // Attendance methods
  getAttendanceForDate(date: string, adminId?: string): Promise<Attendance[]>;
  getAttendanceForStudent(studentId: string): Promise<Attendance[]>;
  upsertAttendance(records: InsertAttendanceRecord[]): Promise<Attendance[]>;
}

// Export the interface for use in other files
// (Named export removed to avoid duplicate export errors)


// Import MongoDB storage
import { MongoStorage } from './storage/mongodb';

// Use MongoDB storage instead of MemStorage
export const storage = new MongoStorage();
