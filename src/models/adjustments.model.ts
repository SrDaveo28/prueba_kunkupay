import mongoose, { Schema, Document } from "mongoose";

export interface IAdjustment extends Document {
  amount: number;
  createdAt: Date;
}

const AdjustmentSchema = new Schema<IAdjustment>(
  {
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAdjustment>("Adjustments", AdjustmentSchema);
