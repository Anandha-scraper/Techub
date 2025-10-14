import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  _id: string;
  studentId: string;
  date: string; // stored as YYYY-MM-DD
  status: 'present' | 'absent' | 'on-duty';
  adminId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  studentId: { type: String, required: true, trim: true, uppercase: true, index: true },
  date: { type: String, required: true, trim: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  status: { type: String, enum: ['present', 'absent', 'on-duty'], required: true },
  adminId: { type: String, required: false, index: true }
}, { timestamps: true });

// Ensure one record per student per date (optionally per admin scope)
AttendanceSchema.index({ studentId: 1, date: 1, adminId: 1 }, { unique: true, partialFilterExpression: { studentId: { $type: 'string' }, date: { $type: 'string' } } });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);


