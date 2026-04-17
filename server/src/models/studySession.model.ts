import mongoose from "mongoose";

export interface IStudySession {
  user: mongoose.Types.ObjectId;
  date: Date;
  subject: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

const studySessionSchema = new mongoose.Schema<IStudySession>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    subject: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
  },
  {
    timestamps: true,
  }
);

const StudySession =
  mongoose.models.StudySession ||
  mongoose.model<IStudySession>("StudySession", studySessionSchema);

export default StudySession;
