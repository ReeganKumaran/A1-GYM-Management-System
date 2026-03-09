import mongoose, { Schema, Document } from "mongoose";

export interface IPackage extends Document {
  name: string;
  duration: number;
  durationUnit: "days" | "months" | "years";
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    durationUnit: { type: String, enum: ["days", "months", "years"], default: "months" },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    features: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Package || mongoose.model<IPackage>("Package", PackageSchema);
