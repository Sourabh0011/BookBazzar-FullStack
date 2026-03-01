import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  book: mongoose.Schema.Types.ObjectId;
  buyer: mongoose.Schema.Types.ObjectId;
  seller: mongoose.Schema.Types.ObjectId;
  type: "purchase" | "swap";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_method: "cash" | "online";
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  created_at: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["purchase", "swap"], default: "purchase" },
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
    payment_method: { type: String, enum: ["cash", "online"], default: "cash" },
    address_line: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
