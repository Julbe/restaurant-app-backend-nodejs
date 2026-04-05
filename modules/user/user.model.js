import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true },
  defaultPassword: { type: String },
  password: { type: String, required: true },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role", // referencia al modelo Role
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    default: null
  },
}, { timestamps: true });

export const UserM = mongoose.model("User", userSchema);
