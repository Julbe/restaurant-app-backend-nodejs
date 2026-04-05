import mongoose from "mongoose";
const { Schema, model } = mongoose;

const sideSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  available: { type: Boolean, default: true },
  value: { type: Number, default: 1 },
  price: { type: Number, default: 0 },
  extraPrice: { type: Number, default: 0 },
  dishRef: { type: Schema.Types.ObjectId, ref: "Dish" },
});

export const Side = model("Side", sideSchema);
