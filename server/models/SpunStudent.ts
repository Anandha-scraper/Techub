import mongoose, { Document, Schema } from 'mongoose';

export interface ISpunStudent extends Document {
  _id: string;
  studentId: string;
  name: string;
  adminId?: string; // scope spins per admin
  createdAt: Date;
  updatedAt: Date;
}

const SpunStudentSchema = new Schema<ISpunStudent>({
  studentId: { type: String, required: true, trim: true, uppercase: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  adminId: { type: String, required: false, index: true },
}, { timestamps: true });

// Ensure a student can only be spun once per admin scope
SpunStudentSchema.index({ adminId: 1, studentId: 1 }, { unique: true, partialFilterExpression: { studentId: { $type: 'string' } } });

export const SpunStudent = mongoose.model<ISpunStudent>('SpunStudent', SpunStudentSchema);


