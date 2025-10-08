import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  _id: string;
  studentId: string;
  studentName: string;
  category: 'general' | 'question' | 'concern' | 'suggestion';
  message: string;
  status: 'new' | 'reviewed';
  read: boolean;
  adminId?: string; // Admin who should see this feedback (based on student ownership)
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    enum: ['general', 'question', 'concern', 'suggestion'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['new', 'reviewed'],
    default: 'new'
  },
  read: {
    type: Boolean,
    default: false
  },
  adminId: {
    type: String,
    required: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
FeedbackSchema.index({ studentId: 1 });
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ createdAt: -1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
