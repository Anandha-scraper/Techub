import { 
  type User, 
  type InsertUser, 
  type Student, 
  type InsertStudent, 
  type Feedback, 
  type InsertFeedback, 
  type PointTransaction,
  type UpdatePoints 
} from "@shared/types";
import { IStorage } from "../storage";
import { User as UserModel, IUser } from "../models/User";
import { Student as StudentModel, IStudent } from "../models/Student";
import { AdminUser as AdminUserModel } from "../models/AdminUser";
import { Feedback as FeedbackModel, IFeedback } from "../models/Feedback";
import { PointTransaction as PointTransactionModel, IPointTransaction } from "../models/PointTransaction";

export class MongoStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id).lean();
      if (!user) return undefined;
      
      return {
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        role: user.role
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ username }).lean();
      if (!user) return undefined;
      
      return {
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        role: user.role
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const user = new UserModel(insertUser);
      await user.save();
      
      return {
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        role: user.role
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Student methods
  async getStudents(): Promise<Student[]> {
    try {
      const students = await StudentModel.find().lean();
      return students.map(student => ({
        id: student._id.toString(),
        name: student.name,
        studentId: student.studentId,
        points: student.points,
        section: (student as any).section,
        batch: (student as any).batch,
        createdAt: student.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  }

  async getStudent(id: string): Promise<Student | undefined> {
    try {
      const student = await StudentModel.findById(id).lean();
      if (!student) return undefined;
      
      return {
        id: student._id.toString(),
        name: student.name,
        studentId: student.studentId,
        points: student.points,
        section: (student as any).section,
        batch: (student as any).batch,
        createdAt: student.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error getting student:', error);
      throw error;
    }
  }

  async createStudent(student: InsertStudent & { createdBy?: string }): Promise<Student> {
    try {
      const newStudent = new StudentModel(student);
      await newStudent.save();
      
      return {
        id: newStudent._id.toString(),
        name: newStudent.name,
        studentId: newStudent.studentId,
        points: newStudent.points,
        section: (newStudent as any).section,
        batch: (newStudent as any).batch,
        createdAt: newStudent.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async updateStudentPoints(studentId: string, points: number, reason: string, updaterId?: string): Promise<Student> {
    try {
      const filter: any = { studentId };
      if (updaterId) {
        filter.createdBy = updaterId;
      }
      const student = await StudentModel.findOne(filter);
      if (!student) {
        throw new Error('Student not found');
      }
      
      student.points = points;
      await student.save();
      
      // Add point transaction
      const transaction = new PointTransactionModel({
        studentId,
        points,
        reason
      });
      await transaction.save();
      
      return {
        id: student._id.toString(),
        name: student.name,
        studentId: student.studentId,
        points: student.points,
        section: (student as any).section,
        batch: (student as any).batch,
        createdAt: student.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error updating student points:', error);
      throw error;
    }
  }

  // Feedback methods
  async getFeedbacks(adminId?: string): Promise<Feedback[]> {
    try {
      const query = adminId ? { adminId } : {};
      const feedbacks = await FeedbackModel.find(query).sort({ createdAt: -1 }).lean();
      return feedbacks.map(feedback => ({
        id: feedback._id.toString(),
        studentId: feedback.studentId,
        studentName: feedback.studentName,
        category: feedback.category,
        message: feedback.message,
        status: feedback.status,
        read: feedback.read || false,
        adminId: (feedback as any).adminId,
        date: feedback.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Error getting feedbacks:', error);
      throw error;
    }
  }

  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    try {
      const newFeedback = new FeedbackModel(feedback);
      await newFeedback.save();
      
      return {
        id: newFeedback._id.toString(),
        studentId: newFeedback.studentId,
        studentName: newFeedback.studentName,
        category: newFeedback.category,
        message: newFeedback.message,
        status: newFeedback.status,
        read: newFeedback.read || false,
        adminId: (newFeedback as any).adminId,
        date: newFeedback.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  async updateFeedbackStatus(id: string, status: 'new' | 'reviewed'): Promise<Feedback> {
    try {
      const feedback = await FeedbackModel.findByIdAndUpdate(
        id, 
        { status }, 
        { new: true }
      ).lean();
      
      if (!feedback) {
        throw new Error('Feedback not found');
      }
      
      return {
        id: feedback._id.toString(),
        studentId: feedback.studentId,
        studentName: feedback.studentName,
        category: feedback.category,
        message: feedback.message,
        status: feedback.status,
        read: feedback.read || false,
        adminId: (feedback as any).adminId,
        date: feedback.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    }
  }

  async markFeedbackAsRead(id: string): Promise<Feedback> {
    try {
      const feedback = await FeedbackModel.findByIdAndUpdate(
        id, 
        { read: true, status: 'reviewed' }, 
        { new: true }
      ).lean();
      
      if (!feedback) {
        throw new Error('Feedback not found');
      }
      
      return {
        id: feedback._id.toString(),
        studentId: feedback.studentId,
        studentName: feedback.studentName,
        category: feedback.category,
        message: feedback.message,
        status: feedback.status,
        read: feedback.read || false,
        adminId: (feedback as any).adminId,
        date: feedback.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error marking feedback as read:', error);
      throw error;
    }
  }

  async deleteFeedback(id: string): Promise<boolean> {
    try {
      const result = await FeedbackModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }

  // Point transaction methods
  async getPointTransactions(studentId?: string): Promise<PointTransaction[]> {
    try {
      const query = studentId ? { studentId } : {};
      const transactions = await PointTransactionModel.find(query)
        .sort({ createdAt: -1 })
        .lean();
      
      return transactions.map(transaction => ({
        id: transaction._id.toString(),
        studentId: transaction.studentId,
        points: transaction.points,
        reason: transaction.reason,
        date: transaction.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Error getting point transactions:', error);
      throw error;
    }
  }
}
