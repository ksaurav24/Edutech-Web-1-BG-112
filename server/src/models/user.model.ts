import mongoose from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  refreshToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiresAt?: Date | null;
  avatar: string | null;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  interests: string[];
  streak: number;
  totalHours: number;
  joinDate: Date;
  theme: "light" | "dark";
  progress: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
    avatar: { type: String, default: null },
    skillLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    interests: { type: [String], default: [] },
    streak: { type: Number, default: 0, min: 0 },
    totalHours: { type: Number, default: 0, min: 0 },
    joinDate: { type: Date, default: Date.now },
    theme: { type: String, enum: ["light", "dark"], default: "dark" },
    progress: {
      type: Map,
      of: { type: Number, min: 0, max: 100 },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
