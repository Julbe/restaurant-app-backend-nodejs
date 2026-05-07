import mongoose from "mongoose";
const { Schema, model } = mongoose;

const comboOptionSchema = new Schema({
  dish: { type: Schema.Types.ObjectId, ref: "Dish", required: true },
  extraPrice: { type: Number, default: 0 },
}, { _id: false });

const comboComponentSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1, min: 0 },
  role: {
    type: String,
    enum: ["main", "side", "drink", "extra", "base"],
    default: "main",
  },
  extraPrice: { type: Number, default: 0 },
}, { _id: false });

const comboSelectionOptionSchema = new Schema({
  label: { type: String, default: "" },
  dishId: { type: Schema.Types.ObjectId, ref: "Dish", default: null },
  productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
  sideId: { type: Schema.Types.ObjectId, ref: "Side", default: null },
  extraPrice: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
}, { _id: false });

const comboSelectionGroupSchema = new Schema({
  key: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  minSelect: { type: Number, default: 0, min: 0 },
  maxSelect: { type: Number, default: 1, min: 0 },
  multiple: { type: Boolean, default: false },
  optionType: {
    type: String,
    enum: ["dish", "product", "side", "mixed"],
    default: "dish",
  },
  options: [comboSelectionOptionSchema],
}, { _id: false });

const comboSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  group: { type: String },
  configurationMode: {
    type: String,
    enum: ["fixed", "selectable"],
    default: "selectable",
  },
  components: [comboComponentSchema],
  selectionGroups: [comboSelectionGroupSchema],
  options: [comboOptionSchema],
  sides: {
    items: [{ type: Schema.Types.ObjectId, ref: "Side" }],
    minSelect: { type: Number, default: 0 },
    maxSelect: { type: Number, default: 2 },
  },
  minSelect: { type: Number, default: 1 },
  maxSelect: { type: Number, default: 2 }, 
  available: { type: Boolean, default: true },
}, { timestamps: true });

export const Combo = model("Combo", comboSchema);
