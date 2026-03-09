import mongoose, { Schema, Document } from "mongoose";

export interface IDiet extends Document {
  title: string;
  category: "weight_loss" | "muscle_gain" | "maintenance" | "general";
  meals: {
    name: string;
    time: string;
    items: string[];
    calories: number;
  }[];
  totalCalories: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const DietSchema = new Schema<IDiet>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["weight_loss", "muscle_gain", "maintenance", "general"],
      default: "general",
    },
    meals: [
      {
        name: { type: String, required: true },
        time: { type: String, required: true },
        items: [{ type: String }],
        calories: { type: Number, required: true, min: 0 },
      },
    ],
    totalCalories: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Diet || mongoose.model<IDiet>("Diet", DietSchema);
