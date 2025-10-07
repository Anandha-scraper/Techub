import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AdminUser as AdminUserModel } from "./models/AdminUser";
import { StudentUser as StudentUserModel } from "./models/StudentUser";
import { Student as StudentModel } from "./models/Student";
import { Feedback as FeedbackModel } from "./models/Feedback";
import { PointTransaction as PointTransactionModel } from "./models/PointTransaction";
// @ts-ignore - using multer without types; see server/types/multer.d.ts
import multer from "multer";
import * as XLSX from "xlsx";

export async function registerRoutes(app: Express): Promise<Server> {
  const generatePassword = (name: string, batch: string | undefined | null): string => {
    const toBatchDigits = (batchStr: string): string => {
      const match = String(batchStr || '').match(/(\d{4})\s*[-–]\s*(\d{4})/);
      if (!match) return '';
      const y1 = match[1].slice(-2);
      const y2 = match[2].slice(-2);
      return `${y1}${y2}`;
    };
    const nameUpperNoSpaces = String(name || '').toUpperCase().replace(/\s+/g, '');
    const batchDigits = toBatchDigits(String(batch || ''));
    let generated = `${nameUpperNoSpaces}${batchDigits}@#`;
    if (generated.length < 6) generated = (generated + '123456').slice(0, 8);
    return generated;
  };
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, role } = req.body;

      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required" });
      }

      // Normalize input
      const rawUsername: string = String(username).trim();
      const normalizedUsername = role === 'student' ? rawUsername.toUpperCase() : rawUsername;
      const normalizedPassword: string = String(password).trim();

      // Validate against MongoDB (hashed passwords)
      let userDoc: any = null;
      if (role === 'student') {
        userDoc = await StudentUserModel.findOne({ username: normalizedUsername });
      } else {
        userDoc = await AdminUserModel.findOne({ username: normalizedUsername });
      }
      if (!userDoc) {
        console.warn(`[auth] user not found: ${normalizedUsername}`);
        return res.status(401).json({ message: "Invalid credentials: user not found" });
      }
      if (userDoc.role !== role) {
        console.warn(`[auth] role mismatch for ${normalizedUsername}. expected=${role} actual=${userDoc.role}`);
        return res.status(401).json({ message: "Invalid credentials: role mismatch" });
      }

      const isMatch = await userDoc.comparePassword(normalizedPassword);
      if (!isMatch) {
        console.warn(`[auth] password mismatch for ${normalizedUsername}`);
        return res.status(401).json({ message: "Invalid credentials: password mismatch" });
      }

      // Require approval for admins (master bypasses)
      if (userDoc.role === 'admin' && userDoc.approved !== true) {
        return res.status(403).json({ message: "Admin not yet approved by master" });
      }

      // Update lastLogin for admin/master on successful login
      try {
        if (userDoc.role === 'admin' || userDoc.role === 'master') {
          await AdminUserModel.updateOne({ _id: userDoc._id }, { $set: { lastLogin: new Date() } });
        }
      } catch {}

      res.json({
        success: true,
        user: { id: userDoc._id.toString(), username: userDoc.username, role: userDoc.role }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin self-registration (requires master approval)
  app.post('/api/admins/register', async (req, res) => {
    try {
      const { username, password } = req.body as { username?: string; password?: string };
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      const u = String(username).trim();
      const p = String(password).trim();
      if (u.length < 3) return res.status(400).json({ message: 'Username must be at least 3 characters' });
      if (p.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

      // Create admin with approved=false
      const existing = await AdminUserModel.findOne({ username: u });
      if (existing) return res.status(409).json({ message: 'Username already exists' });
      const admin = new AdminUserModel({ username: u, password: p, role: 'admin', approved: false });
      await admin.save();
      res.json({ success: true, message: 'Registration submitted. Awaiting master approval.' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to register admin' });
    }
  });

  // Self-service: change password for admin or student (pre-login)
  app.post('/api/auth/change-password', async (req, res) => {
    try {
      const { username, oldPassword, newPassword, role } = req.body as { username?: string; oldPassword?: string; newPassword?: string; role?: 'admin' | 'student' };
      if (!username || !oldPassword || !newPassword || !role) {
        return res.status(400).json({ message: 'username, oldPassword, newPassword and role are required' });
      }
      if (String(newPassword).trim().length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      const normalizedUsername = role === 'student' ? String(username).trim().toUpperCase() : String(username).trim();
      const userDoc = role === 'student'
        ? await StudentUserModel.findOne({ username: normalizedUsername })
        : await AdminUserModel.findOne({ username: normalizedUsername });

      if (!userDoc) return res.status(404).json({ message: 'User not found' });

      const ok = await userDoc.comparePassword(String(oldPassword));
      if (!ok) return res.status(401).json({ message: 'Old password incorrect' });

      userDoc.password = String(newPassword).trim();
      await userDoc.save();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to change password' });
    }
  });

  // Student routes
  // Create student manually (admin)
  app.post('/api/students', async (req, res) => {
    try {
      const adminId = String((req.headers['x-admin-id'] as string | undefined) || '').trim();
      if (!adminId) return res.status(401).json({ message: 'Missing admin context' });
      const { name, studentId, section, batch, password } = req.body as { name?: string; studentId?: string; section?: string; batch?: string; password?: string };
      if (!name || !studentId) return res.status(400).json({ message: 'name and studentId are required' });
      const sid = String(studentId).trim().toUpperCase();
      const doc = await StudentModel.findOneAndUpdate(
        { studentId: sid, createdBy: adminId },
        { $setOnInsert: { points: 0 }, $set: { name: String(name).trim(), section: section ? String(section).trim() : undefined, batch: batch ? String(batch).trim() : undefined, createdBy: adminId } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
      // Create or update student login
      let user = await StudentUserModel.findOne({ username: sid });
      let initialPassword: string | undefined = undefined;
      const effectiveBatch: string | undefined = (batch && String(batch).trim()) || ((doc as any)?.batch ? String((doc as any).batch) : undefined);
      if (!user) {
        const provided = (password && String(password).trim().length >= 6) ? String(password).trim() : undefined;
        const generated = generatePassword(String(name), effectiveBatch);
        initialPassword = provided || generated;
        user = new StudentUserModel({ username: sid, password: initialPassword, role: 'student' });
      } else if (password && String(password).trim().length >= 6) {
        initialPassword = String(password).trim();
        user.password = initialPassword;
      } else {
        // Ensure consistency with upload generator even if user already exists
        const generated = generatePassword(String(name), effectiveBatch);
        initialPassword = generated;
        user.password = generated;
      }
      await user.save();
      res.status(201).json({ id: doc._id.toString(), name: doc.name, studentId: doc.studentId, points: doc.points, section: (doc as any).section, batch: (doc as any).batch, initialPassword: initialPassword || undefined });
    } catch (error: any) {
      if (error?.code === 11000) {
        return res.status(409).json({ message: 'Student already exists for this admin' });
      }
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to create student';
      res.status(500).json({ message: msg });
    }
  });
  app.get("/api/students", async (req, res) => {
    try {
      const adminId = String((req.headers['x-admin-id'] as string | undefined) || '').trim();
      if (adminId) {
        const docs = await StudentModel.find({ createdBy: adminId }).lean();
        return res.json(docs.map((doc: any) => ({
          id: doc._id.toString(),
          name: doc.name,
          studentId: doc.studentId,
          points: doc.points,
          section: doc.section,
          batch: doc.batch,
          createdAt: doc.createdAt?.toISOString?.() || new Date().toISOString()
        })));
      }
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const student = await storage.getStudent(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  // Fetch student by studentId (username)
  app.get('/api/students/by-id/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const doc = await StudentModel.findOne({ studentId: String(studentId).toUpperCase() }).lean();
      if (!doc) return res.status(404).json({ message: 'Student not found' });
      res.json({
        id: doc._id.toString(),
        name: doc.name,
        studentId: doc.studentId,
        points: doc.points,
        section: (doc as any).section,
        batch: (doc as any).batch,
        createdAt: doc.createdAt?.toISOString?.() || new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch student' });
    }
  });

  app.put("/api/students/:id/points", async (req, res) => {
    try {
      const { id } = req.params;
      const { points, reason } = req.body;
      const updaterId = (req.headers['x-admin-id'] as string | undefined) || undefined;
      
      if (typeof points !== 'number' || !reason) {
        return res.status(400).json({ message: "Points and reason are required" });
      }

      // Accept both studentId and mongo _id
      let updatedStudent;
      try {
        updatedStudent = await storage.updateStudentPoints(id, points, reason, updaterId);
      } catch (e) {
        // If not found via storage method (expects studentId), try resolving by _id to studentId
        const doc = await StudentModel.findById(id).lean();
        if (!doc) throw e;
        updatedStudent = await storage.updateStudentPoints(doc.studentId, points, reason, updaterId);
      }
      res.json(updatedStudent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update student points" });
    }
  });

  // Increment points (add)
  app.post('/api/students/:id/points/add', async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body as { amount: number; reason?: string };
      if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Positive amount is required' });
      }
      const adminId = String((req.headers['x-admin-id'] as string | undefined) || '').trim();
      const filterByStudentId = adminId ? { studentId: String(id).toUpperCase(), createdBy: adminId } as any : { studentId: String(id).toUpperCase() } as any;
      let doc = await StudentModel.findOneAndUpdate(filterByStudentId, { $inc: { points: amount } }, { new: true });
      if (!doc) {
        // try by _id
        doc = await StudentModel.findByIdAndUpdate(id, { $inc: { points: amount } }, { new: true });
      }
      if (!doc) return res.status(404).json({ message: 'Student not found' });
      if (adminId && String((doc as any).createdBy || '') !== adminId) {
        return res.status(403).json({ message: 'Not authorized for this student' });
      }
      // record transaction
      const tx = new PointTransactionModel({ studentId: doc.studentId, points: amount, reason: reason || 'Added by admin' });
      await tx.save();
      res.json({ id: doc._id.toString(), name: doc.name, studentId: doc.studentId, points: doc.points, createdAt: doc.createdAt.toISOString?.() });
    } catch (e) {
      res.status(500).json({ message: 'Failed to add points' });
    }
  });

  // Decrement points (minus)
  app.post('/api/students/:id/points/minus', async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body as { amount: number; reason?: string };
      if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Positive amount is required' });
      }
      const upd = async (filter: any) => {
        const current = await StudentModel.findOne(filter);
        if (!current) return undefined;
        const newPoints = Math.max(0, (current.points || 0) - amount);
        current.points = newPoints;
        await current.save();
        return current;
      };
      const adminId2 = String((req.headers['x-admin-id'] as string | undefined) || '').trim();
      let doc = await upd(adminId2 ? { studentId: String(id).toUpperCase(), createdBy: adminId2 } : { studentId: String(id).toUpperCase() });
      if (!doc) doc = await upd({ _id: id });
      if (!doc) return res.status(404).json({ message: 'Student not found' });
      if (adminId2 && String((doc as any).createdBy || '') !== adminId2) {
        return res.status(403).json({ message: 'Not authorized for this student' });
      }
      // record transaction (store negative value to indicate deduction)
      const tx = new PointTransactionModel({ studentId: doc.studentId, points: -amount, reason: reason || 'Deducted by admin' });
      await tx.save();
      res.json({ id: doc._id.toString(), name: doc.name, studentId: doc.studentId, points: doc.points, createdAt: doc.createdAt.toISOString?.() });
    } catch (e) {
      res.status(500).json({ message: 'Failed to deduct points' });
    }
  });

  // Admin: update student password by studentId or mongo _id
  app.patch('/api/students/:id/password', async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body as { password?: string };
      if (typeof password !== 'string' || password.trim().length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Resolve studentId from either direct studentId or _id
      const idStr = String(id).trim();
      let studentIdUpper = idStr.toUpperCase();
      // Only attempt findById if it looks like a Mongo ObjectId to avoid CastError
      const looksLikeObjectId = /^[a-fA-F0-9]{24}$/.test(idStr);
      if (looksLikeObjectId) {
        const studentByMongoId = await StudentModel.findById(idStr).select('studentId').lean();
        if (studentByMongoId?.studentId) {
          studentIdUpper = String(studentByMongoId.studentId).toUpperCase();
        }
      }

      // Find or create StudentUser by username (studentId)
      let user = await StudentUserModel.findOne({ username: studentIdUpper });
      if (!user) {
        // Ensure student exists before creating login
        const existingStudent = await StudentModel.findOne({ studentId: studentIdUpper }).select('_id').lean();
        if (!existingStudent) {
          return res.status(404).json({ message: 'Student not found' });
        }
        user = new StudentUserModel({ username: studentIdUpper, password: password.trim(), role: 'student' });
      } else {
        user.password = password.trim();
      }
      await user.save(); // pre-save hook will hash it

      res.json({ success: true, id: user._id.toString(), username: user.username });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update password' });
    }
  });

  // Delete student by studentId and cascade delete related user and records
  app.delete('/api/students/:id', async (req, res) => {
    try {
      const { id } = req.params; // treat as studentId
      const studentIdUpper = String(id).toUpperCase();
      const adminId = String((req.headers['x-admin-id'] as string | undefined) || '').trim();

      let student = await StudentModel.findOne(adminId ? { studentId: studentIdUpper, createdBy: adminId } : { studentId: studentIdUpper }).lean();
      const byStudentId = !!student;
      if (!student) {
        // Try find by Mongo _id
        student = await StudentModel.findById(id).lean();
      }

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      if (adminId && String((student as any).createdBy || '') !== adminId) {
        return res.status(403).json({ message: 'Not authorized for this student' });
      }

      // proceed to delete
      if (byStudentId) {
        await StudentModel.findOneAndDelete(adminId ? { studentId: studentIdUpper, createdBy: adminId } : { studentId: studentIdUpper }).lean();
      } else {
        await StudentModel.findByIdAndDelete(id).lean();
      }

      const deletedStudentId = student.studentId || studentIdUpper;
      // Delete associated student login
      const userDel = await StudentUserModel.findOneAndDelete({ username: deletedStudentId }).lean();
      // Optionally remove related feedback and point transactions
      const [fbRes, txRes] = await Promise.all([
        FeedbackModel.deleteMany({ studentId: deletedStudentId }),
        PointTransactionModel.deleteMany({ studentId: deletedStudentId })
      ]);

      res.json({ 
        success: true, 
        deleted: { id: student._id?.toString?.() || '', studentId: deletedStudentId },
        meta: {
          matchedBy: byStudentId ? 'studentId' : 'mongoId',
          deletedUser: !!userDel,
          feedbacksDeleted: typeof fbRes?.deletedCount === 'number' ? fbRes.deletedCount : undefined,
          transactionsDeleted: typeof txRes?.deletedCount === 'number' ? txRes.deletedCount : undefined
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete student' });
    }
  });

  // Feedback routes
  app.get("/api/feedback", async (req, res) => {
    try {
      const feedbacks = await storage.getFeedbacks();
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const { studentId, studentName, category, message } = req.body;
      
      if (!studentId || !studentName || !category || !message) {
        return res.status(400).json({ message: "All feedback fields are required" });
      }

      const feedback = await storage.createFeedback({
        studentId,
        studentName,
        category,
        message
      });
      
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  app.put("/api/feedback/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['new', 'reviewed'].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }

      const feedback = await storage.updateFeedbackStatus(id, status);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to update feedback status" });
    }
  });

  // Point transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const { studentId } = req.query;
      const transactions = await storage.getPointTransactions(studentId as string);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Master admin routes
  // Simple master check via query/header for demo. In production, use JWT sessions.
  app.get('/api/master/admins', async (req, res) => {
    try {
      const key = req.headers['x-master-key'] || req.query.key;
      if (key !== 'master') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const admins = await AdminUserModel.find({ role: 'admin' }).select('username role approved lastLogin').lean();
      res.json(admins.map(a => ({ id: a._id.toString(), username: a.username, role: a.role, approved: a.approved, lastLogin: a.lastLogin ? new Date(a.lastLogin).toISOString() : null })));
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch admins' });
    }
  });

  app.post('/api/master/admins/:id/approve', async (req, res) => {
    try {
      const key = req.headers['x-master-key'] || req.query.key;
      if (key !== 'master') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { id } = req.params;
      const updated = await AdminUserModel.findByIdAndUpdate(id, { approved: true }, { new: true }).select('username role approved').lean();
      if (!updated) return res.status(404).json({ message: 'Admin not found' });
      res.json({ id: updated._id.toString(), username: updated.username, role: updated.role, approved: updated.approved });
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve admin' });
    }
  });

  // Master: preview cascade delete for an admin
  app.get('/api/master/admins/:id/preview-delete', async (req, res) => {
    try {
      const key = req.headers['x-master-key'] || req.query.key;
      if (key !== 'master') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { id } = req.params;
      const admin = await AdminUserModel.findById(id).select('username role approved').lean();
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
      const students = await StudentModel.find({ createdBy: id }).select('name studentId').lean();
      res.json({
        admin: { id: id, username: admin.username },
        students: students.map(s => ({ name: s.name, studentId: s.studentId }))
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to preview delete' });
    }
  });

  // Master: delete admin and cascade delete their students and related data
  app.delete('/api/master/admins/:id', async (req, res) => {
    try {
      const key = req.headers['x-master-key'] || req.query.key;
      if (key !== 'master') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { id } = req.params;
      const admin = await AdminUserModel.findById(id).select('username role').lean();
      if (!admin) return res.status(404).json({ message: 'Admin not found' });

      // Find students created by this admin
      const students = await StudentModel.find({ createdBy: id }).select('studentId').lean();
      const studentIds = students.map(s => s.studentId);

      // Delete students
      const delStudentsRes = await StudentModel.deleteMany({ createdBy: id });
      // Delete student logins
      const delStudentUsersRes = await StudentUserModel.deleteMany({ username: { $in: studentIds } });
      // Delete related feedback and point transactions
      const [fbRes, txRes] = await Promise.all([
        FeedbackModel.deleteMany({ studentId: { $in: studentIds } }),
        PointTransactionModel.deleteMany({ studentId: { $in: studentIds } })
      ]);
      // Finally delete the admin user itself
      const delAdminRes = await AdminUserModel.findByIdAndDelete(id).lean();

      res.json({
        success: true,
        deleted: {
          admin: { id, username: admin.username },
          students: studentIds
        },
        meta: {
          studentsDeleted: typeof delStudentsRes?.deletedCount === 'number' ? delStudentsRes.deletedCount : undefined,
          studentUsersDeleted: typeof delStudentUsersRes?.deletedCount === 'number' ? delStudentUsersRes.deletedCount : undefined,
          feedbacksDeleted: typeof fbRes?.deletedCount === 'number' ? fbRes.deletedCount : undefined,
          transactionsDeleted: typeof txRes?.deletedCount === 'number' ? txRes.deletedCount : undefined,
          adminDeleted: !!delAdminRes
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete admin' });
    }
  });

  // Master: update admin (including master) username/password
  app.patch('/api/master/users/admin/:id', async (req, res) => {
    try {
      const key = req.headers['x-master-key'] || req.query.key;
      if (key !== 'master') {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { username, password } = req.body as { username?: string; password?: string };
      const user = await AdminUserModel.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (typeof username === 'string' && username.trim().length > 0) {
        user.username = username.trim();
      }
      if (typeof password === 'string' && password.trim().length > 0) {
        user.password = password.trim();
      }

      try {
        await user.save();
      } catch (e: any) {
        if (e?.code === 11000) {
          return res.status(409).json({ message: 'Username already exists' });
        }
        throw e;
      }

      res.json({ id: user._id.toString(), username: user.username, role: user.role, approved: user.approved });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Master stats: total number of students
  app.get('/api/master/stats', async (req, res) => {
    try {
      const key = req.headers['x-master-key'] || req.query.key;
      if (key !== 'master') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const totalStudents = await StudentModel.countDocuments({});
      res.json({ totalStudents });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Master: update student username/password
  app.patch('/api/master/users/student/:id', async (req, res) => {
    try {
      const key = req.headers['x-master-key'] || req.query.key;
      if (key !== 'master') {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { username, password } = req.body as { username?: string; password?: string };
      const user = await StudentUserModel.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (typeof username === 'string' && username.trim().length > 0) {
        user.username = username.trim().toUpperCase();
      }
      if (typeof password === 'string' && password.trim().length > 0) {
        user.password = password.trim();
      }

      try {
        await user.save();
      } catch (e: any) {
        if (e?.code === 11000) {
          return res.status(409).json({ message: 'Username already exists' });
        }
        throw e;
      }

      res.json({ id: user._id.toString(), username: user.username, role: user.role });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // File upload route: accepts xlsx/csv with columns:
  // Student-name, Register-Number, Section, Batch
  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      const anyReq = req as any;
      if (!anyReq.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const adminId = String((req.headers['x-admin-id'] as string | undefined) || '').trim();

      const workbook = XLSX.read(anyReq.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      let processed = 0;
      let errors = 0;
      const errorDetails: Array<{ row: number; message: string }> = [];

      const toBatchDigits = (batchStr: string): string => {
        const match = batchStr.match(/(\d{4})\s*[-–]\s*(\d{4})/);
        if (!match) return "";
        const y1 = match[1].slice(-2);
        const y2 = match[2].slice(-2);
        return `${y1}${y2}`;
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = String(row['Student-name'] || row['Student Name'] || row['STUDENT-NAME'] || "").trim();
        const registerNumber = String(row['Register-Number'] || row['Register Number'] || row['REGISTER-NUMBER'] || "").trim();
        const section = String(row['Section'] || row['SECTION'] || "").trim();
        const batch = String(row['Batch'] || row['BATCH'] || "").trim();

        if (!name || !registerNumber) {
          errors += 1;
          errorDetails.push({ row: i + 2, message: "Missing Student-name or Register-Number" });
          continue;
        }

        try {
          const studentId = registerNumber.toUpperCase();
          // upsert student by studentId scoped to adminId
          await StudentModel.updateOne(
            adminId ? { studentId, createdBy: adminId } : { studentId },
            {
              $setOnInsert: { points: 0 },
              $set: {
                name,
                section: section || undefined,
                batch: batch || undefined,
                ...(adminId ? { createdBy: adminId } : {})
              },
            },
            { upsert: true }
          );
          // create student login if not exists
          const existingUser = await StudentUserModel.findOne({ username: studentId });
          if (!existingUser) {
            const rawPassword = generatePassword(name, batch);
            const newUser = new StudentUserModel({ username: studentId, password: rawPassword, role: 'student' });
            await newUser.save();
          }
          processed += 1;
        } catch (e: any) {
          errors += 1;
          errorDetails.push({ row: i + 2, message: e?.message || 'Upsert failed' });
        }
      }

      res.json({ success: true, processed, errors, errorDetails });
    } catch (error) {
      res.status(500).json({ message: "Failed to process file" });
    }
  });

  // Confirm upload: accept parsed rows and persist
  app.post('/api/upload/confirm', async (req, res) => {
    try {
      const { students } = req.body as { students?: Array<{ name: string; registerNumber: string; section?: string; batch?: string }> };
      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: 'No students provided' });
      }
      const adminId = String((req.headers['x-admin-id'] as string | undefined) || '').trim();

      const toBatchDigits = (batchStr: string): string => {
        const match = String(batchStr || '').match(/(\d{4})\s*[-–]\s*(\d{4})/);
        if (!match) return "";
        const y1 = match[1].slice(-2);
        const y2 = match[2].slice(-2);
        return `${y1}${y2}`;
      };

      let processed = 0;
      let errors = 0;
      const errorDetails: Array<{ index: number; message: string }> = [];
      const createdOrUpdatedUsernames: string[] = [];

      for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const name = String(s.name || '').trim();
        const registerNumber = String(s.registerNumber || '').trim();
        const section = String(s.section || '').trim();
        const batch = String(s.batch || '').trim();
        if (!name || !registerNumber) {
          errors += 1;
          errorDetails.push({ index: i, message: 'Missing name or registerNumber' });
          continue;
        }
        try {
          const studentId = registerNumber.toUpperCase();
          const writeResult = await StudentModel.updateOne(
            adminId ? { studentId, createdBy: adminId } : { studentId },
            {
              $setOnInsert: { points: 0 },
              $set: { name, section: section || undefined, batch: batch || undefined, ...(adminId ? { createdBy: adminId } : {}) }
            },
            { upsert: true, runValidators: true, setDefaultsOnInsert: true }
          );
          const existingUser = await StudentUserModel.findOne({ username: studentId });
          if (!existingUser) {
            const rawPassword = generatePassword(name, batch);
            const newUser = new StudentUserModel({ username: studentId, password: rawPassword, role: 'student' });
            await newUser.save();
          }
          createdOrUpdatedUsernames.push(studentId);
          processed += 1;
        } catch (e: any) {
          errors += 1;
          errorDetails.push({ index: i, message: e?.message || 'Persist failed' });
        }
      }

      res.json({ success: true, processed, errors, errorDetails, usernames: createdOrUpdatedUsernames });
    } catch (error) {
      res.status(500).json({ message: 'Failed to persist students' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
