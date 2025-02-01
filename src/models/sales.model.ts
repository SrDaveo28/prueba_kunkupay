import mongoose, { Schema, Document } from "mongoose";
import { ICustomer } from "./customer.model";

export interface ISales extends Document {
  amount: number;
  status: string;
  customerId: ICustomer["_id"];
  createdAt: Date;
}

const SalesSchema = new Schema<ISales>(
  {
    amount: { type: Number, required: true },
    status: { type: String, required: true, unique: true, enum: ["activo", "pendiente", "imcompleto", "disputada", "completado"] },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISales>("Sales", SalesSchema);
