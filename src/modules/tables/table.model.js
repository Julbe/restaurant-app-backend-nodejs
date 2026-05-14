import mongoose from "mongoose";
const { Schema, model } = mongoose;

const tableSchema = new Schema({
    table: { type: String, required: true, trim: true },
    peopleCount: { type: Number, required: true, min: 1 },
    available: { type: Boolean, default: true },
    code: { type: String, trim: true, unique: true, sparse: true },
}, { timestamps: true });

tableSchema.index({ table: 1, available: 1 });

export const Table = model("Table", tableSchema);
