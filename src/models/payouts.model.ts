import mongoose, { Schema, Document } from "mongoose";
import { ISales } from "./sales.model";
import { IAdjustment } from "./adjustments.model";

export interface IPayouts extends Document {
  amount: number;
  status: string;
  saleId: ISales["_id"];
  adjustmentId?: IAdjustment["_id"];
  createdAt: Date;
}

const PayoutsSchema = new Schema<IPayouts>(
  {
    amount: { type: Number, required: true },
    saleId: { type: Schema.Types.ObjectId, ref: "Sales", required: true },
    adjustmentId: { type: Schema.Types.ObjectId, ref: "Adjustments", required: false },
    status: { type: String, required: true, unique: true, enum: ["completado", "pendiente", "fallido"] },
  },
  { timestamps: true }
);

export default mongoose.model<IPayouts>("Payouts", PayoutsSchema);
