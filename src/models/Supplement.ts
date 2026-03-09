import mongoose, { Schema, Document } from "mongoose";

export interface ISupplement extends Document {
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplementSchema = new Schema<ISupplement>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Supplement ||
  mongoose.model<ISupplement>("Supplement", SupplementSchema);
