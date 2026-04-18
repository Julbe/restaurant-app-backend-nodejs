import mongoose from "mongoose";
const { Schema, model } = mongoose;

const comboOptionSchema = new Schema({
  dish: { type: Schema.Types.ObjectId, ref: "Dish", required: true },
  extraPrice: { type: Number, default: 0 },
});

const comboSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  group: { type: String },
  options: [comboOptionSchema],
  sides: {
    items: [{ type: Schema.Types.ObjectId, ref: "Side" }],
    minSelect: { type: Number, default: 0 },
    maxSelect: { type: Number, default: 2 },
  },
  minSelect: { type: Number, default: 1 },
  maxSelect: { type: Number, default: 2 }, 
  available: { type: Boolean, default: true },
});

export const Combo = model("Combo", comboSchema);
