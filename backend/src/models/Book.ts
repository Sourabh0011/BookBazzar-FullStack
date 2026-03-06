import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  author: string;
  price: number | null;
  is_swap: boolean;
  condition: string;
  category: string;
  description?: string;
  image_url?: string;
  created_at: Date;
}

const BookSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, default: null },
    is_swap: { type: Boolean, default: false },
    condition: { type: String, default: "Good" },
    category: { type: String, default: "Other" },
    description: { type: String, default: "" },
    image_url: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model<IBook>("Book", BookSchema);
