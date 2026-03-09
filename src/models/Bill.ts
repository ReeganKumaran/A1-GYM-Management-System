import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  memberId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  dueDate: Date;
  description: string;
  status: "paid" | "pending" | "overdue";
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["paid", "pending", "overdue"], default: "pending" },
    paymentMethod: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Bill || mongoose.model<IBill>("Bill", BillSchema);
