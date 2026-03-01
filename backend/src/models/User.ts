import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar_url: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Hash password before saving
// Using modern async/await pattern without the 'next' callback
UserSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  
  try {
    this.password = await bcrypt.hash(this.password!, 10);
  } catch (error: any) {
    throw new Error(error);
  }
});

// Method to check password validity
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
