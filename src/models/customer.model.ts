import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  surname: string;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomer>("Customer", CustomerSchema);
