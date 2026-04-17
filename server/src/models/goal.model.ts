import mongoose from "mongoose";

export interface IGoal {
  user: mongoose.Types.ObjectId;
  text: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new mongoose.Schema<IGoal>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Goal = mongoose.models.Goal || mongoose.model<IGoal>("Goal", goalSchema);

export default Goal;
