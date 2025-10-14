import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  _id: string;
  name: string;
  studentId: string;
  points: number;
  section?: string;
  batch?: string;
  gitLink?: string; // GitHub profile or repository link
  createdBy?: string; // AdminUser _id who created this student
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  studentId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  points: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  section: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
    maxlength: 10
  },
  batch: {
    type: String,
    required: false,
    trim: true,
    maxlength: 20
  },
  gitLink: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  createdBy: {
    type: String,
    required: false,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
StudentSchema.index({ points: -1 });
// Ensure uniqueness of studentId per admin (createdBy)
StudentSchema.index({ createdBy: 1, studentId: 1 }, { unique: true, partialFilterExpression: { createdBy: { $type: 'string' } } });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
