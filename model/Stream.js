import mongoose from "mongoose";

const streamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    originalName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Stream", streamSchema);
