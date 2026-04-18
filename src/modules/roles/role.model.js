import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  privileges: {
    type: Object,
    default: {}, // ejemplo: { users: true, dashboard: false }
  },
}, { timestamps: true });

export const Role = mongoose.model("Role", roleSchema);
