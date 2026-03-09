import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  targetRole: "all" | "member" | "user";
  type: "general" | "fee_reminder" | "holiday" | "announcement";
  isRead: boolean;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    targetRole: { type: String, enum: ["all", "member", "user"], default: "all" },
    type: {
      type: String,
      enum: ["general", "fee_reminder", "holiday", "announcement"],
      default: "general",
    },
    isRead: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
