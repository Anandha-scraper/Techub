import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudentUser extends Document {
  _id: string;
  username: string; // studentId
  password: string;
  role: 'student';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const StudentUserSchema = new Schema<IStudentUser>({
  username: { type: String, required: true, unique: true, trim: true, uppercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student'], default: 'student' }
}, { timestamps: true });

StudentUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) { next(err as Error); }
});

StudentUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const StudentUser = mongoose.model<IStudentUser>('StudentUser', StudentUserSchema);


