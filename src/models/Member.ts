import mongoose, { Schema, Document } from "mongoose";

export interface IMember extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: Date;
  packageId?: mongoose.Types.ObjectId;
  status: "active" | "inactive" | "expired";
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    joinDate: { type: Date, default: Date.now },
    packageId: { type: Schema.Types.ObjectId, ref: "Package" },
    status: { type: String, enum: ["active", "inactive", "expired"], default: "active" },
    emergencyContact: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema);
