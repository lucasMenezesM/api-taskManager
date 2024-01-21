import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creation_date: { type: Date, required: true },
  completed: { type: Boolean, required: true },
  description: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Task", TaskSchema);
