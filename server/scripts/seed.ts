import dotenv from 'dotenv';
import { connectToDatabase } from '../database/connection';
import { AdminUser } from '../models/AdminUser';
import { StudentUser } from '../models/StudentUser';
import { Student } from '../models/Student';
import { Feedback } from '../models/Feedback';
import { PointTransaction } from '../models/PointTransaction';

// Load env vars for MONGODB_URI and DB_NAME
dotenv.config();

const seedData = async () => {
  try {
    await connectToDatabase();
    
    // Clear existing data
    await AdminUser.deleteMany({});
    await StudentUser.deleteMany({});
    await Student.deleteMany({});
    await Feedback.deleteMany({});
    await PointTransaction.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create master user
    const masterUser = new AdminUser({
      username: 'master',
      password: 'master123',
      role: 'master',
      approved: true
    });
    await masterUser.save();
    console.log('Created master user');

    // Create admin user (requires approval)
    const adminUser = new AdminUser({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      approved: false
    });
    await adminUser.save();
    console.log('Created admin user (not approved)');
    
    // Create student users and students
    const mockStudents = [
      { name: 'Alice Johnson', studentId: 'S001', points: 850 },
      { name: 'Bob Smith', studentId: 'S002', points: 720 },
      { name: 'Carol Davis', studentId: 'S003', points: 950 },
      { name: 'David Wilson', studentId: 'S004', points: 680 },
      { name: 'Emma Brown', studentId: 'S005', points: 890 },
    ];

    for (const studentData of mockStudents) {
      // Create user for student
      const studentUser = new StudentUser({
        username: studentData.studentId,
        password: 'student123'
      });
      await studentUser.save();
      
      // Create student record
      const student = new Student(studentData);
      await student.save();
      
      console.log(`Created student: ${studentData.name}`);
    }
    
    // Create mock feedback
    const mockFeedbacks = [
      {
        studentId: 'S001',
        studentName: 'Alice Johnson',
        category: 'question',
        message: 'Could you please explain how the bonus points system works?',
        status: 'new'
      },
      {
        studentId: 'S002',
        studentName: 'Bob Smith',
        category: 'suggestion',
        message: 'It would be great to have a mobile app for checking points on the go.',
        status: 'reviewed'
      },
      {
        studentId: 'S003',
        studentName: 'Carol Davis',
        category: 'concern',
        message: 'I noticed my points from last week haven\'t been updated yet.',
        status: 'new'
      }
    ];

    for (const feedbackData of mockFeedbacks) {
      const feedback = new Feedback(feedbackData);
      await feedback.save();
      console.log(`Created feedback from ${feedbackData.studentName}`);
    }
    
    // Create mock point transactions
    const mockTransactions = [
      {
        studentId: 'S001',
        points: 50,
        reason: 'Excellent project presentation'
      },
      {
        studentId: 'S001',
        points: 30,
        reason: 'Active class participation'
      },
      {
        studentId: 'S002',
        points: 20,
        reason: 'Homework completed on time'
      }
    ];

    for (const transactionData of mockTransactions) {
      const transaction = new PointTransaction(transactionData);
      await transaction.save();
      console.log(`Created point transaction for ${transactionData.studentId}`);
    }
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
