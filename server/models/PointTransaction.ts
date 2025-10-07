import mongoose, { Document, Schema } from 'mongoose';

export interface IPointTransaction extends Document {
  _id: string;
  studentId: string;
  points: number;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const PointTransactionSchema = new Schema<IPointTransaction>({
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
PointTransactionSchema.index({ studentId: 1 });
PointTransactionSchema.index({ createdAt: -1 });

export const PointTransaction = mongoose.model<IPointTransaction>('PointTransaction', PointTransactionSchema);
