import mongoose from "mongoose";

const { Schema, model } = mongoose;

const orderCounterSchema = new Schema({
    dateKey: { type: String, required: true, unique: true, index: true },
    seq: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export const OrderCounter = model("OrderCounter", orderCounterSchema);
